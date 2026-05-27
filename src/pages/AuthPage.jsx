import { useApp } from "../AppContext";

export default function AuthPage() {
  const {
    go, authMode, setAuthMode, role, setRole,
    authError, setAuthError, loading, formData, setFormData,
    handleSignUp, handleLogin, handleForgotPassword,
  } = useApp();

  return (
    <div className="auth-wrap page">
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <button onClick={() => go("disc")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>← Browse without account</button>
      </div>
      <div className="auth-box">
        <div style={{ padding: "24px 24px 0", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: 2, background: "linear-gradient(90deg,var(--purple),var(--red))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>STEM</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{authMode === "signup" ? "Create account" : "Welcome back"}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", paddingBottom: 20 }}>{authMode === "signup" ? "Start earning free — no card needed." : "Continue your earning streak."}</div>
        </div>
        <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid var(--line)" }}>
          {["signup", "login"].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{ flex: 1, background: "none", border: "none", borderBottom: authMode === m ? "2px solid var(--red)" : "2px solid transparent", color: authMode === m ? "#fff" : "var(--muted)", fontSize: 14, fontWeight: 600, padding: "11px 0", cursor: "pointer" }}>
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>
        <div style={{ padding: "22px 24px 26px" }}>
          {authError && <div className="error-msg">{authError}</div>}
          {authMode === "signup" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[["viewer", "👁", "Viewer", "Watch and earn"], ["streamer", "🎙", "Streamer", "Stream and earn"]].map(([r, ic, ti, su]) => (
                <div key={r} onClick={() => setRole(r)} style={{ background: role === r ? "rgba(124,58,237,.1)" : "var(--ink3)", border: role === r ? "2px solid var(--purple)" : "2px solid var(--line)", borderRadius: 12, padding: 14, textAlign: "center", cursor: "pointer", transition: "all .2s" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{ic}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{ti}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{su}</div>
                </div>
              ))}
            </div>
          )}
          {authMode === "signup" && <input className="fi" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />}
          <input className="fi" type="email" placeholder="Email address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <input className="fi" type="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          {authMode === "login" && (
            <div style={{ textAlign: "right", marginBottom: 12, marginTop: -6 }}>
              <button onClick={handleForgotPassword} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Forgot password?</button>
            </div>
          )}
          <button onClick={authMode === "signup" ? handleSignUp : handleLogin} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? <div className="spinner" /> : authMode === "signup" ? (role === "streamer" ? "Start Streaming" : "Start Earning") : "Log In"}
          </button>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
            {authMode === "signup" ? "Already have an account? " : "New to STEM? "}
            <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthError(""); }} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {authMode === "signup" ? "Log in" : "Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
