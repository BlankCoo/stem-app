import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useApp } from "../AppContext";

export default function VodPage() {
  const { allVods, loadingVods, CAT_META, viewChannel, go } = useApp();
  const [playing, setPlaying] = useState(null);
  const [cat, setCat] = useState("All");

  const cats = ["All", ...Object.keys(CAT_META)];
  const filtered = cat === "All" ? allVods : allVods.filter(v => v.category === cat);

  const fmtDate = iso => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="page" style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Replays</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Watch past streams from STEM creators</div>
      </div>

      {/* Inline player */}
      {playing && (
        <div style={{ marginBottom: 28, borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 40px rgba(0,0,0,.7)" }}>
          <div style={{ padding: "12px 16px", background: "var(--ink2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playing.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {playing.profiles?.full_name || playing.streamer_name}
                {playing.peak_viewers > 0 && ` · ${playing.peak_viewers.toLocaleString()} peak viewers`}
                {` · ${fmtDate(playing.created_at)}`}
              </div>
            </div>
            <button onClick={() => setPlaying(null)} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
              ✕ Close
            </button>
          </div>
          <MuxPlayer
            playbackId={playing.mux_playback_id}
            streamType="on-demand"
            style={{ width: "100%", display: "block", maxHeight: "60vh" }}
            autoPlay
          />
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? "linear-gradient(135deg,rgba(124,58,237,.2),rgba(255,45,85,.15))" : "rgba(255,255,255,.04)", border: cat === c ? "1px solid rgba(124,58,237,.45)" : "1px solid var(--line)", color: cat === c ? "#fff" : "var(--muted)", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all .2s" }}>
            {c !== "All" && CAT_META[c] ? `${CAT_META[c].emoji} ` : ""}{c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loadingVods ? (
        <div style={{ padding: 80, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📺</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No replays yet</div>
          <div style={{ fontSize: 13 }}>Past streams will appear here once creators have streamed.</div>
          <button onClick={() => go("disc")} className="btn-g" style={{ marginTop: 20 }}>Watch Live Streams</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
          {filtered.map(vod => {
            const meta = CAT_META[vod.category] || CAT_META["Just Chatting"];
            const ini = vod.profiles?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
            const isPlaying = playing?.id === vod.id;
            const thumb = `https://image.mux.com/${vod.mux_playback_id}/thumbnail.png?width=640&height=360&time=10`;

            return (
              <div key={vod.id} onClick={() => setPlaying(isPlaying ? null : vod)} style={{ background: "var(--ink3)", border: `1px solid ${isPlaying ? "rgba(124,58,237,.6)" : "var(--line)"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

                {/* Thumbnail */}
                <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden", background: `linear-gradient(${meta.bg})` }}>
                  <img
                    src={thumb}
                    alt={vod.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)" }} />
                  {/* Category emoji fallback shown behind img */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: .15 }}>{meta.emoji}</div>
                  {/* Play button */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 44, height: 44, background: isPlaying ? "rgba(124,58,237,.9)" : "rgba(0,0,0,.72)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,.3)", transition: "background .2s" }}>
                      {isPlaying ? "⏸" : "▶"}
                    </div>
                  </div>
                  {/* Category badge */}
                  <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.65)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)", backdropFilter: "blur(4px)" }}>
                    {meta.emoji} {vod.category}
                  </div>
                  {/* Peak viewers */}
                  {vod.peak_viewers > 0 && (
                    <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.65)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.85)", backdropFilter: "blur(4px)" }}>
                      👁 {vod.peak_viewers.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {vod.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      onClick={e => { e.stopPropagation(); viewChannel(vod.user_id); }}
                      style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${meta.color}99,${meta.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, overflow: "hidden", cursor: "pointer" }}
                    >
                      {vod.profiles?.avatar_url
                        ? <img src={vod.profiles.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : ini}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={e => { e.stopPropagation(); viewChannel(vod.user_id); }}
                        style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                      >
                        {vod.profiles?.full_name || vod.streamer_name}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{fmtDate(vod.created_at)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
