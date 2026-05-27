import { useApp } from "../AppContext";
import { supabase } from "../supabase";

// LiveCard is defined at module scope so it can be reused in multiple render contexts
function LiveCard({ s }) {
  const { go, viewChannel, setCat } = useApp();
  return (
    <div className="lgc" onClick={() => go("stream", s)}>
      <div className="lgc-thumb">
        {s.thumbnail_url
          ? <img src={s.thumbnail_url} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />
          : <div className="lgc-bg" style={{ background: `linear-gradient(${s.bg})` }} />
        }
        <div className="lgc-ov" />
        <span className="lgc-emoji">{s.emoji}</span>
        <span className="lgc-live-badge"><span className="lgc-live-dot" />LIVE</span>
        <span className="lgc-viewers-badge">👁 {s.viewers.toLocaleString()}</span>
      </div>
      <div className="lgc-body">
        <div className="lgc-row">
          <div className="lgc-av" style={{ background: s.color }}>{s.emoji}</div>
          <div className="lgc-info">
            <div className="lgc-title" title={s.title}>{s.title}</div>
            <div className="lgc-name"
              style={{ cursor: s.isRealStream && s.user_id ? "pointer" : "default", textDecoration: s.isRealStream && s.user_id ? "underline" : "none", textDecorationColor: "rgba(255,255,255,.2)" }}
              onClick={s.isRealStream && s.user_id ? (e) => { e.stopPropagation(); viewChannel(s.user_id); } : undefined}
            >{s.streamer}</div>
            <span className="lgc-cat" onClick={e => { e.stopPropagation(); setCat(s.game); }}>{s.game}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const {
    go, viewChannel, formatDbStream, liveStreams, myFollows, followedStreamers,
    cat, setCat, search, setSearch, allStreams, filteredStreams,
    discoverSort, setDiscoverSort, discTab, setDiscTab,
    upcomingSchedule, allClips, myClipVotes, voteClip,
    featuredPreds, user, mode, setAuthMode, notify,
    CAT_META, searchProfiles, page, setShowGoLive, DEMO_STREAMS,
  } = useApp();

  // Sidebar channel list
  const sidebarLive = liveStreams.filter(s => myFollows.includes(s.user_id));
  const sidebarOffline = followedStreamers.filter(sp => !liveStreams.some(s => s.user_id === sp.id));
  const sidebarRec = liveStreams.slice(0, 8);
  const showFollowing = user && (sidebarLive.length > 0 || sidebarOffline.length > 0);

  return (
    <div className="disc-root" style={{ paddingTop: 56 }}>

      {/* ── SIDEBAR ── */}
      <div className="disc-sb">
        {/* Sidebar nav items */}
        {user && (
          <>
            {(mode === "viewer"
              ? [["disc","🏠","Home"],["leaderboard","🏆","Top Earners"],["clips","✂️","Clips"],["wallet","🪙","Wallet"],["profile","👤","Profile"]]
              : [["disc","🏠","Home"],["dash","📊","Dashboard"],["clips","✂️","Clips"],["wallet","🪙","Wallet"],["profile","👤","Profile"]]
            ).map(([p,ic,l]) => (
              <div key={p} className={`sb-nav-item ${page === p || (p==="disc" && page==="stream") ? "on" : ""}`} onClick={() => go(p)}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <span>{l}</span>
              </div>
            ))}
            <div className="sb-divider" />
          </>
        )}

        {/* Following channels */}
        {showFollowing && (
          <>
            <div className="sb-hd">Following</div>
            {sidebarLive.map(s => {
              const fs = formatDbStream(s);
              const ini = s.profiles?.full_name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
              return (
                <div key={s.id} className="sb-ch" onClick={() => go("stream", fs)}>
                  <div className="sb-ch-av" style={{ background: `linear-gradient(135deg,${fs.color}99,${fs.color}44)` }}>
                    {ini}
                    <span className="sb-live-dot" />
                  </div>
                  <div className="sb-ch-info">
                    <div className="sb-ch-name">{s.profiles?.full_name || s.profiles?.username || "Creator"}</div>
                    <div className="sb-ch-sub">{s.category || "Streaming"}</div>
                  </div>
                  <div className="sb-ch-vc">{(s.viewer_count || 0).toLocaleString()}</div>
                </div>
              );
            })}
            {sidebarOffline.slice(0, 6).map(sp => {
              const ini = sp.full_name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
              return (
                <div key={sp.id} className="sb-ch" style={{ opacity: .45 }} onClick={() => viewChannel(sp.id)}>
                  <div className="sb-ch-av" style={{ background: "var(--ink4)", color: "var(--muted)" }}>{ini}</div>
                  <div className="sb-ch-info">
                    <div className="sb-ch-name">{sp.full_name || sp.username}</div>
                    <div className="sb-ch-sub">Offline</div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Recommended for guests / no follows */}
        {!showFollowing && sidebarRec.length > 0 && (
          <>
            <div className="sb-hd">Recommended</div>
            {sidebarRec.map(s => {
              const fs = formatDbStream(s);
              const ini = s.profiles?.full_name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
              return (
                <div key={s.id} className="sb-ch" onClick={() => go("stream", fs)}>
                  <div className="sb-ch-av" style={{ background: `linear-gradient(135deg,${fs.color}99,${fs.color}44)` }}>
                    {ini}
                    <span className="sb-live-dot" />
                  </div>
                  <div className="sb-ch-info">
                    <div className="sb-ch-name">{s.profiles?.full_name || s.profiles?.username || "Creator"}</div>
                    <div className="sb-ch-sub">{s.category || "Streaming"}</div>
                  </div>
                  <div className="sb-ch-vc">{(s.viewer_count || 0).toLocaleString()}</div>
                </div>
              );
            })}
          </>
        )}

        {/* No real streams live */}
        {!showFollowing && sidebarRec.length === 0 && (
          <div style={{ padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: .5 }}>📡</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>No streams live right now</div>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="disc-main">

        {/* Mobile search bar */}
        <div style={{ padding: "12px 16px 0", display: "block" }} className="d-mobile-search">
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: .5 }}>🔍</span>
            <input
              style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid var(--line2)", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif", boxSizing: "border-box" }}
              placeholder="Search streams, streamers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") setSearch(""); }}
            />
          </div>
        </div>

        {/* ── SEARCH RESULTS ── */}
        {search && (
          <div style={{ padding: "0 24px 40px" }}>
            {searchProfiles.length > 0 && (
              <>
                <div className="d-section-hd" style={{ marginTop: 24 }}>
                  <span className="d-section-title">Channels</span>
                  <button className="d-see-all" onClick={() => setSearch("")}>Clear ✕</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {searchProfiles.map(sp => {
                    const isLive = liveStreams.some(s => s.user_id === sp.id);
                    const ini = sp.full_name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
                    return (
                      <div key={sp.id} onClick={() => viewChannel(sp.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, cursor: "pointer", transition: "border-color .15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,.4)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}>
                        <div style={{ width: 42, height: 42, borderRadius: 50, background: "linear-gradient(135deg,var(--purple),var(--red))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0, position: "relative" }}>
                          {ini}
                          {isLive && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, background: "var(--red)", borderRadius: "50%", border: "2px solid var(--ink3)" }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{sp.full_name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>@{sp.username}</div>
                        </div>
                        {isLive ? <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: "var(--red)", borderRadius: 5, padding: "3px 8px" }}>🔴 LIVE</span> : <span style={{ fontSize: 12, color: "var(--muted)" }}>View →</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="d-section-hd" style={{ marginTop: 24 }}>
              <span className="d-section-title">Streams{filteredStreams.length > 0 ? ` (${filteredStreams.length})` : ""}</span>
            </div>
            {filteredStreams.length > 0
              ? <div className="d-grid">{filteredStreams.map(s => <LiveCard key={s.id} s={s} />)}</div>
              : <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div><div style={{ fontSize: 16, fontWeight: 600 }}>No results for "{search}"</div></div>
            }
          </div>
        )}

        {/* ── CATEGORY FILTER VIEW ── */}
        {!search && cat !== "All" && (
          <div className="d-section" style={{ paddingBottom: 40 }}>
            <div className="d-section-hd">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{CAT_META[cat]?.emoji}</span>
                <span className="d-section-title">{cat}</span>
                {liveStreams.length > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: "var(--red)", borderRadius: 5, padding: "3px 8px" }}>{filteredStreams.filter(s=>s.isRealStream).length} LIVE</span>}
              </div>
              <button className="d-see-all" onClick={() => setCat("All")}>✕ All categories</button>
            </div>
            {filteredStreams.length > 0
              ? <div className="d-grid">{filteredStreams.map(s => <LiveCard key={s.id} s={s} />)}</div>
              : <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}><div style={{ fontSize: 48, marginBottom: 12 }}>{CAT_META[cat]?.emoji}</div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No {cat} streams live</div><div style={{ fontSize: 13 }}>Check back later or explore another category.</div></div>
            }
          </div>
        )}

        {/* ── HOME CONTENT (no search, no category filter) ── */}
        {!search && cat === "All" && (
          <>
            {/* EMPTY STATE — no real streams live */}
            {allStreams.length === 0 && (
              <div style={{ padding: "56px 24px 40px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
                <div style={{ fontSize: 60, marginBottom: 18, opacity: .75 }}>📡</div>
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 30, letterSpacing: 1, marginBottom: 10 }}>No streams live right now</div>
                <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
                  {mode === "streamer"
                    ? "Go live and be the first — your viewers earn coins just from watching, which brings more people in."
                    : "Check back soon. Or sign up and follow streamers to get notified the moment they go live."}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {mode === "streamer" && user && (
                    <button className="btn-g" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => setShowGoLive(true)}>🔴 Go Live Now</button>
                  )}
                  {mode === "viewer" && user && (
                    <>
                      <button className="btn-g" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => go("clips")}>🎬 Watch Clips</button>
                      <button className="btn-o" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => go("leaderboard")}>🏆 Top Earners</button>
                    </>
                  )}
                  {!user && (
                    <>
                      <button className="btn-g" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign Up Free</button>
                      <button className="btn-o" style={{ padding: "11px 24px", fontSize: 14 }} onClick={() => go("clips")}>🎬 Watch Clips</button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* FEATURED HERO BANNER */}
            {allStreams.length > 0 && (() => {
              const hero = allStreams[0];
              return (
                <div className="d-hero" onClick={() => go("stream", hero)}>
                  <div className="d-hero-bg" style={{ background: `linear-gradient(${hero.bg})` }}>
                    <span style={{ fontSize: 220, opacity: .06 }}>{hero.emoji}</span>
                  </div>
                  <div className="d-hero-grad" />
                  <div className="d-hero-content">
                    <div className="d-hero-badge"><span className="d-hero-dot" />LIVE</div>
                    <div className="d-hero-title">{hero.title}</div>
                    <div className="d-hero-meta">
                      <span className="d-hero-streamer"
                        onClick={hero.isRealStream && hero.user_id ? (e)=>{ e.stopPropagation(); viewChannel(hero.user_id); } : undefined}
                        style={{ cursor: hero.isRealStream && hero.user_id ? "pointer" : "default" }}
                      >{hero.streamer}</span>
                      <span className="d-hero-sep">·</span>
                      <span>{hero.game}</span>
                      <span className="d-hero-sep">·</span>
                      <span>👁 {hero.viewers.toLocaleString()} viewers</span>
                    </div>
                    <div className="d-hero-actions">
                      <button className="d-hero-btn primary">▶ Watch Live</button>
                      <button className="d-hero-btn" onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(window.location.href); notify("Link copied!"); }}>Share</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* LIVE CHANNELS GRID */}
            {allStreams.length > 1 && (
              <div className="d-section">
                <div className="d-section-hd">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="d-section-title">Live Channels</span>
                    {liveStreams.length > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: "var(--red)", borderRadius: 5, padding: "3px 8px" }}>{liveStreams.length} REAL</span>}
                  </div>
                  <div style={{ display: "flex", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 20, padding: 2, gap: 2 }}>
                    {["top", "trending"].map(s => (
                      <button key={s} onClick={() => setDiscoverSort(s)} style={{ background: discoverSort === s ? "linear-gradient(135deg,var(--purple),var(--red))" : "none", border: "none", color: discoverSort === s ? "#fff" : "var(--muted)", borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{s === "trending" ? "🔥 Trending" : "⬆ Top"}</button>
                    ))}
                  </div>
                </div>
                <div className="d-grid">
                  {(discoverSort === "trending"
                    ? [...allStreams.slice(1)].sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
                    : allStreams.slice(1)
                  ).map(s => <LiveCard key={s.id} s={s} />)}
                </div>
              </div>
            )}

            {/* UPCOMING STREAMS */}
            {upcomingSchedule.length > 0 && (
              <div className="d-section">
                <div className="d-section-hd">
                  <span className="d-section-title">📅 Upcoming Streams</span>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
                  {upcomingSchedule.map(s => {
                    const d = new Date(s.scheduled_at);
                    const minsUntil = Math.round((d.getTime() - Date.now()) / 60000);
                    const countdown = minsUntil <= 0 ? "Starting soon!" : minsUntil < 60 ? `in ${minsUntil}m` : minsUntil < 1440 ? `in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m` : `in ${Math.floor(minsUntil / 1440)}d`;
                    return (
                      <div key={s.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", minWidth: 180, flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: minsUntil <= 60 ? "var(--red)" : "var(--purple)", fontWeight: 700, marginBottom: 4 }}>{countdown}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{s.profiles?.full_name || "Streamer"}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TRENDING CLIPS & SHORTS */}
            {allClips.length > 0 && (
              <div className="d-section">
                <div className="d-section-hd">
                  <span className="d-section-title">🎬 Trending Clips</span>
                  <button className="d-see-all" onClick={() => go("clips")}>See all →</button>
                </div>
                <div className="clips-strip">
                  {allClips.slice(0, 12).map(clip => {
                    const meta = DEMO_STREAMS.find(d => d.game === clip.game) || DEMO_STREAMS[Math.abs(clip.id?.charCodeAt(0) || 0) % DEMO_STREAMS.length] || DEMO_STREAMS[0];
                    return (
                      <div key={clip.id} className="csc" onClick={() => { supabase.from("clips").update({ view_count: (clip.view_count || 0) + 1 }).eq("id", clip.id); go("clips"); }}>
                        <div className="csc-thumb">
                          <div className="csc-tbg" style={{ background: `linear-gradient(${meta.bg})` }} />
                          <div className="csc-tov" />
                          <span className="csc-emoji">{meta.emoji}</span>
                          <div className="csc-play" style={{ fontSize: 28 }}>▶</div>
                          <span className="csc-views">👁 {(clip.view_count || 0).toLocaleString()}</span>
                          {clip.duration && <span className="csc-dur">{Math.floor(clip.duration/60)}:{String(clip.duration%60).padStart(2,"0")}</span>}
                        </div>
                        <div className="csc-body">
                          <div className="csc-title">{clip.title}</div>
                          <div className="csc-creator">{clip.profiles?.username || clip.profiles?.full_name || "Creator"}</div>
                          <div className="clip-votes">
                            <button className={`vote-btn up${myClipVotes[clip.id] === 1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, 1)}>▲ {Math.max(0, (clip.score || 0) + (myClipVotes[clip.id] === 1 ? 0 : 0))}</button>
                            <button className={`vote-btn dn${myClipVotes[clip.id] === -1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, -1)}>▼</button>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{(clip.score || 0) > 0 ? `+${clip.score}` : clip.score || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TOP CATEGORIES */}
            <div className="d-section">
              <div className="d-section-hd">
                <span className="d-section-title">🎮 Top Categories</span>
              </div>
              <div className="cat-art-grid">
                {Object.entries(CAT_META).map(([name, meta]) => {
                  const liveCount = allStreams.filter(s => s.game === name || s.game?.includes(name)).length;
                  return (
                    <div key={name} className="cat-art" onClick={() => setCat(name)}>
                      <div className="cat-art-bg" style={{ background: `linear-gradient(${meta.bg})` }}>
                        <span style={{ fontSize: 54, filter: "drop-shadow(0 4px 16px rgba(0,0,0,.6))" }}>{meta.emoji}</span>
                      </div>
                      <div className="cat-art-grad" />
                      <div className="cat-art-label">
                        <div className="cat-art-name">{name}</div>
                        <div className="cat-art-count">{liveCount > 0 ? `${liveCount} live` : "Browse"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FEATURED PREDICTIONS */}
            {featuredPreds.length > 0 && (
              <div className="d-section">
                <div className="d-section-hd">
                  <span className="d-section-title">🔮 Featured Predictions</span>
                  <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>Live Markets</span>
                </div>
                <div className="fpred-strip">
                  {featuredPreds.map(pred => {
                    const opts = [pred.option_a, pred.option_b, pred.option_c, pred.option_d, pred.option_e].filter(Boolean);
                    const streamerName = pred.streams?.profiles?.full_name || pred.streams?.profiles?.username || "Streamer";
                    const liveStream = liveStreams.find(s => s.user_id === pred.streams?.user_id);
                    return (
                      <div key={pred.id} className="fpred-card" onClick={() => liveStream && go("stream", formatDbStream(liveStream))}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "var(--red)", borderRadius: 4, padding: "2px 7px" }}>🔴 LIVE</span>
                          <span style={{ fontSize: 11, color: "var(--muted)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{streamerName}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: pred.status === "locked" ? "var(--orange)" : "var(--green)", flexShrink: 0 }}>{pred.status === "locked" ? "🔒 Locked" : "⚡ Open"}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>🔮 {pred.title}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {opts.map((opt, i) => {
                            const colors = ["var(--blue)","var(--red)","var(--green)","var(--orange)","var(--purple)"];
                            const c = colors[i] || "var(--muted)";
                            return <span key={i} style={{ fontSize: 11, fontWeight: 700, color: c, background: `${c}18`, border: `1px solid ${c}33`, borderRadius: 20, padding: "3px 10px" }}>{opt}</span>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GUEST SIGN-UP CTA */}
            {!user && (
              <div className="d-section" style={{ paddingBottom: 40 }}>
                <div className="d-cta-bar">
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🪙 Watch and earn real money</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Create a free account to earn coins while watching, join chat, and withdraw real cash.</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button className="btn-o" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setAuthMode("login"); go("auth"); }}>Log in</button>
                    <button className="btn-g" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign Up Free</button>
                  </div>
                </div>
              </div>
            )}

            {/* FOLLOWING FEED */}
            {user && discTab === "following" && (
              <div className="d-section">
                {myFollows.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>❤️</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nobody followed yet</div>
                    <div style={{ fontSize: 13 }}>Go to any stream and hit Follow to build your feed.</div>
                  </div>
                ) : (
                  <div className="d-grid">
                    {liveStreams.filter(s => myFollows.includes(s.user_id)).map(formatDbStream).map(s => <LiveCard key={s.id} s={s} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
