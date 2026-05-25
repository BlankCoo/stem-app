import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === 'true'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const MIN_COINS = 20000;
const FEE_RATE = 0.02;
const COINS_PER_USD = 1000;

async function getPayPalToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { amountCoins, paypalEmail } = req.body || {};

  if (!amountCoins || !paypalEmail)
    return res.status(400).json({ error: 'Missing required fields' });
  if (amountCoins < MIN_COINS)
    return res.status(400).json({ error: `Minimum withdrawal is ${MIN_COINS.toLocaleString()} coins ($${MIN_COINS / COINS_PER_USD})` });
  if (!paypalEmail.includes('@'))
    return res.status(400).json({ error: 'Invalid PayPal email address' });

  // Auth: create client using user's JWT so RLS applies
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Verify balance server-side
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single();
  if (!profile) return res.status(400).json({ error: 'Profile not found' });
  if (profile.coins < amountCoins) return res.status(400).json({ error: 'Insufficient coins' });

  const grossUsd = amountCoins / COINS_PER_USD;
  const feeUsd   = parseFloat((grossUsd * FEE_RATE).toFixed(2));
  const netUsd   = parseFloat((grossUsd - feeUsd).toFixed(2));

  // Deduct coins
  const { error: deductErr } = await supabase
    .from('profiles')
    .update({ coins: profile.coins - amountCoins })
    .eq('id', user.id);
  if (deductErr) return res.status(500).json({ error: 'Failed to process withdrawal' });

  // Create withdrawal request record
  const { data: withdrawal, error: wErr } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: user.id,
      amount_coins: amountCoins,
      amount_usd: grossUsd,
      fee_usd: feeUsd,
      net_usd: netUsd,
      paypal_email: paypalEmail,
      status: 'pending',
    })
    .select()
    .single();

  if (wErr) {
    // Refund coins if record creation failed
    await supabase.from('profiles').update({ coins: profile.coins }).eq('id', user.id);
    return res.status(500).json({ error: 'Failed to record withdrawal' });
  }

  // Log in transaction history
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'withdrawal',
    amount: amountCoins,
    description: `Withdrew $${netUsd.toFixed(2)} to PayPal (${paypalEmail})`,
  });

  // Attempt PayPal payout if credentials are configured
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      const accessToken = await getPayPalToken();
      const payoutRes = await fetch(`${PAYPAL_BASE}/v1/payments/payouts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: `STEM_${withdrawal.id}`,
            email_subject: 'Your STEM earnings have arrived!',
            email_message: `Your withdrawal of $${netUsd.toFixed(2)} from STEM has been processed. Thank you!`,
          },
          items: [{
            recipient_type: 'EMAIL',
            amount: { value: netUsd.toFixed(2), currency: 'USD' },
            receiver: paypalEmail,
            note: `STEM payout — ${amountCoins.toLocaleString()} coins redeemed`,
            sender_item_id: withdrawal.id,
          }],
        }),
      });

      const payoutData = await payoutRes.json();
      const batchId = payoutData.batch_header?.payout_batch_id;

      if (batchId) {
        await supabase
          .from('withdrawal_requests')
          .update({ status: 'processing', payout_id: batchId })
          .eq('id', withdrawal.id);

        return res.status(200).json({
          success: true,
          status: 'processing',
          netUsd,
          message: `$${netUsd.toFixed(2)} sent to ${paypalEmail} via PayPal — arrives within minutes.`,
        });
      }
    } catch (err) {
      console.error('PayPal payout error:', err);
      // Fall through to pending — don't fail the withdrawal
    }
  }

  // No PayPal credentials or payout failed — queued for manual processing
  return res.status(200).json({
    success: true,
    status: 'pending',
    netUsd,
    message: `Withdrawal of $${netUsd.toFixed(2)} submitted — processed within 24 hours to ${paypalEmail}.`,
  });
}
