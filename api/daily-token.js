const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_BASE = 'https://api.daily.co/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!DAILY_API_KEY) return res.status(503).json({ error: 'Spaces not configured' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { roomName, userName, userId, asSpeaker } = req.body || {};
  if (!roomName || !userId) return res.status(400).json({ error: 'Missing roomName or userId' });

  const tokRes = await fetch(`${DAILY_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName || 'Listener',
        user_id: userId,
        is_owner: false,
        start_audio_off: !asSpeaker,  // speakers start unmuted
        start_video_off: true,
      },
    }),
  });

  const data = await tokRes.json();
  if (!data.token) return res.status(500).json({ error: 'Failed to create token', detail: data });
  return res.status(200).json({ token: data.token });
}
