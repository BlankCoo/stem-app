import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { useApp } from "../AppContext";

export default function ClipsPage() {
  const {
    allClips, loadingClips, myClipVotes, voteClip,
    notify, CAT_META,
  } = useApp();

  const [vodClip, setVodClip] = useState(null);

  const sorted = [...allClips].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topClip = sorted[0];

  return (
    <div className="clips-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Clips</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Best moments from STEM streams</div>

      {/* VOD player modal */}
      {vodClip && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 400 }} onClick={() => setVodClip(null)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px,96vw)", zIndex: 401, background: "var(--ink2)", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.9)" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vodClip.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  Clipped by {vodClip.profiles?.full_name || vodClip.profiles?.username || "viewer"}
                </div>
              </div>
              <button onClick={() => setVodClip(null)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
            <MuxPlayer
              playbackId={vodClip.vod_playback_id}
              streamType="on-demand"
              style={{ width: "100%", display: "block" }}
              startTime={vodClip.start_time_secs || 0}
              autoPlay
            />
          </div>
        </>
      )}

      {loadingClips ? (
        <div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : allClips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✂</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No clips yet</div>
          <div style={{ fontSize: 13 }}>Watch streams and click ✂ Clip to save moments.</div>
        </div>
      ) : (
        <>
          {topClip && topClip.score > 0 && (
            <div style={{ background: "linear-gradient(135deg,rgba(255,200,0,.08),rgba(255,200,0,.03))", border: "1px solid rgba(255,200,0,.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, cursor: topClip.vod_playback_id ? "pointer" : "default" }}
              onClick={() => topClip.vod_playback_id && setVodClip(topClip)}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Top Clip</div>
                <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topClip.title}</div>
              </div>
              {topClip.vod_playback_id && <span style={{ fontSize: 12, color: "var(--purple)", fontWeight: 700, flexShrink: 0 }}>▶ Watch</span>}
            </div>
          )}
          <div className="clips-grid">
            {sorted.map(clip => {
              const meta = CAT_META[clip.stream_category || clip.category] || { emoji: "🎮", color: "#7c3aed" };
              const hasVod = !!clip.vod_playback_id;
              return (
                <div key={clip.id} className="clip-card" onClick={() => {
                  if (hasVod) setVodClip(clip);
                  else { navigator.clipboard?.writeText(`${window.location.origin}/?clip=${clip.id}`); notify("Clip link copied!"); }
                }}>
                  <div style={{ background: `linear-gradient(135deg,${meta.color}33,${meta.color}11)`, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, borderBottom: "1px solid var(--line)", position: "relative" }}>
                    {meta.emoji}
                    {(clip.score || 0) > 0 && (
                      <span style={{ position: "absolute", top: 6, right: 8, background: "rgba(0,0,0,.6)", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, color: "var(--gold)" }}>+{clip.score}</span>
                    )}
                    {hasVod && (
                      <div className="clip-play-ov" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.5)", opacity: 0, transition: "opacity .2s" }}>
                        <span style={{ fontSize: 36, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.8))" }}>▶</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>by {clip.profiles?.full_name || clip.profiles?.username || "viewer"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <button className={`vote-btn up${myClipVotes[clip.id] === 1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, 1)}>▲ {clip.score > 0 ? clip.score : 0}</button>
                      <button className={`vote-btn dn${myClipVotes[clip.id] === -1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, -1)}>▼</button>
                      {hasVod
                        ? <span style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700, marginLeft: "auto" }}>▶ Watch</span>
                        : <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>{new Date(clip.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
