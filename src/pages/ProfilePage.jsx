import { useRef } from "react";
import { useApp } from "../AppContext";
import { supabase } from "../supabase";

export default function ProfilePage() {
  const {
    profile, coins, initials, firstName, mode, user,
    viewerTier, streamerTier,
    VIEWER_TIER_INFO, STREAMER_TIER_INFO,
    editProfile, setEditProfile,
    profileMsg, savingProfile,
    handleSaveProfile, handleLogout, switchMode,
    uploadAvatar, uploadingAvatar,
    setProfile, notify,
  } = useApp();

  const fileRef = useRef(null);

  return (
    <div className="profile-page page">
      <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>My Profile</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>Manage your account and view your stats</div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        {/* Avatar */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,.12)", display: "block" }} />
            : <div className="profile-avatar">{initials}</div>
          }
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            style={{ position: "absolute", bottom: 0, right: 0, background: "var(--purple)", border: "2px solid var(--ink)", color: "#fff", borderRadius: "50%", width: 26, height: 26, fontSize: 13, cursor: uploadingAvatar ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: uploadingAvatar ? 0.6 : 1 }}
          >
            {uploadingAvatar ? "…" : "✎"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{profile?.full_name || "Your Name"}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>@{profile?.username || "username"}</div>
        {profile?.bio && <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 8, maxWidth: 300, margin: "0 auto 10px" }}>{profile.bio}</div>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: profile?.role === "streamer" ? "rgba(124,58,237,.1)" : "rgba(0,245,160,.1)", border: profile?.role === "streamer" ? "1px solid rgba(124,58,237,.3)" : "1px solid rgba(0,245,160,.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: profile?.role === "streamer" ? "var(--purple)" : "var(--green)" }}>
          {profile?.role === "streamer" ? "🎙 Streamer" : "👁 Viewer"}
        </div>
        {(() => {
          const ti = mode === "viewer" ? (VIEWER_TIER_INFO[viewerTier] || VIEWER_TIER_INFO.guest) : (streamerTier !== "none" ? STREAMER_TIER_INFO[streamerTier] : null);
          if (!ti) return null;
          return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${ti.color}18`, border: `1px solid ${ti.color}44`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: ti.color, marginTop: 6 }}>
              {ti.emoji} {ti.label}
            </div>
          );
        })()}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 28 }}>
        <div className="profile-stat"><div className="profile-stat-v">{coins.toLocaleString()}</div><div className="profile-stat-l">Coins</div></div>
        <div className="profile-stat"><div className="profile-stat-v">${(coins / 1000).toFixed(2)}</div><div className="profile-stat-l">Value</div></div>
        <div className="profile-stat"><div className="profile-stat-v">${(profile?.total_earned || 0).toFixed(2)}</div><div className="profile-stat-l">Earned</div></div>
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Edit Profile</span></div>
        <div style={{ padding: 16 }}>
          {profileMsg === "success" && <div className="success-msg">Profile updated!</div>}
          {profileMsg && profileMsg !== "success" && <div className="error-msg">{profileMsg}</div>}
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Full Name</label>
          <input className="fi" placeholder="Your full name" value={editProfile.fullName} onChange={e => setEditProfile({ ...editProfile, fullName: e.target.value })} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Username</label>
          <input className="fi" placeholder="Your username" value={editProfile.username} onChange={e => setEditProfile({ ...editProfile, username: e.target.value })} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Bio</label>
          <input className="fi" placeholder="Tell people about yourself..." value={editProfile.bio} onChange={e => setEditProfile({ ...editProfile, bio: e.target.value })} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block", marginTop: 4 }}>Social Links</label>
          {[["twitter", "🐦 Twitter / X username"], ["instagram", "📸 Instagram username"], ["youtube", "▶️ YouTube channel URL"], ["tiktok", "🎵 TikTok username"]].map(([key, ph]) => (
            <input key={key} className="fi" placeholder={ph} value={editProfile[key]} onChange={e => setEditProfile({ ...editProfile, [key]: e.target.value })} style={{ marginBottom: 6 }} />
          ))}
          <button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: "100%", background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.7 : 1 }}>
            {savingProfile ? <div className="spinner" /> : "Save Changes"}
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-hd"><span className="panel-title">Account</span></div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>Email</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{user?.email}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Account Type</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{profile?.role === "streamer" ? "Streamer" : "Viewer"} account</div>
            </div>
            <button onClick={() => switchMode(profile?.role === "streamer" ? "viewer" : "streamer")} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--txt)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Switch</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Go-Live Email Alerts</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Email me when streamers I follow go live</div>
            </div>
            <button
              onClick={async () => {
                const next = !(profile?.email_notifications ?? false);
                await supabase.from("profiles").update({ email_notifications: next }).eq("id", user.id);
                setProfile(p => ({ ...p, email_notifications: next }));
                notify(next ? "Go-live emails enabled" : "Go-live emails disabled");
              }}
              style={{ background: (profile?.email_notifications) ? "rgba(0,245,160,.12)" : "var(--ink4)", border: (profile?.email_notifications) ? "1px solid rgba(0,245,160,.3)" : "1px solid var(--line2)", color: (profile?.email_notifications) ? "var(--green)" : "var(--muted)", borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
            >
              {(profile?.email_notifications) ? "ON" : "OFF"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--red)" }}>Log Out</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Sign out of your account</div></div>
            <button onClick={handleLogout} style={{ background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Log Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
