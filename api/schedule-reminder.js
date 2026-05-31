import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import webpush from 'web-push';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:support@stemapp.online', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export default async function handler(req, res) {
  // Allow GET (cron) or POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  if (!SUPABASE_SERVICE_KEY) return res.status(200).json({ skipped: true });

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Find streams scheduled to start in the next 25-35 minutes
  const now = new Date();
  const from = new Date(now.getTime() + 25 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 35 * 60 * 1000).toISOString();

  const { data: upcoming } = await sb
    .from('stream_schedule')
    .select('id, title, category, scheduled_at, user_id, reminder_sent, profiles(full_name, username)')
    .gte('scheduled_at', from)
    .lte('scheduled_at', to)
    .eq('reminder_sent', false);

  if (!upcoming?.length) return res.status(200).json({ sent: 0 });

  const origin = 'https://www.stemapp.online';
  let totalSent = 0;

  for (const stream of upcoming) {
    const streamerName = stream.profiles?.full_name || stream.profiles?.username || 'A streamer';
    const d = new Date(stream.scheduled_at);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get followers
    const { data: follows } = await sb
      .from('follows')
      .select('follower_id')
      .eq('following_id', stream.user_id);

    if (!follows?.length) {
      await sb.from('stream_schedule').update({ reminder_sent: true }).eq('id', stream.id);
      continue;
    }

    const followerIds = follows.map(f => f.follower_id);

    // Push notifications
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      const { data: pushSubs } = await sb
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', followerIds);

      if (pushSubs?.length) {
        const payload = JSON.stringify({
          title: `⏰ ${streamerName} goes live in 30 min!`,
          body: `"${stream.title}" starts at ${timeStr}`,
          url: `${origin}/?s=${stream.user_id}`,
          streamer_id: stream.user_id,
        });
        await Promise.allSettled(
          pushSubs.map(row =>
            webpush.sendNotification(row.subscription, payload).catch(() => {})
          )
        );
      }
    }

    // Email notifications
    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      const emails = [];
      const batchSize = 50;

      for (let i = 0; i < followerIds.length; i += batchSize) {
        const batch = followerIds.slice(i, i + batchSize);
        await Promise.all(batch.map(async (id) => {
          const { data } = await sb.auth.admin.getUserById(id);
          if (data?.user?.email) emails.push(data.user.email);
        }));
      }

      for (let i = 0; i < emails.length; i += 10) {
        const chunk = emails.slice(i, i + 10);
        await Promise.all(chunk.map(email =>
          resend.emails.send({
            from: 'STEM <onboarding@resend.dev>',
            to: email,
            subject: `⏰ ${streamerName} goes live in 30 minutes!`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0e0e14;color:#fff;border-radius:12px;overflow:hidden">
                <div style="background:linear-gradient(135deg,#7c3aed,#ff2d55);padding:24px;text-align:center">
                  <div style="font-size:32px;margin-bottom:8px">⏰</div>
                  <div style="font-size:22px;font-weight:800;color:#fff">STEM</div>
                </div>
                <div style="padding:28px 24px">
                  <div style="font-size:20px;font-weight:700;margin-bottom:8px">${streamerName} goes live in 30 minutes!</div>
                  <div style="font-size:15px;color:#a0a0b8;margin-bottom:6px">"${stream.title}"</div>
                  <div style="font-size:13px;color:#606080;margin-bottom:24px">${stream.category} · Starting at ${timeStr}</div>
                  <a href="${origin}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ff2d55);color:#fff;text-decoration:none;border-radius:8px;padding:12px 28px;font-size:14px;font-weight:700">Watch Now</a>
                </div>
                <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,.08);font-size:11px;color:#606080;text-align:center">
                  You follow ${streamerName} on STEM · <a href="${origin}" style="color:#7c3aed">stemapp.online</a>
                </div>
              </div>
            `,
          }).catch(() => {})
        ));
        totalSent += chunk.length;
      }
    }

    // Mark reminder sent
    await sb.from('stream_schedule').update({ reminder_sent: true }).eq('id', stream.id);
  }

  return res.status(200).json({ sent: totalSent, streams: upcoming.length });
}
