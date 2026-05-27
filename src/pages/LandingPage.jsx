import { useApp } from "../AppContext";

export default function LandingPage() {
  const { go, setAuthMode, setRole } = useApp();
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
            <button className="btn-o" style={{ padding: "9px 20px", fontSize: 13, opacity: .7 }} onClick={() => { setRole("streamer"); setAuthMode("signup"); go("auth"); }}>I am a Streamer</button>
          </div>
          <div className="hero-stats">
            {[["2,841", "Streams live"], ["$48K", "Paid today"], ["127K", "Earning"]].map(([v, l]) => (
              <div key={l} className="hstat"><div className="hstat-v">{v}</div><div className="hstat-l">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
