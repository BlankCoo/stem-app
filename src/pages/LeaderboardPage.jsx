import { useApp } from "../AppContext";

export default function LeaderboardPage() {
  const {
    go, profile, coins, firstName, mode,
    leaderboard, topSupporters, loadingLb, lbTab, setLbTab,
    fetchLeaderboard, viewVProfile, rankColor, rankEmoji,
    DEMO_STREAMS,
  } = useApp();

  return (
    <div className="leaderboard-page page">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Leaderboard</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Top viewers on STEM</div>
      </div>
      {profile && (
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.08),rgba(255,45,85,.06))", border: "1px solid rgba(124,58,237,.2)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ fontSize: 24 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>Your coins</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{firstName} — 🪙 {coins.toLocaleString()}</div>
            {profile.role === "streamer" && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Streamers don't appear on the viewer leaderboard</div>}
          </div>
          <button className="btn-g" onClick={() => go("stream", DEMO_STREAMS[0])}>Earn More</button>
        </div>
      )}
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["earners", "🏆 Top Earners"], ["supporters", "🎁 Top Supporters"]].map(([t, label]) => (
          <button key={t} onClick={() => setLbTab(t)} style={{ background: lbTab === t ? "rgba(255,255,255,.08)" : "none", border: "1px solid " + (lbTab === t ? "var(--line2)" : "transparent"), color: lbTab === t ? "#fff" : "var(--muted)", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">{lbTab === "earners" ? "🏆 Most Coins" : "🎁 Most Coins Spent"}</span>
          <button onClick={fetchLeaderboard} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingLb ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : lbTab === "earners" ? (
          leaderboard.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}><div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>No data yet — start watching to earn coins!</div>
          ) : leaderboard.map((u, i) => (
            <div key={u.id} className="lb-row" style={{ cursor: "pointer" }} onClick={() => viewVProfile(u.id)}>
              <div className="lb-rank" style={{ color: rankColor(i) }}>{rankEmoji(i)}</div>
              <div className="lb-av" style={{ overflow: "hidden", padding: 0 }}>
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : (u.full_name?.charAt(0) || "?")
                }
              </div>
              <div style={{ flex: 1 }}>
                <div className="lb-name">{u.full_name || "Anonymous"}</div>
                <div className="lb-role">👁 Viewer · @{u.username}</div>
              </div>
              <div className="lb-coins">🪙 {(u.coins || 0).toLocaleString()}</div>
            </div>
          ))
        ) : (
          topSupporters.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}><div style={{ fontSize: 32, marginBottom: 12 }}>🎁</div>No supporters yet — send a gift or superchat to appear here!</div>
          ) : topSupporters.map((u, i) => (
            <div key={u.user_id} className="lb-row" style={{ cursor: "pointer" }} onClick={() => viewVProfile(u.user_id)}>
              <div className="lb-rank" style={{ color: rankColor(i) }}>{rankEmoji(i)}</div>
              <div className="lb-av" style={{ overflow: "hidden", padding: 0 }}>
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : (u.full_name?.charAt(0) || "?")
                }
              </div>
              <div style={{ flex: 1 }}>
                <div className="lb-name">{u.full_name || "Anonymous"}</div>
                <div className="lb-role">🎁 Supporter · @{u.username}</div>
              </div>
              <div className="lb-coins" style={{ color: "var(--purple)" }}>🪙 {(u.total_spent || 0).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
