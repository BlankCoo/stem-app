import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useApp } from "../AppContext";

export default function AdminPage() {
  const {
    user, adminWithdrawals, loadingAdmin,
    fetchAdminWithdrawals, approveWithdrawal, rejectWithdrawal,
    reports, loadingReports, fetchReports, resolveReport,
  } = useApp();

  const [stats, setStats] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);

  useEffect(() => {
    if (user?.email !== "blankcoojnr@gmail.com") return;
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "streamer"),
      supabase.from("streams").select("id", { count: "exact", head: true }).eq("status", "live"),
      supabase.from("past_streams").select("id", { count: "exact", head: true }),
      supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("withdrawal_requests").select("net_usd").eq("status", "paid"),
      supabase.from("profiles").select("coins"),
    ]).then(([users, streamers, live, past, pendingW, paid, allCoins]) => {
      const totalPaid = (paid.data || []).reduce((s, r) => s + Number(r.net_usd || 0), 0);
      const totalCoins = (allCoins.data || []).reduce((s, r) => s + (r.coins || 0), 0);
      setStats({
        users: users.count || 0,
        streamers: streamers.count || 0,
        liveNow: live.count || 0,
        totalStreams: past.count || 0,
        pendingWithdrawals: pendingW.count || 0,
        totalPaidOut: totalPaid,
        coinsInCirculation: totalCoins,
      });
    });
  }, [user]);

  const searchUsers = async (q) => {
    if (!q.trim()) { setUserResults([]); return; }
    const { data } = await supabase.from("profiles")
      .select("id,full_name,username,email,role,coins,created_at")
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(8);
    setUserResults(data || []);
  };

  if (user?.email !== "blankcoojnr@gmail.com") return null;

  return (
    <div className="admin-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Admin Panel</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Platform management</div>

      {/* Platform Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 24 }}>
          {[
            ["👥", "Total Users", stats.users.toLocaleString()],
            ["🎙", "Streamers", stats.streamers.toLocaleString()],
            ["🔴", "Live Now", stats.liveNow.toLocaleString()],
            ["📺", "Total Streams", stats.totalStreams.toLocaleString()],
            ["⏳", "Pending Payouts", stats.pendingWithdrawals.toLocaleString(), stats.pendingWithdrawals > 0 ? "var(--orange)" : "var(--green)"],
            ["💸", "Paid Out", `$${stats.totalPaidOut.toFixed(2)}`],
            ["🪙", "Coins Circulating", `${(stats.coinsInCirculation / 1000).toFixed(0)}K`],
          ].map(([icon, label, value, color]) => (
            <div key={label} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, color: color || "#fff" }}>{value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* User search */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-hd"><span className="panel-title">🔍 User Lookup</span></div>
        <div style={{ padding: "12px 16px" }}>
          <input
            className="fi"
            style={{ margin: 0 }}
            placeholder="Search by name or username…"
            value={userSearch}
            onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value); }}
          />
          {userResults.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {userResults.map(u => (
                <div key={u.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{u.full_name} <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>@{u.username}</span></div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{u.role} · 🪙 {(u.coins || 0).toLocaleString()} · joined {new Date(u.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", flexShrink: 0 }}>{u.id.slice(0, 8)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">💸 Withdrawal Requests</span>
          <button onClick={fetchAdminWithdrawals} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingAdmin ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : adminWithdrawals.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 13 }}>No withdrawal requests yet.</div>
          </div>
        ) : (
          <div>
            {adminWithdrawals.map(w => {
              const sc = { pending: "var(--orange)", processing: "var(--blue)", paid: "var(--green)", rejected: "var(--red)" };
              const sl = { pending: "Pending", processing: "Processing", paid: "Paid ✓", rejected: "Rejected" };
              return (
                <div key={w.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                        {w.profiles?.full_name || w.profiles?.username || "Unknown"}
                        <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>@{w.profiles?.username}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{w.paypal_email}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {w.amount_coins?.toLocaleString()} coins → <strong style={{ color: "#fff" }}>${Number(w.net_usd).toFixed(2)}</strong>
                        <span style={{ marginLeft: 6, opacity: .6 }}>(fee ${Number(w.fee_usd).toFixed(2)})</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{new Date(w.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc[w.status], background: `${sc[w.status]}18`, border: `1px solid ${sc[w.status]}44`, borderRadius: 20, padding: "3px 12px" }}>
                        {sl[w.status] || w.status}
                      </span>
                      {w.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => approveWithdrawal(w)} style={{ background: "rgba(0,245,160,.12)", border: "1px solid rgba(0,245,160,.3)", color: "var(--green)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>
                          <button onClick={() => rejectWithdrawal(w)} style={{ background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Reports */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-hd">
          <span className="panel-title">⚑ Reports</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 700 }}>{reports.filter(r => r.status === "pending").length} pending</span>
            <button onClick={fetchReports} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
          </div>
        </div>
        {loadingReports ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : reports.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 13 }}>No reports yet.</div>
          </div>
        ) : (
          <div>
            {reports.map(r => {
              const sc = { pending: "var(--orange)", approved: "var(--green)", dismissed: "var(--muted)" };
              const typeIcon = { stream: "📺", message: "💬", user: "👤" };
              return (
                <div key={r.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{typeIcon[r.type] || "⚑"}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: .5 }}>{r.type} report</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc[r.status], background: `${sc[r.status]}18`, border: `1px solid ${sc[r.status]}44`, borderRadius: 20, padding: "2px 10px" }}>{r.status}</span>
                      </div>
                      {r.target_meta?.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.target_meta.title}</div>}
                      {r.target_meta?.author && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>From: {r.target_meta.author}</div>}
                      {r.target_meta?.message && <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", marginBottom: 4 }}>"{r.target_meta.message}"</div>}
                      <div style={{ fontSize: 13, color: "#fff", marginBottom: 4 }}>{r.reason}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => resolveReport(r.id, "approved")} style={{ background: "rgba(0,245,160,.12)", border: "1px solid rgba(0,245,160,.3)", color: "var(--green)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Approve</button>
                        <button onClick={() => resolveReport(r.id, "dismissed")} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
