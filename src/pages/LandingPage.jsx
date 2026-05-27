import { useApp } from "../AppContext";

const HOW_STEPS = [
  { n: "1", icon: "👤", title: "Create a free account", desc: "Sign up in 30 seconds — no credit card, no approval needed." },
  { n: "2", icon: "📺", title: "Watch live streams", desc: "Browse real live streams across Gaming, IRL, Music, Sports and more." },
  { n: "3", icon: "🪙", title: "Earn coins automatically", desc: "Coins tick up every minute you watch, plus bonuses for chatting, following, and streaks." },
  { n: "4", icon: "💸", title: "Cash out real money", desc: "Withdraw via PayPal once you reach $20. 1,000 coins = $1 always." },
];

const WHY_ITEMS = [
  { icon: "💰", title: "Viewers get paid", desc: "The only platform where watching earns you real money — not points, not perks, actual dollars.", color: "#00f5a0" },
  { icon: "📡", title: "Streamers earn more", desc: "Ad revenue share + subscriptions + viewer gifts. Multiple income streams from day one.", color: "#7c3aed" },
  { icon: "🔒", title: "Instant withdrawals", desc: "No 30-day holds or complex thresholds. Reach $20 and cash out within 24 hours.", color: "#4d9fff" },
  { icon: "🏆", title: "Compete for more", desc: "Daily missions, streak bonuses, and a leaderboard keep the highest earners ahead.", color: "#ffc800" },
];

export default function LandingPage() {
  const { go, setAuthMode, setRole, liveStreams, landingStats } = useApp();

  return (
    <div style={{ paddingTop: 56 }}>

      {/* HERO */}
      <div className="hero">
        <div className="hero-mesh" /><div className="hero-grid" /><div className="hero-orb1" /><div className="hero-orb2" />
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="eyebrow-dot" />World's First Viewer-Paid Platform</div>
          <h1 className="hero-h">
            <span className="l1">WATCH LIVE.</span>
            <span className="l2">GET PAID.</span>
          </h1>
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
              <div key={l} className="hstat">
                <div className="hstat-v">{v}</div>
                <div className="hstat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding: "56px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: "clamp(28px,6vw,44px)", letterSpacing: 1, marginBottom: 8 }}>How It Works</div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 440, margin: "0 auto" }}>
            Four steps from zero to paid. No catch.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16 }}>
          {HOW_STEPS.map((s, i) => (
            <div key={s.n} style={{ background: "var(--card)", border: "1px solid var(--line2)", borderRadius: 16, padding: "20px 18px", position: "relative" }}>
              <div style={{ position: "absolute", top: 14, right: 16, fontFamily: "Bebas Neue,sans-serif", fontSize: 32, color: "rgba(255,255,255,.06)", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY STEM */}
      <div style={{ padding: "0 24px 56px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: "clamp(24px,5vw,38px)", letterSpacing: 1, marginBottom: 8 }}>Why STEM?</div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", maxWidth: 400, margin: "0 auto" }}>
            Everything other platforms don't do.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {WHY_ITEMS.map(w => (
            <div key={w.title} style={{ background: `${w.color}0d`, border: `1px solid ${w.color}25`, borderRadius: 16, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{w.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: w.color, marginBottom: 6 }}>{w.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ padding: "0 24px 64px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.14),rgba(255,45,85,.1))", border: "1px solid rgba(124,58,237,.2)", borderRadius: 20, padding: "40px 28px" }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: "clamp(24px,5vw,36px)", letterSpacing: 1, marginBottom: 10 }}>Ready to Earn?</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 24 }}>Join thousands of viewers and streamers already earning on STEM.</p>
          <button className="btn-g" style={{ padding: "14px 36px", fontSize: 16 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>
            Create Free Account
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: 2, background: "linear-gradient(90deg,var(--purple),var(--red))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>STEM</div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={() => go("streamer")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>For Streamers</button>
          <button onClick={() => go("tos")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>Terms of Service</button>
          <button onClick={() => go("privacy")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>Privacy Policy</button>
          <a href="mailto:support@stemapp.online" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>Contact</a>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", opacity: .6 }}>© 2026 STEM. All rights reserved.</div>
      </footer>
    </div>
  );
}
