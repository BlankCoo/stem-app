import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Coin packages: coins → { price in cents, label, bonus }
const PACKAGES = {
  starter:   { coins: 1000,  cents: 99,   label: '1,000 Coins' },
  popular:   { coins: 5500,  cents: 449,  label: '5,500 Coins (+500 bonus)' },
  value:     { coins: 12000, cents: 799,  label: '12,000 Coins (+2,000 bonus)' },
  mega:      { coins: 55000, cents: 2999, label: '55,000 Coins (+5,000 bonus)' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY)
    return res.status(503).json({ error: 'Payments not configured yet' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { packageId } = req.body || {};
  const pkg = PACKAGES[packageId];
  if (!pkg) return res.status(400).json({ error: 'Invalid package' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const origin = req.headers.origin || 'https://stemapp.online';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pkg.cents,
        product_data: {
          name: `STEM — ${pkg.label}`,
          description: `${pkg.coins.toLocaleString()} coins added instantly to your STEM wallet`,
          images: [`${origin}/favicon.svg`],
        },
      },
      quantity: 1,
    }],
    metadata: { user_id: user.id, coins: String(pkg.coins), package_id: packageId },
    success_url: `${origin}/?coins_purchased=${pkg.coins}`,
    cancel_url: `${origin}/?tab=wallet`,
    customer_email: user.email,
  });

  return res.status(200).json({ url: session.url });
}
