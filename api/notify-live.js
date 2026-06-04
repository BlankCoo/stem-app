import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import webpush from 'web-push';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:support@stemapp.online', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { streamer_id, stream_title, streamer_name } = req.body || {};
  if (!streamer_id || !stream_title || !streamer_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('notify-live: missing SUPABASE_SERVICE_ROLE_KEY — cannot query followers');
    return res.status(200).json({ sent: 0, push: 0, skipped: true });
  }

  try {
    const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all follower IDs
    const { data: followers, error: fErr } = await sbAdmin
      .from('follows')
      .select('follower_id')
      .eq('following_id', streamer_id);

    if (fErr || !followers?.length) {
      return res.status(200).json({ sent: 0, push: 0 });
    }

    const followerIds = followers.map(f => f.follower_id);
    const streamUrl = `https://www.stemapp.online/?s=${streamer_id}`;

    // ── Push notifications (runs even when no emails) ──────────────
    let pushSent = 0;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      const { data: pushSubs } = await sbAdmin
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', followerIds);

      if (pushSubs?.length) {
        const payload = JSON.stringify({
          title: `🔴 ${streamer_name} is live!`,
          body: stream_title,
          url: streamUrl,
          streamer_id: streamer_id,
        });
        const results = await Promise.allSettled(
          pushSubs.map(row =>
            webpush.sendNotification(row.subscription, payload).catch(err => {
              if (err.statusCode === 410 || err.statusCode === 404) {
                // Expired subscription — clean it up
                sbAdmin.from('push_subscriptions').delete().eq('subscription->>endpoint', row.subscription.endpoint).then(() => {});
              }
            })
          )
        );
        pushSent = results.filter(r => r.status === 'fulfilled').length;
      }
    }

    // ── Email notifications ────────────────────────────────────────
    if (!RESEND_API_KEY) {
      return res.status(200).json({ sent: 0, push: pushSent });
    }

    // Only email followers who have opted in to go-live notifications
    const { data: optedInProfiles } = await sbAdmin
      .from('profiles')
      .select('id')
      .in('id', followerIds)
      .eq('email_notifications', true);

    const optedInIds = (optedInProfiles || []).map(p => p.id);
    if (!optedInIds.length) return res.status(200).json({ sent: 0, push: pushSent });

    const emails = [];
    const batchSize = 50;
    for (let i = 0; i < optedInIds.length; i += batchSize) {
      const batch = optedInIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (id) => {
        const { data } = await sbAdmin.auth.admin.getUserById(id);
        if (data?.user?.email) emails.push(data.user.email);
      }));
    }

    if (!emails.length) return res.status(200).json({ sent: 0, push: pushSent });

    const resend = new Resend(RESEND_API_KEY);

    let sent = 0;
    for (let i = 0; i < emails.length; i += 10) {
      const chunk = emails.slice(i, i + 10);
      await Promise.all(chunk.map(email =>
        resend.emails.send({
          from: 'STEM <noreply@stemapp.online>',
          to: email,
          subject: `🔴 ${streamer_name} is live on STEM!`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0e0e14;color:#fff;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#7c3aed,#ff2d55);padding:24px;text-align:center">
                <div style="font-size:32px;margin-bottom:8px">🔴</div>
                <div style="font-size:22px;font-weight:800;letter-spacing:1px">STEM</div>
              </div>
              <div style="padding:28px 24px">
                <div style="font-size:20px;font-weight:700;margin-bottom:8px">${streamer_name} is live!</div>
                <div style="font-size:15px;color:#a0a0b8;margin-bottom:24px">${stream_title}</div>
                <a href="${streamUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ff2d55);color:#fff;text-decoration:none;border-radius:8px;padding:12px 28px;font-size:14px;font-weight:700">Watch Now</a>
              </div>
              <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,.08);font-size:11px;color:#606080;text-align:center">
                You're receiving this because you follow ${streamer_name} on STEM · <a href="${streamUrl}" style="color:#7c3aed">stemapp.online</a>
              </div>
            </div>
          `,
        }).catch(e => console.error('Email send error:', e.message))
      ));
      sent += chunk.length;
    }

    return res.status(200).json({ sent, push: pushSent });
  } catch (err) {
    console.error('notify-live error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
