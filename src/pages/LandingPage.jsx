import { useApp } from "../AppContext";

const CAT_COLORS = {
  Gaming: { emoji: "🎮", bg: "135deg,#1a0a2e,#2d1b69", color: "#7c3aed" },
  IRL: { emoji: "📸", bg: "135deg,#2e0a1a,#69141b", color: "#e94560" },
  Music: { emoji: "🎵", bg: "135deg,#1e1a0a,#3a2e0d", color: "#f0c040" },
  "Just Chatting": { emoji: "💬", bg: "135deg,#2e0a1e,#5a1442", color: "#ec4899" },
  Sports: { emoji: "⚽", bg: "135deg,#0a1a2e,#0e3a5a", color: "#0ea5e9" },
  Food: { emoji: "🍳", bg: "135deg,#0a1e10,#0d3a1a", color: "#22c55e" },
};
const DEFAULT_CAT = { emoji: "📺", bg: "135deg,#1a0a2e,#2d1b69", color: "#7c3aed" };

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
  const { go, setAuthMode, setRole, liveStreams, landingStats, allVods, formatDbStream } = useApp();

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
        </div>
      </div>

      {/* LIVE NOW / RECENT STREAMS */}
      {(() => {
        const live = liveStreams.slice(0, 6);
        const recent = allVods.slice(0, 6);
        const showLive = live.length > 0;
        const showRecent = !showLive && recent.length > 0;
        if (!showLive && !showRecent) return (
          <div style={{ padding: "48px 24px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: .5 }}>📡</div>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, letterSpacing: 1, marginBottom: 8 }}>No streams live right now</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>Check back soon — or sign up and follow streamers to get notified the moment they go live.</div>
          </div>
        );
        return (
          <div style={{ padding: "48px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {showLive && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 5, padding: "3px 10px", letterSpacing: .5 }}><span style={{ width: 5, height: 5, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite", display: "inline-block" }} />LIVE</span>}
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, letterSpacing: .5 }}>{showLive ? "Streaming Now" : "Recent Streams"}</span>
              <button onClick={() => go("disc")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>See all →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {(showLive ? live : recent).map(s => {
                const cat = showLive ? (s.category || "Just Chatting") : (s.category || "Just Chatting");
                const meta = CAT_COLORS[cat] || DEFAULT_CAT;
                const name = showLive ? (s.profiles?.full_name || s.streamer_name || "Streamer") : (s.profiles?.full_name || s.streamer_name || "Streamer");
                const thumb = showLive ? s.thumbnail_url : (s.mux_playback_id ? `https://image.mux.com/${s.mux_playback_id}/thumbnail.png?width=640&height=360&time=10` : null);
                return (
                  <div key={s.id} onClick={() => showLive ? go("stream", formatDbStream(s)) : go("vod")}
                    style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ aspectRatio: "16/9", position: "relative", background: `linear-gradient(${meta.bg})`, overflow: "hidden" }}>
                      {thumb && <img src={thumb} alt={s.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} />}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 50%)" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: .12 }}>{meta.emoji}</div>
                      {showLive
                        ? <span style={{ position: "absolute", top: 8, left: 8, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, letterSpacing: .4 }}>● LIVE</span>
                        : <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>▶ REPLAY</span>
                      }
                      {showLive && s.viewer_count > 0 && <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.65)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>👁 {s.viewer_count.toLocaleString()}</span>}
                    </div>
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{name} · {cat}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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
