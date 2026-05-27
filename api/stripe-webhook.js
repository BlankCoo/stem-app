import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status !== 'paid') return res.status(200).json({ received: true });

    const { user_id, coins } = session.metadata || {};
    if (!user_id || !coins) return res.status(200).json({ received: true });

    const coinAmount = parseInt(coins, 10);
    if (!coinAmount || coinAmount < 1) return res.status(200).json({ received: true });

    // Use service role key to bypass RLS for server-side credit
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data: profile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user_id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ coins: (profile.coins || 0) + coinAmount })
        .eq('id', user_id);

      const usdPaid = (session.amount_total / 100).toFixed(2);
      await supabase.from('transactions').insert({
        user_id,
        type: 'coins_purchased',
        amount: coinAmount,
        description: `Purchased ${coinAmount.toLocaleString()} coins for $${usdPaid}`,
      });
    }
  }

  return res.status(200).json({ received: true });
}
