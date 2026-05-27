import { useApp } from "../AppContext";

export default function ClipsPage() {
  const {
    allClips, loadingClips, myClipVotes, voteClip,
    notify, CAT_META,
  } = useApp();

  return (
    <div className="clips-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>Clips</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Best moments from STEM streams</div>
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
          {allClips.some(c => c.score > 0) && (
            <div style={{ background: "linear-gradient(135deg,rgba(255,200,0,.08),rgba(255,200,0,.03))", border: "1px solid rgba(255,200,0,.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Top Clip</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{[...allClips].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.title}</div>
              </div>
            </div>
          )}
          <div className="clips-grid">
            {[...allClips].sort((a, b) => (b.score || 0) - (a.score || 0)).map(clip => {
              const meta = CAT_META[clip.category] || { emoji: "🎮", color: "#7c3aed" };
              return (
                <div key={clip.id} className="clip-card" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?clip=${clip.id}`); notify("Clip link copied!"); }}>
                  <div style={{ background: `linear-gradient(135deg,${meta.color}33,${meta.color}11)`, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, borderBottom: "1px solid var(--line)", position: "relative" }}>
                    {meta.emoji}
                    {(clip.score || 0) > 0 && <span style={{ position: "absolute", top: 6, right: 8, background: "rgba(0,0,0,.6)", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, color: "var(--gold)" }}>+{clip.score}</span>}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>by {clip.profiles?.full_name || clip.profiles?.username || "viewer"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <button className={`vote-btn up${myClipVotes[clip.id] === 1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, 1)}>▲ {clip.score > 0 ? clip.score : 0}</button>
                      <button className={`vote-btn dn${myClipVotes[clip.id] === -1 ? " on" : ""}`} onClick={e => voteClip(e, clip.id, -1)}>▼</button>
                      <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>{new Date(clip.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
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
