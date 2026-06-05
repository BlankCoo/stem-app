import { createClient } from '@supabase/supabase-js';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_BASE = 'https://api.daily.co/v1';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const dailyHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${DAILY_API_KEY}`,
};

export default async function handler(req, res) {
  if (!DAILY_API_KEY) return res.status(503).json({ error: 'Spaces not configured — add DAILY_API_KEY to env vars' });

  // ── POST /api/daily-room  →  create space + return host token ──────────
  if (req.method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { title, hostName, hostId } = req.body || {};
    if (!title || !hostId) return res.status(400).json({ error: 'Missing title or hostId' });

    const roomName = `stem-${hostId.slice(0, 8)}-${Date.now()}`;

    // Create Daily room (audio-only, cloud recording on)
    const roomRes = await fetch(`${DAILY_BASE}/rooms`, {
      method: 'POST',
      headers: dailyHeaders,
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_recording: 'cloud',
          max_participants: 500,
          exp: Math.floor(Date.now() / 1000) + 86400,
          start_audio_off: true,  // everyone starts muted
          start_video_off: true,  // audio only
        },
      }),
    });
    const room = await roomRes.json();
    if (!room.url) return res.status(500).json({ error: 'Failed to create Daily room', detail: room });

    // Host token (is_owner = true → can update other participants' permissions)
    const tokRes = await fetch(`${DAILY_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: dailyHeaders,
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: hostName,
          user_id: hostId,
          is_owner: true,
          start_audio_off: false,  // host starts unmuted
          start_video_off: true,
          enable_recording: 'cloud',
        },
      }),
    });
    const { token: hostToken } = await tokRes.json();

    // Persist space to Supabase (service role so no RLS)
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    const { data: space, error } = await sb
      .from('spaces')
      .insert({ host_id: hostId, title, room_name: roomName, room_url: room.url, status: 'live' })
      .select()
      .single();

    if (error) {
      await fetch(`${DAILY_BASE}/rooms/${roomName}`, { method: 'DELETE', headers: dailyHeaders });
      return res.status(500).json({ error: 'DB insert failed', detail: error.message });
    }

    return res.status(200).json({ space, token: hostToken });
  }

  // ── DELETE /api/daily-room  →  end space ───────────────────────────────
  if (req.method === 'DELETE') {
    const { roomName, spaceId, recordingId } = req.body || {};
    if (!roomName || !spaceId) return res.status(400).json({ error: 'Missing roomName or spaceId' });

    // Delete Daily room
    await fetch(`${DAILY_BASE}/rooms/${roomName}`, { method: 'DELETE', headers: dailyHeaders });

    // Fetch recording access link if we have a recording ID
    let recordingUrl = null;
    if (recordingId) {
      const recRes = await fetch(`${DAILY_BASE}/recordings/${recordingId}/access-link`, { headers: dailyHeaders });
      if (recRes.ok) {
        const recData = await recRes.json();
        recordingUrl = recData.download_link || null;
      }
    }

    // Mark space as ended
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    await sb.from('spaces').update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      ...(recordingUrl && { recording_url: recordingUrl }),
      ...(recordingId && { recording_id: recordingId }),
    }).eq('id', spaceId);

    // Mark all participants as left
    await sb.from('space_participants').update({ left_at: new Date().toISOString() })
      .eq('space_id', spaceId).is('left_at', null);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
