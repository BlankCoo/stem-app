import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const sbAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getUserId(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await sb.auth.getUser();
  return user?.id || null;
}

export default async function handler(req, res) {
  const userId = await getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "POST") {
    const { subscription } = req.body || {};
    if (!subscription?.endpoint) return res.status(400).json({ error: "Invalid subscription" });
    const { error } = await sbAdmin
      .from("push_subscriptions")
      .upsert({ user_id: userId, subscription }, { onConflict: "user_id" });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    await sbAdmin.from("push_subscriptions").delete().eq("user_id", userId);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
