import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Service role key required — bypasses RLS for server-side writes
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyMuxSignature(rawBody, headers, secret) {
  const sigHeader = headers['mux-signature'];
  if (!sigHeader) throw new Error('Missing Mux-Signature header');
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
  const { t, v1 } = parts;
  if (!t || !v1) throw new Error('Invalid signature format');
  const hmac = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1))) throw new Error('Signature mismatch');
  if (Math.abs(Date.now() / 1000 - parseInt(t)) > 300) throw new Error('Timestamp too old');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);

  if (process.env.MUX_WEBHOOK_SECRET) {
    try {
      verifyMuxSignature(rawBody, req.headers, process.env.MUX_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { type, data } = event;

  // Recording is ready — update past_streams with the VOD playback ID
  if (type === 'video.asset.live_stream_completed') {
    const muxStreamId = data.live_stream_id;
    const vodPlaybackId = data.playback_ids?.[0]?.id;

    if (muxStreamId && vodPlaybackId) {
      const { data: ps } = await supabase
        .from('past_streams')
        .select('id')
        .eq('mux_stream_id', muxStreamId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ps?.id) {
        await supabase
          .from('past_streams')
          .update({ mux_playback_id: vodPlaybackId })
          .eq('id', ps.id);
      }
    }
  }

  return res.status(200).json({ received: true });
}
