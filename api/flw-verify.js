import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

const PACKAGES = {
  starter: { coins: 1000,  ngn: 1500,  label: '1,000 Coins' },
  popular: { coins: 5500,  ngn: 7000,  label: '5,500 Coins' },
  value:   { coins: 12000, ngn: 13000, label: '12,000 Coins' },
  mega:    { coins: 55000, ngn: 50000, label: '55,000 Coins' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!FLW_SECRET_KEY)
    return res.status(503).json({ error: 'Payments not configured yet' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { transactionId, packageId } = req.body || {};
  if (!transactionId || !packageId) return res.status(400).json({ error: 'Missing parameters' });

  const pkg = PACKAGES[packageId];
  if (!pkg) return res.status(400).json({ error: 'Invalid package' });

  // Verify caller is a real authenticated user
  const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: authErr } = await userSupabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Verify transaction with Flutterwave
  let flwData;
  try {
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );
    flwData = await flwRes.json();
  } catch {
    return res.status(502).json({ error: 'Could not reach payment provider' });
  }

  if (flwData.status !== 'success' || flwData.data?.status !== 'successful')
    return res.status(400).json({ error: 'Payment not successful' });

  // Amount check — must be at least what was expected (allow ±1% for rounding)
  const paidNgn = flwData.data.amount;
  if (paidNgn < pkg.ngn * 0.99)
    return res.status(400).json({ error: 'Amount mismatch — please contact support' });

  // Currency must be NGN
  if (flwData.data.currency !== 'NGN')
    return res.status(400).json({ error: 'Invalid currency' });

  const serviceSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Idempotency — prevent double-credit for the same transaction
  const idempotencyKey = `FLW-${transactionId}`;
  const { data: existing } = await serviceSupabase
    .from('transactions')
    .select('id')
    .eq('description', idempotencyKey)
    .maybeSingle();

  if (existing) return res.status(409).json({ error: 'Transaction already processed' });

  // Credit coins
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  await serviceSupabase
    .from('profiles')
    .update({ coins: (profile.coins || 0) + pkg.coins })
    .eq('id', user.id);

  await serviceSupabase.from('transactions').insert({
    user_id: user.id,
    type: 'coins_purchased',
    amount: pkg.coins,
    description: idempotencyKey,
  });

  return res.status(200).json({
    coins: pkg.coins,
    message: `${pkg.coins.toLocaleString()} coins added to your wallet!`,
  });
}
