import { useApp } from "../AppContext";

export default function LandingPage() {
  const { go, setAuthMode, setRole, liveStreams, landingStats } = useApp();
  return (
    <div style={{ paddingTop: 56 }}>
      <div className="hero">
        <div className="hero-mesh" /><div className="hero-grid" /><div className="hero-orb1" /><div className="hero-orb2" />
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="eyebrow-dot" />World's First Viewer-Paid Platform</div>
          <h1 className="hero-h"><span className="l1">WATCH LIVE.</span><span className="l2">GET PAID.</span></h1>
          <p className="hero-p">The first streaming platform to pay <strong>both streamers AND viewers</strong> in real money. Every ad. Every hour. Every clip.</p>
          <div className="hero-btns">
            <button className="btn-g" style={{ padding: "12px 24px", fontSize: 15 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Start Earning Free</button>
            <button className="btn-o" style={{ padding: "11px 24px", fontSize: 15 }} onClick={() => go("disc")}>Browse Streams →</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <button className="btn-o" style={{ padding: "9px 20px", fontSize: 13, opacity: .7 }} onClick={() => go("streamer")}>I am a Streamer →</button>
          </div>
          <div className="hero-stats">
            {[
              [liveStreams.length > 0 ? liveStreams.length.toLocaleString() : "—", "Streams live"],
              [landingStats.members > 0 ? landingStats.members.toLocaleString() : "—", "Members"],
              [landingStats.totalEarned > 0 ? `$${(landingStats.totalEarned / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", "Paid out"],
            ].map(([v, l]) => (
              <div key={l} className="hstat"><div className="hstat-v">{v}</div><div className="hstat-l">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: 2, background: "linear-gradient(90deg,var(--purple),var(--red))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>STEM</div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => go("tos")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>Terms of Service</button>
          <button onClick={() => go("privacy")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>Privacy Policy</button>
          <a href="mailto:support@stemapp.online" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>Contact</a>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", opacity: .6 }}>© 2026 STEM. All rights reserved.</div>
      </footer>
    </div>
  );
}
