import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || process.env.VITE_MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET || process.env.VITE_MUX_TOKEN_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      latency_mode: 'low',
    });

    return res.status(200).json({
      streamId: liveStream.id,
      streamKey: liveStream.stream_key,
      playbackId: liveStream.playback_ids?.[0]?.id,
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
    });
  } catch (err) {
    console.error('Mux create error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create stream' });
  }
}
