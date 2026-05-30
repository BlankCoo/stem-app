import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Only callable from admin (verify caller is admin email)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).end();

  const sb = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (user?.email !== 'blankcoojnr@gmail.com') return res.status(403).end();

  const { withdrawalId, status } = req.body || {};
  if (!withdrawalId || !['paid', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  if (!RESEND_API_KEY) return res.status(200).json({ sent: false, reason: 'No Resend key' });

  // Fetch withdrawal + user email
  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
  const { data: w } = await sbAdmin
    .from('withdrawal_requests')
    .select('net_usd, amount_coins, paypal_email, user_id')
    .eq('id', withdrawalId)
    .single();

  if (!w) return res.status(404).json({ error: 'Withdrawal not found' });

  const { data: authUser } = await sbAdmin.auth.admin.getUserById(w.user_id);
  const email = authUser?.user?.email;
  if (!email) return res.status(200).json({ sent: false, reason: 'No email found' });

  const resend = new Resend(RESEND_API_KEY);
  const isPaid = status === 'paid';
  const origin = 'https://www.stemapp.online';

  await resend.emails.send({
    from: 'STEM <onboarding@resend.dev>',
    to: email,
    subject: isPaid
      ? `✅ Your $${Number(w.net_usd).toFixed(2)} withdrawal has been paid!`
      : `❌ Your withdrawal request was rejected`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0e0e14;color:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,${isPaid ? '#059669,#00f5a0' : '#dc2626,#ff6b35'});padding:24px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">${isPaid ? '✅' : '❌'}</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:1px;color:#fff">STEM</div>
        </div>
        <div style="padding:28px 24px">
          <div style="font-size:20px;font-weight:700;margin-bottom:12px">
            ${isPaid ? 'Your withdrawal has been paid!' : 'Your withdrawal was rejected'}
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:20px">
            <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:4px">Amount</div>
            <div style="font-size:24px;font-weight:800;color:${isPaid ? '#00f5a0' : '#ff6b35'}">$${Number(w.net_usd).toFixed(2)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px">${w.amount_coins.toLocaleString()} coins · PayPal: ${w.paypal_email}</div>
          </div>
          ${isPaid
            ? `<div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:20px">
                Payment has been sent to your PayPal account. It should arrive within minutes. Check your PayPal inbox at <strong>${w.paypal_email}</strong>.
               </div>`
            : `<div style="font-size:14px;color:rgba(255,255,255,0.7);margin-bottom:20px">
                Your withdrawal was not processed and your <strong>${w.amount_coins.toLocaleString()} coins have been refunded</strong> to your STEM wallet.
                If you believe this was an error, please reply to this email or contact <a href="mailto:support@stemapp.online" style="color:#7c3aed">support@stemapp.online</a>.
               </div>`
          }
          <a href="${origin}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ff2d55);color:#fff;text-decoration:none;border-radius:8px;padding:12px 28px;font-size:14px;font-weight:700">
            ${isPaid ? 'Back to STEM' : 'View My Wallet'}
          </a>
        </div>
        <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,.08);font-size:11px;color:#606080;text-align:center">
          STEM · stemapp.online · <a href="mailto:support@stemapp.online" style="color:#7c3aed">support@stemapp.online</a>
        </div>
      </div>
    `,
  });

  return res.status(200).json({ sent: true });
}
