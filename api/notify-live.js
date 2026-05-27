import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { streamer_id, stream_title, streamer_name } = req.body || {};
  if (!streamer_id || !stream_title || !streamer_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.warn('notify-live: missing SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY — skipping email');
    return res.status(200).json({ sent: 0, skipped: true });
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
      return res.status(200).json({ sent: 0 });
    }

    // Fetch emails in batches of 50 via admin API
    const emails = [];
    const batchSize = 50;
    for (let i = 0; i < followers.length; i += batchSize) {
      const batch = followers.slice(i, i + batchSize).map(f => f.follower_id);
      await Promise.all(batch.map(async (id) => {
        const { data } = await sbAdmin.auth.admin.getUserById(id);
        if (data?.user?.email) emails.push(data.user.email);
      }));
    }

    if (!emails.length) return res.status(200).json({ sent: 0 });

    const resend = new Resend(RESEND_API_KEY);
    const streamUrl = 'https://www.stemapp.online';

    // Send in batches to stay within Resend rate limits
    let sent = 0;
    for (let i = 0; i < emails.length; i += 10) {
      const chunk = emails.slice(i, i + 10);
      await Promise.all(chunk.map(email =>
        resend.emails.send({
          from: 'STEM <notifications@stemapp.online>',
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
                You're receiving this because you follow ${streamer_name} on STEM.<br/>
                <a href="${streamUrl}" style="color:#7c3aed">Manage notifications</a>
              </div>
            </div>
          `,
        }).catch(e => console.error('Email send error:', e.message))
      ));
      sent += chunk.length;
    }

    return res.status(200).json({ sent });
  } catch (err) {
    console.error('notify-live error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
