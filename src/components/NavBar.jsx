import { useApp } from "../AppContext";
import { supabase } from "../supabase";

export default function NavBar() {
  const {
    go, page, user, isApp, mode, coins, initials, profile,
    search, setSearch, setAuthMode,
    showNotifs, setShowNotifs, unreadNotifs, setUnreadNotifs,
    notifications, liveStreams, formatDbStream, viewChannel,
    switchMode, setPage,
    pushEnabled, pushLoading, enablePushNotifications, disablePushNotifications,
  } = useApp();

  return (
    <>
      {/* NAV */}
      <nav className="nav" style={{ padding: "0 16px" }}>
        <div className="nav-l" style={{ gap: 0 }}>
          <div className="logo" onClick={() => go("disc")} title="Home" style={{ marginRight: 12 }}>STEM</div>
          {/* Non-disc nav tabs — hidden on disc page on desktop (sidebar handles it) */}
          <div className="nav-c" style={{ display: "flex" }}>
            {user ? (
              (mode === "viewer"
                ? [["disc", "Home"], ["leaderboard", "Top"], ["vod", "Replays"], ["clips", "Clips"], ["wallet", "Wallet"], ["profile", "Me"]]
                : [["disc", "Home"], ["dash", "Dashboard"], ["vod", "Replays"], ["wallet", "Wallet"], ["profile", "Me"]]
              ).map(([p, l]) => (
                <button key={p} className={`nl ${page === p || (page === "stream" && p === "disc") ? "on" : ""}`} onClick={() => go(p)}>{l}</button>
              )).concat(user?.email === "blankcoojnr@gmail.com" ? [<button key="admin" className={`nl ${page === "admin" ? "on" : ""}`} style={{ color: "var(--red)" }} onClick={() => setPage("admin")}>Admin</button>] : [])
            ) : (
              <>
                <button className={`nl ${page === "disc" || page === "stream" ? "on" : ""}`} onClick={() => go("disc")}>Home</button>
                {page === "stream" && <button className="nl" onClick={() => go("disc")}>← Back</button>}
              </>
            )}
          </div>
        </div>

        {/* Centered search bar — desktop only */}
        <div className="nav-center">
          <div className="nav-search-wrap">
            <span className="nav-search-icon">🔍</span>
            <input
              placeholder="Search streams, streamers, categories..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (page !== "disc") go("disc"); }}
              onKeyDown={e => { if (e.key === "Escape") setSearch(""); }}
            />
          </div>
        </div>

        <div className="nav-r">
          {user && isApp && <>
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === "viewer" ? "on" : ""}`} onClick={() => switchMode("viewer")}>👁</button>
              <button className={`mode-btn ${mode === "streamer" ? "on" : ""}`} onClick={() => switchMode("streamer")}>🎙</button>
            </div>
            {/* Notification bell */}
            <div style={{ position: "relative", cursor: "pointer", lineHeight: 1 }} onClick={() => { setShowNotifs(v => !v); setUnreadNotifs(0); if (user) supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {}); }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              {unreadNotifs > 0 && (
                <span style={{ position: "absolute", top: -4, right: -5, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </div>
            <div className="coin-badge" onClick={() => go("wallet")}>🪙 {coins.toLocaleString()}</div>
            <div className="av" onClick={() => go("profile")} style={{ padding: 0, overflow: "hidden" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : initials
              }
            </div>
          </>}
          {!user && <>
            <button className="btn-o" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => { setAuthMode("login"); go("auth"); }}>Log in</button>
            <button className="btn-g" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign up</button>
          </>}
        </div>
      </nav>

      {/* NOTIFICATION PANEL */}
      {showNotifs && user && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 299 }} onClick={() => setShowNotifs(false)} />
          <div style={{ position: "fixed", top: 66, right: 12, width: 310, maxWidth: "calc(100vw - 24px)", background: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: 16, zIndex: 300, boxShadow: "0 8px 40px rgba(0,0,0,.6)", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>Notifications</span>
              <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--muted)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No notifications yet</div>
                <div style={{ fontSize: 12 }}>Follow streamers to get notified when they go live</div>
              </div>
            ) : (
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifications.map((n, i) => (
                  <div key={i} onClick={() => { const streamerId = n.data?.streamer_id || n.stream?.user_id; const live = liveStreams.find(s => s.user_id === streamerId); if (live) go("stream", formatDbStream(live)); else if (streamerId) viewChannel(streamerId); setShowNotifs(false); }} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🔴</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, flexShrink: 0, marginTop: 3 }}>Watch →</span>
                  </div>
                ))}
              </div>
            )}
            {"Notification" in window && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                <button
                  onClick={pushEnabled ? disablePushNotifications : enablePushNotifications}
                  disabled={pushLoading}
                  style={{ width: "100%", background: pushEnabled ? "rgba(0,245,160,.08)" : "rgba(124,58,237,.12)", border: pushEnabled ? "1px solid rgba(0,245,160,.25)" : "1px solid rgba(124,58,237,.3)", color: pushEnabled ? "var(--green)" : "var(--purple)", borderRadius: 10, padding: "9px", fontSize: 12, fontWeight: 700, cursor: pushLoading ? "default" : "pointer" }}
                >
                  {pushLoading ? "…" : pushEnabled ? "🔔 Notifications On" : "🔕 Enable Notifications"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* MOBILE BOTTOM NAV */}
      {isApp && (
        <div className="bottom-nav">
          <div className="bottom-nav-items">
            {user ? (
              (mode === "viewer"
                ? [["disc", "🏠", "Home"], ["leaderboard", "🏆", "Top"], ["clips", "✂️", "Clips"], ["wallet", "🪙", "Wallet"], ["profile", "👤", "Me"]]
                : [["disc", "🏠", "Home"], ["dash", "📊", "Dash"], ["clips", "✂️", "Clips"], ["wallet", "🪙", "Wallet"], ["profile", "👤", "Me"]]
              ).map(([p, icon, l]) => {
                const isOn = page === p || (page === "stream" && p === "disc") || (page === "vprofile" && p === "leaderboard");
                return (
                  <button key={p} className={`bn-item ${isOn ? "on" : ""}`} onClick={() => go(p)}>
                    <div style={{ position: "relative", lineHeight: 1 }}>
                      <span className="bn-icon">{icon}</span>
                      {/* Unread notification dot on Home */}
                      {p === "disc" && unreadNotifs > 0 && (
                        <span style={{ position: "absolute", top: -3, right: -5, background: "var(--red)", borderRadius: "50%", width: 8, height: 8, display: "block" }} />
                      )}
                      {/* Coin value badge on Wallet */}
                      {p === "wallet" && coins >= 1000 && (
                        <span style={{ position: "absolute", top: -6, right: -14, background: "var(--gold)", color: "#000", fontSize: 8, fontWeight: 800, borderRadius: 10, padding: "1px 5px", whiteSpace: "nowrap" }}>
                          ${(coins / 1000).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <span className="bn-label">{l}</span>
                  </button>
                );
              }).concat(user?.email === "blankcoojnr@gmail.com" ? [
                <button key="admin" className={`bn-item ${page === "admin" ? "on" : ""}`} onClick={() => setPage("admin")} style={{ color: page === "admin" ? "var(--red)" : "var(--muted)" }}>
                  <span className="bn-icon">⚙️</span><span className="bn-label">Admin</span>
                </button>
              ] : [])
            ) : (
              <>
                <button className={`bn-item ${page === "disc" || page === "stream" ? "on" : ""}`} onClick={() => go("disc")}>
                  <span className="bn-icon">🏠</span>
                  <span className="bn-label">Home</span>
                </button>
                <button className="bn-item" onClick={() => { setAuthMode("login"); go("auth"); }}>
                  <span className="bn-icon">👤</span>
                  <span className="bn-label">Log In</span>
                </button>
                <button className="bn-item" onClick={() => { setAuthMode("signup"); go("auth"); }}>
                  <span className="bn-icon">✨</span>
                  <span className="bn-label">Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
