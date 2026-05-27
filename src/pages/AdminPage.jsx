import { useApp } from "../AppContext";

export default function AdminPage() {
  const {
    user, adminWithdrawals, loadingAdmin,
    fetchAdminWithdrawals, approveWithdrawal, rejectWithdrawal,
  } = useApp();

  if (user?.email !== "blankcoojnr@gmail.com") return null;

  return (
    <div className="admin-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Admin Panel</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Manage withdrawal requests</div>
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
    </div>
  );
}
