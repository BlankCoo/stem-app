import { useApp } from "../AppContext";

const EARNING_METHODS = [
  {
    icon: "📺",
    label: "Ad Revenue Share",
    desc: "Earn a cut of every ad played during your streams. More viewers = more ad revenue, paid directly to your STEM wallet.",
    color: "#7c3aed",
  },
  {
    icon: "⭐",
    label: "Subscriptions",
    desc: "Viewers subscribe to your channel monthly. You keep the majority — subscriptions are the most predictable income source for streamers.",
    color: "#f0c040",
  },
  {
    icon: "🎁",
    label: "Gifts & Tips",
    desc: "Viewers send you gifts during live streams using STEM coins. Every 1,000 coins they send = $1 real money in your pocket.",
    color: "#00f5a0",
  },
];

const SETUP_STEPS = [
  {
    n: "1",
    icon: "👤",
    title: "Create your account",
    desc: "Sign up free in 30 seconds. Select 'Streamer' when prompted. No credit card. No approval process.",
  },
  {
    n: "2",
    icon: "🎥",
    title: "Get your stream key",
    desc: "Go to your Dashboard → Go Live. Copy your unique RTMP server URL and stream key.",
  },
  {
    n: "3",
    icon: "🖥️",
    title: "Set up OBS",
    desc: "In OBS: Settings → Stream → Custom. Paste your STEM server URL and stream key. Hit Start Streaming.",
  },
  {
    n: "4",
    icon: "🔴",
    title: "Go live & earn",
    desc: "Click Go Live on STEM, add a title and category, and your stream goes live. Earnings show up in real time.",
  },
];

const TIER_INFO = [
  {
    name: "Aspiring",
    emoji: "🎙",
    color: "rgba(255,255,255,.45)",
    req: "Sign up and start streaming",
    perks: ["Stream to live audiences", "Receive gifts and tips", "Build your follower base"],
  },
  {
    name: "Affiliate",
    emoji: "⭐",
    color: "#ff9500",
    req: "50+ followers & 3+ streams",
    perks: ["Enable subscriptions", "Ad revenue share begins", "Custom channel emotes"],
  },
  {
    name: "Partner",
    emoji: "✅",
    color: "#7c3aed",
    req: "500+ followers & consistent streams",
    perks: ["Higher ad revenue split", "Priority support", "Verified partner badge"],
  },
];

export default function StreamerPage() {
  const { go, setRole, setAuthMode, user, mode } = useApp();

  const handleSignUp = () => {
    setRole("streamer");
    setAuthMode("signup");
    go("auth");
  };

  return (
    <div style={{ paddingTop: 56, maxWidth: 800, margin: "0 auto", padding: "72px 20px 80px" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 100, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "var(--purple)", letterSpacing: 1, marginBottom: 20 }}>
          🔴 FOR STREAMERS
        </div>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(40px,8vw,72px)", lineHeight: 1, letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ display: "block", background: "linear-gradient(135deg,#fff,rgba(255,255,255,.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>STREAM.</span>
          <span style={{ display: "block", background: "linear-gradient(135deg,var(--purple),var(--red))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GET PAID.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 28px" }}>
          STEM is the first streaming platform that pays both you <em>and</em> your audience. Go live from any device using OBS — zero setup fees, zero approval wait.
        </p>
        {user && mode === "streamer" ? (
          <button
            className="btn-g"
            style={{ padding: "14px 32px", fontSize: 16 }}
            onClick={() => go("dash")}
          >
            Go to Dashboard →
          </button>
        ) : (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-g" style={{ padding: "14px 32px", fontSize: 16 }} onClick={handleSignUp}>
              Start Streaming Free
            </button>
            <button className="btn-o" style={{ padding: "13px 28px", fontSize: 15 }} onClick={() => go("disc")}>
              Watch First →
            </button>
          </div>
        )}
      </div>

      {/* How you earn */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>Three ways to earn</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 24 }}>Every stream is a potential income stream.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {EARNING_METHODS.map(m => (
            <div key={m.label} style={{ background: "var(--card)", border: "1px solid var(--line2)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: m.color, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue comparison */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>How STEM compares</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 24 }}>The only platform where your audience earns too.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr>
                {["", "STEM", "Twitch", "Kick", "TikTok"].map((h, i) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: i === 0 ? "left" : "center", fontWeight: 700, fontSize: 11, color: "var(--muted)", borderBottom: "1px solid var(--line)", letterSpacing: .5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Sub revenue cut", "70%", "50%", "95%", "~50%"],
                ["Ad revenue share", "40%", "Variable", "Variable", "❌"],
                ["Viewers earn?", "✅ Yes", "❌ No", "❌ No", "❌ No"],
                ["Approval required?", "❌ None", "✅ Yes", "✅ Yes", "✅ Yes"],
                ["Min. payout", "$20", "$100", "$100", "$50"],
              ].map(([label, stem, twitch, kick, tiktok], ri) => (
                <tr key={label} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent" }}>
                  <td style={{ padding: "11px 12px", color: "var(--muted)", fontWeight: 600 }}>{label}</td>
                  <td style={{ padding: "11px 12px", textAlign: "center", fontWeight: 700, color: "var(--green)", background: "rgba(0,245,160,.05)" }}>{stem}</td>
                  <td style={{ padding: "11px 12px", textAlign: "center", color: "rgba(255,255,255,.55)" }}>{twitch}</td>
                  <td style={{ padding: "11px 12px", textAlign: "center", color: "rgba(255,255,255,.55)" }}>{kick}</td>
                  <td style={{ padding: "11px 12px", textAlign: "center", color: "rgba(255,255,255,.55)" }}>{tiktok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>Rates approximate. STEM's viewer earnings are unique — no competitor pays their audience.</div>
      </section>

      {/* Setup steps */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>Live in 4 steps</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 24 }}>Works with OBS, Streamlabs, and any RTMP-compatible software.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SETUP_STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? "rgba(124,58,237,.25)" : "var(--ink4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier progression */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>Grow through the tiers</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 24 }}>Unlock more earning potential as your audience grows.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {TIER_INFO.map(t => (
            <div key={t.name} style={{ background: "var(--card)", border: `1px solid ${t.color}30`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{t.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: t.color, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Requires: {t.req}</div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {t.perks.map(p => (
                  <li key={p} style={{ fontSize: 12, color: "rgba(255,255,255,.65)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--green)", fontSize: 10 }}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: "center", background: "linear-gradient(135deg,rgba(124,58,237,.15),rgba(255,45,85,.1))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 20, padding: "40px 24px" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔴</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ready to go live?</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
          Sign up free and start streaming today. Your first payout is waiting.
        </p>
        {user && mode === "streamer" ? (
          <button className="btn-g" style={{ padding: "14px 32px", fontSize: 16 }} onClick={() => go("dash")}>
            Open Dashboard →
          </button>
        ) : (
          <button className="btn-g" style={{ padding: "14px 32px", fontSize: 16 }} onClick={handleSignUp}>
            Create Streamer Account — It's Free
          </button>
        )}
      </div>

    </div>
  );
}
