import { useApp } from "../AppContext";

export default function ViewerProfilePage() {
  const {
    setPage, vProfile, vProfileTxns, loadingVProfile,
    ACHIEVEMENTS,
  } = useApp();

  return (
    <div className="vprofile-page page">
      {loadingVProfile ? (
        <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : vProfile ? (() => {
        const vInitials = vProfile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
        const vCoins = vProfile.coins || 0;
        const vStreak = vProfile.streak_days || 0;
        const badges = [];
        if (vCoins >= 100000) badges.push(["🏆", "Whale", "#ffc800", "rgba(255,200,0,.12)"]);
        if (vCoins >= 10000)  badges.push(["💰", "High Roller", "#00f5a0", "rgba(0,245,160,.1)"]);
        if (vStreak >= 14)    badges.push(["🔥", "Streak Legend", "#ff9500", "rgba(255,149,0,.12)"]);
        if (vStreak >= 7)     badges.push(["🔥", "On Fire", "#ff9500", "rgba(255,149,0,.1)"]);
        if (vStreak >= 3)     badges.push(["✨", "Consistent", "#7c3aed", "rgba(124,58,237,.12)"]);
        if (vCoins >= 1500 && vCoins < 5000) badges.push(["🌱", "Growing", "#00f5a0", "rgba(0,245,160,.1)"]);
        return (<>
          <button onClick={() => setPage("disc")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 5 }}>← Back</button>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,var(--purple),var(--red))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, margin: "0 auto 14px", overflow: "hidden" }}>
              {vProfile.avatar_url
                ? <img src={vProfile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : vInitials
              }
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{vProfile.full_name || "Viewer"}</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>@{vProfile.username || "unknown"}</div>
            {vProfile.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", maxWidth: 360, margin: "0 auto 10px" }}>{vProfile.bio}</div>}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,245,160,.1)", border: "1px solid rgba(0,245,160,.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "var(--green)" }}>👁 Viewer</div>
          </div>
          {/* Stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 22 }}>
            {[["🪙", vCoins.toLocaleString(), "Coins"], ["🔥", `${vStreak}d`, "Streak"], ["💸", `$${(vCoins/1000).toFixed(2)}`, "Value"]].map(([icon, v, l]) => (
              <div key={l} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22 }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Badges */}
          {badges.length > 0 && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-hd"><span className="panel-title">🏅 Badges</span></div>
              <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {badges.map(([icon, label, color, bg]) => (
                  <span key={label} className="badge-chip" style={{ background: bg, border: `1px solid ${color}44`, color }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Achievements */}
          {vProfile._achievements?.size > 0 && (
            <div className="panel" style={{ marginBottom: 16 }}>
              <div className="panel-hd"><span className="panel-title">🏆 Achievements</span><span style={{ fontSize: 12, color: "var(--muted)" }}>{vProfile._achievements.size} earned</span></div>
              <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(ACHIEVEMENTS).filter(([k]) => vProfile._achievements.has(k)).map(([k, a]) => (
                  <span key={k} title={a.desc} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,200,0,.08)", border: "1px solid rgba(255,200,0,.22)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>{a.emoji} {a.label}</span>
                ))}
              </div>
            </div>
          )}
          {/* Recent activity */}
          {vProfileTxns.length > 0 && (
            <div className="panel">
              <div className="panel-hd"><span className="panel-title">📋 Recent Activity</span></div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {vProfileTxns.slice(0, 15).map(t => {
                  const icons = { watch: "📺", chat: "💬", gift_sent: "🎁", follow: "➕", clip: "✂", signup_bonus: "🎉", referral_bonus: "🎁" };
                  const isOut = t.amount < 0 || t.type === "gift_sent";
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[t.type] || "🪙"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || t.type}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isOut ? "var(--red)" : "var(--green)", flexShrink: 0 }}>{isOut ? "-" : "+"}{Math.abs(t.amount).toLocaleString()} 🪙</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>);
      })() : (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Profile not found</div>
      )}
    </div>
  );
}
