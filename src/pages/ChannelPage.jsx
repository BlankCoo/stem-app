import MuxPlayer from "@mux/mux-player-react";
import { useApp } from "../AppContext";
import { supabase } from "../supabase";

export default function ChannelPage() {
  const {
    go, user, formatDbStream,
    channelUser, channelIsLive, channelFollowers, setChannelFollowers,
    channelStreams, channelClips, channelSchedule, channelTab, setChannelTab,
    selectedVod, setSelectedVod,
    liveStreams, myFollows, setMyFollows,
    streamEmotes, CAT_META,
    setShowSignupPrompt, notify,
    coins, setCoins, coinsRef, logTransaction,
  } = useApp();

  return (
    <div className="page" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,var(--purple),var(--red))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flexShrink: 0, overflow: "hidden" }}>
          {channelUser.avatar_url
            ? <img src={channelUser.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : (channelUser.full_name?.charAt(0) || "?")
          }
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, letterSpacing: .5 }}>{channelUser.full_name}</div>
            {channelIsLive && <span style={{ background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 5, letterSpacing: .5 }}>🔴 LIVE</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>@{channelUser.username} · {channelFollowers.toLocaleString()} followers</div>
          {channelUser.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", maxWidth: 420, marginBottom: 8 }}>{channelUser.bio}</div>}
          {[["social_twitter", "🐦", "twitter.com/"], ["social_instagram", "📸", "instagram.com/"], ["social_youtube", "▶️", null], ["social_tiktok", "🎵", "tiktok.com/@"]].some(([k]) => channelUser[k]) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["social_twitter", "🐦", v => `https://twitter.com/${v}`], ["social_instagram", "📸", v => `https://instagram.com/${v}`], ["social_youtube", "▶️", v => v.startsWith("http") ? v : `https://youtube.com/${v}`], ["social_tiktok", "🎵", v => `https://tiktok.com/@${v}`]].map(([key, icon, urlFn]) => channelUser[key] ? (
                <a key={key} href={urlFn(channelUser[key])} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.07)", border: "1px solid var(--line)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "rgba(255,255,255,.8)", textDecoration: "none", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.07)"}
                >{icon} {channelUser[key].replace(/https?:\/\/(www\.)?/, "").split("/")[0]}</a>
              ) : null)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {channelIsLive && (
            <button className="btn-red" onClick={() => { const ls = liveStreams.find(s => s.user_id === channelUser.id); if (ls) go("stream", formatDbStream(ls)); }} style={{ padding: "9px 18px", fontSize: 13 }}>
              Watch Live
            </button>
          )}
          {user && user.id !== channelUser.id && (
            <button
              className={myFollows.includes(channelUser.id) ? "btn-o" : "btn-g"}
              onClick={async () => {
                if (!user) { setShowSignupPrompt(true); return; }
                if (myFollows.includes(channelUser.id)) {
                  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", channelUser.id);
                  setMyFollows(f => f.filter(id => id !== channelUser.id));
                  setChannelFollowers(n => Math.max(0, n - 1));
                } else {
                  await supabase.from("follows").insert({ follower_id: user.id, following_id: channelUser.id });
                  setMyFollows(f => [...f, channelUser.id]);
                  setChannelFollowers(n => n + 1);
                  notify("+50 coins for following!");
                  const nc = coinsRef.current + 50;
                  setCoins(nc); coinsRef.current = nc;
                  supabase.from("profiles").update({ coins: nc }).eq("id", user.id);
                  logTransaction("follow", 50, `Followed ${channelUser.full_name}`);
                }
              }}
              style={{ padding: "9px 18px", fontSize: 13 }}
            >
              {myFollows.includes(channelUser.id) ? "✓ Following" : "+ Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[["Followers", channelFollowers.toLocaleString()], ["Streams", channelStreams.length], ["Clips", channelClips.length]].map(([l, v]) => (
          <div key={l} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24 }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 20, overflowX: "auto" }}>
        {[["overview", "Overview"], ["streams", `Streams${channelStreams.length ? ` (${channelStreams.length})` : ""}`], ["clips", `Clips${channelClips.length ? ` (${channelClips.length})` : ""}`], ["schedule", `Schedule${channelSchedule.length ? ` (${channelSchedule.length})` : ""}`], ...(streamEmotes.length ? [["emotes", `Emotes (${streamEmotes.length})`]] : [])].map(([tab, label]) => (
          <button key={tab} onClick={() => { setChannelTab(tab); setSelectedVod(null); }} style={{ background: "none", border: "none", borderBottom: channelTab === tab ? "2px solid var(--red)" : "2px solid transparent", color: channelTab === tab ? "#fff" : "var(--muted)", fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s" }}>{label}</button>
        ))}
      </div>

      {/* Overview tab */}
      {channelTab === "overview" && (
        <div>
          {channelIsLive && (
            <div style={{ background: "linear-gradient(135deg,rgba(255,45,85,.12),rgba(255,45,85,.05))", border: "1px solid rgba(255,45,85,.3)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Live right now</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{channelUser.full_name} is streaming</div>
              </div>
              <button className="btn-red" onClick={() => { const ls = liveStreams.find(s => s.user_id === channelUser.id); if (ls) go("stream", formatDbStream(ls)); }} style={{ padding: "8px 16px", fontSize: 13 }}>Watch</button>
            </div>
          )}
          {channelSchedule.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Up next</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {channelSchedule.slice(0, 3).map(s => {
                  const d = new Date(s.scheduled_at);
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", minWidth: 160, flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 700, marginBottom: 3 }}>{d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {channelStreams.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Recent streams</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                {channelStreams.slice(0, 4).map(s => {
                  const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", cursor: s.status === "live" ? "pointer" : "default" }} onClick={() => s.status === "live" && go("stream", formatDbStream(s))}>
                      <div style={{ height: 70, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{meta.emoji}</div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s.status === "live" ? <span style={{ color: "var(--red)" }}>🔴 LIVE</span> : "Ended"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {channelStreams.length === 0 && !channelIsLive && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎙</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No streams yet</div>
              <div style={{ fontSize: 13 }}>Check back when this creator goes live.</div>
            </div>
          )}
        </div>
      )}

      {/* Streams tab */}
      {channelTab === "streams" && (
        channelStreams.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>📺</div>No past streams yet</div>
          : <div>
              {selectedVod && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{selectedVod.title}</div>
                    <button onClick={() => setSelectedVod(null)} style={{ background: "none", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>✕ Close</button>
                  </div>
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "#000" }}>
                    <MuxPlayer playbackId={selectedVod.mux_playback_id} streamType="on-demand" style={{ width: "100%", aspectRatio: "16/9" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                    {selectedVod.category}{selectedVod.peak_viewers > 0 ? ` · ${selectedVod.peak_viewers.toLocaleString()} peak viewers` : ""} · {new Date(selectedVod.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {channelStreams.map(s => {
                  const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
                  const playable = !!s.mux_playback_id;
                  const isSelected = selectedVod?.id === s.id;
                  return (
                    <div key={s.id} style={{ background: "var(--card)", border: `1px solid ${isSelected ? "rgba(124,58,237,.5)" : "var(--line)"}`, borderRadius: 12, overflow: "hidden", cursor: playable ? "pointer" : "default", transition: "border-color .2s" }}
                      onClick={() => playable && setSelectedVod(isSelected ? null : s)}>
                      <div style={{ height: 80, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, position: "relative" }}>
                        {meta.emoji}
                        {playable && <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.65)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>▶</div>}
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                          {s.category}{s.peak_viewers > 0 ? ` · ${s.peak_viewers.toLocaleString()} peak` : ""} · {new Date(s.created_at).toLocaleDateString()}
                        </div>
                        {playable && <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700, marginTop: 4 }}>▶ Watch VOD</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
      )}

      {/* Clips tab */}
      {channelTab === "clips" && (
        channelClips.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>✂</div>No clips yet</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {channelClips.map(clip => (
                <div key={clip.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>✂</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{clip.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>by {clip.profiles?.full_name || "viewer"} · {new Date(clip.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Schedule tab */}
      {channelTab === "schedule" && (
        channelSchedule.length === 0
          ? <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}><div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>No upcoming streams scheduled</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {channelSchedule.map(s => {
                const d = new Date(s.scheduled_at);
                return (
                  <div key={s.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "center", minWidth: 44, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 8, padding: "6px 4px", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700 }}>{d.toLocaleDateString([], { month: "short" }).toUpperCase()}</div>
                      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, lineHeight: 1 }}>{d.getDate()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.category} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
      )}

      {/* Emotes tab */}
      {channelTab === "emotes" && streamEmotes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {streamEmotes.map(e => (
            <div key={e.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }} title={`:${e.name}:`}>
              <img src={e.image_url} alt={e.name} style={{ width: 48, height: 48, objectFit: "contain" }} />
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>:{e.name}:</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
