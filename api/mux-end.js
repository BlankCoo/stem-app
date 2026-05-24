import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { muxStreamId } = req.body || {};
  if (!muxStreamId) {
    return res.status(400).json({ error: 'Missing muxStreamId' });
  }

  try {
    await mux.video.liveStreams.disable(muxStreamId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mux end error:', err);
    // Don't hard-fail — stream may already be ended
    return res.status(200).json({ success: true, warning: err.message });
  }
}
