import { useState } from "react";
import { useApp } from "../AppContext";

function GiftSubModal({ stream, user, chat, handleGiftSub, giftingSubTo, setShowGiftSubModal, notify }) {
  const [qty, setQty] = useState(1);
  const cost = qty * 1000;
  const chatViewerCount = new Set(
    chat.filter(m => m.uid && m.uid !== user?.id && m.uid !== stream?.user_id).map(m => m.uid)
  ).size;
  return (
    <div className="modal-overlay" onClick={() => setShowGiftSubModal(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <div className="modal-title">🎁 Gift Subscriptions</div>
        <div className="modal-sub" style={{ marginBottom: 20 }}>
          Gift subs to random viewers in {stream?.streamer}'s chat. Each gets 30 days subscribed.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1, 5, 10].map(n => (
            <button key={n} onClick={() => setQty(n)}
              style={{ flex: 1, background: qty === n ? "linear-gradient(135deg,var(--purple),var(--red))" : "var(--ink3)", border: qty === n ? "none" : "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "10px 0", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              {n}
            </button>
          ))}
        </div>
        <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Cost</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)" }}>🪙 {cost.toLocaleString()} coins</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16, textAlign: "center" }}>
          {chatViewerCount > 0 ? `${chatViewerCount} eligible viewer${chatViewerCount > 1 ? "s" : ""} in chat` : "No other viewers in chat yet"}
        </div>
        <button onClick={() => handleGiftSub(qty)} disabled={giftingSubTo || chatViewerCount === 0}
          className="btn-g" style={{ width: "100%", marginBottom: 8, opacity: chatViewerCount === 0 ? .4 : 1 }}>
          {giftingSubTo ? "Gifting…" : `🎁 Gift ${qty} Sub${qty > 1 ? "s" : ""} (${cost.toLocaleString()} 🪙)`}
        </button>
        <button onClick={() => setShowGiftSubModal(false)} style={{ width: "100%", background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "9px 0", fontSize: 13, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

export default function Modals() {
  const [onboardStep, setOnboardStep] = useState(1);
  const {
    go, stream, user, profile, coins,
    liveStreams, handleRaid,
    showGiftSubModal, setShowGiftSubModal, giftingSubTo, handleGiftSub,
    chat,
    streakDays, getStreakBonus,
    showClipModal, setShowClipModal, clipTitle, setClipTitle, createClip, savingClip,
    showScheduleModal, setShowScheduleModal, scheduleForm, setScheduleForm,
    handleAddSchedule, savingSchedule, STREAM_CATS,
    showWithdrawModal, setShowWithdrawModal, withdrawCoins, setWithdrawCoins,
    withdrawPaypal, setWithdrawPaypal, handleWithdraw, processingWithdraw,
    showGoLive, setShowGoLive, goLiveStep, setGoLiveStep,
    goLiveForm, setGoLiveForm, handleGoLive, savingGoLive,
    muxStreamKey, handleEndStream, notify,
    showSignupPrompt, setShowSignupPrompt, setAuthMode,
    giftAnims,
    predRecap, setPredRecap,
    toast,
    showSubTierPicker, setShowSubTierPicker, SUB_TIERS, handleSubscribe,
    streamRecap, setStreamRecap,
    showReportModal, setShowReportModal, reportType, reportTargetMeta,
    reportReason, setReportReason, submitReport, submittingReport,
    showWelcome, setShowWelcome,
    emailVerified, resendVerificationEmail,
  } = useApp();

  return (
    <>
      {/* CLIP MODAL */}
      {showClipModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowClipModal(false)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-title">✂ Create Clip</div>
            <div className="modal-sub">Save this moment — earn +{Math.round(25 * (1 + getStreakBonus(streakDays) / 100))} coins{getStreakBonus(streakDays) > 0 ? ` (${getStreakBonus(streakDays)}% streak bonus!)` : ""}!</div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Clip Title (optional)</label>
            <input
              className="fi"
              placeholder={`Clip by ${profile?.full_name?.split(" ")[0] || "viewer"}`}
              value={clipTitle}
              onChange={e => setClipTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createClip()}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => { setShowClipModal(false); setClipTitle(""); }} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={createClip} disabled={savingClip} style={{ flex: 2, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingClip ? "not-allowed" : "pointer", opacity: savingClip ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {savingClip ? <div className="spinner" /> : <>✂ Save Clip — +{Math.round(25 * (1 + getStreakBonus(streakDays) / 100))} coins</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowScheduleModal(false)}>
          <div className="modal-box">
            <div className="modal-title">📅 Schedule a Stream</div>
            <div className="modal-sub">Let your audience know when you're going live next.</div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Stream Title</label>
            <input
              className="fi"
              placeholder="e.g. Sunday Ranked Games, Chill Music Stream..."
              value={scheduleForm.title}
              onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              autoFocus
            />
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Category</label>
            <select className="select-fi" value={scheduleForm.category} onChange={e => setScheduleForm({ ...scheduleForm, category: e.target.value })}>
              {STREAM_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Date</label>
                <input type="date" className="fi" style={{ margin: 0 }} value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Time</label>
                <input type="time" className="fi" style={{ margin: 0 }} value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowScheduleModal(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddSchedule} disabled={savingSchedule} style={{ flex: 2, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingSchedule ? "not-allowed" : "pointer", opacity: savingSchedule ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {savingSchedule ? <div className="spinner" /> : "Schedule Stream"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowWithdrawModal(false)}>
          <div className="modal-box">
            <div className="modal-title">💸 Withdraw Earnings</div>
            <div className="modal-sub">Request is reviewed manually — paid within 24 hours via PayPal or bank transfer.</div>

            {/* Email verification gate */}
            {!emailVerified && (
              <div style={{ background: "rgba(255,149,0,.1)", border: "1px solid rgba(255,149,0,.35)", borderRadius: 14, padding: "16px 18px", marginBottom: 18, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📧</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--orange)", marginBottom: 6 }}>Email Not Verified</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginBottom: 14 }}>
                  You need to verify your email address before you can withdraw earnings. Check your inbox for the verification link.
                </div>
                <button
                  onClick={resendVerificationEmail}
                  style={{ background: "rgba(255,149,0,.18)", border: "1px solid rgba(255,149,0,.4)", color: "var(--orange)", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Resend Verification Email
                </button>
              </div>
            )}

            {/* Quick amounts */}
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Amount</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[20000, 50000, 100000].filter(a => a <= coins).map(a => (
                <button key={a} onClick={() => setWithdrawCoins(a)} style={{ flex: 1, background: withdrawCoins === a ? "rgba(0,245,160,.1)" : "var(--ink3)", border: withdrawCoins === a ? "1px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, padding: "10px 4px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: withdrawCoins === a ? "var(--green)" : "#fff", transition: "all .15s" }}>
                  ${a / 1000}
                </button>
              ))}
              <button onClick={() => setWithdrawCoins(Math.floor(coins / 1000) * 1000)} style={{ flex: 1, background: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "rgba(0,245,160,.1)" : "var(--ink3)", border: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "1px solid var(--green)" : "1px solid var(--line)", borderRadius: 10, padding: "10px 4px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: withdrawCoins === Math.floor(coins / 1000) * 1000 ? "var(--green)" : "#fff", transition: "all .15s" }}>
                All
              </button>
            </div>
            <input type="number" className="fi" placeholder="Custom coins (min 20,000)" value={withdrawCoins} min={20000} max={coins} onChange={e => setWithdrawCoins(Math.max(0, parseInt(e.target.value) || 0))} />

            {/* Fee breakdown */}
            <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Gross ({withdrawCoins.toLocaleString()} coins)</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${(withdrawCoins / 1000).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Platform fee (2%)</span>
                <span style={{ fontSize: 13, color: "var(--red)" }}>-${((withdrawCoins / 1000) * 0.02).toFixed(2)}</span>
              </div>
              <div style={{ height: 1, background: "var(--line2)", marginBottom: 8 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>You receive</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--green)" }}>${((withdrawCoins / 1000) * 0.98).toFixed(2)}</span>
              </div>
            </div>

            {/* Payout email */}
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Payout Email (PayPal)</label>
            <input className="fi" type="email" placeholder="your@paypal.com" value={withdrawPaypal} onChange={e => setWithdrawPaypal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleWithdraw()} />
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, marginTop: -4 }}>Your request is saved and manually reviewed — you'll receive payment within 24 hours.</div>

            {withdrawCoins < 20000 && withdrawCoins > 0 && (
              <div style={{ fontSize: 12, color: "var(--orange)", marginBottom: 10 }}>Minimum withdrawal is 20,000 coins ($20)</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowWithdrawModal(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button
                onClick={handleWithdraw}
                disabled={!emailVerified || processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins}
                style={{ flex: 2, background: "linear-gradient(135deg,#00f5a0,#00c8a0)", color: "#000", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 800, cursor: !emailVerified || processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins ? "not-allowed" : "pointer", opacity: !emailVerified || processingWithdraw || withdrawCoins < 20000 || withdrawCoins > coins ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {processingWithdraw ? <div className="spinner" /> : !emailVerified ? "Email Required" : `Withdraw $${((withdrawCoins / 1000) * 0.98).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GO LIVE MODAL */}
      {showGoLive && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && goLiveStep === 1 && setShowGoLive(false)}>
          <div className="modal-box">
            {goLiveStep === 1 ? (<>
              <div className="modal-title">Go Live</div>
              <div className="modal-sub">Share your stream with the world — viewers will see you on Discover in real time.</div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Stream Title</label>
              <input
                className="fi"
                placeholder="e.g. Ranked Grind to Diamond, Cooking Pasta Live..."
                value={goLiveForm.title}
                onChange={e => setGoLiveForm({ ...goLiveForm, title: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleGoLive()}
                autoFocus
              />
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Category</label>
              <select
                className="select-fi"
                value={goLiveForm.category}
                onChange={e => setGoLiveForm({ ...goLiveForm, category: e.target.value })}
              >
                {STREAM_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowGoLive(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleGoLive} disabled={savingGoLive} style={{ flex: 2, background: "linear-gradient(135deg,var(--red),#ff6b35)", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: savingGoLive ? "not-allowed" : "pointer", opacity: savingGoLive ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {savingGoLive ? <div className="spinner" /> : <><span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />Go Live Now</>}
                </button>
              </div>
            </>) : (<>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 10, height: 10, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
                <div className="modal-title" style={{ fontSize: 22, margin: 0 }}>You're Live!</div>
              </div>
              <div className="modal-sub" style={{ marginBottom: 18 }}>Configure OBS (or any encoder) with the details below, then start streaming.</div>

              {/* RTMP URL */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .7, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>RTMP URL</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value="rtmps://global-live.mux.com:443/app" className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                  <button onClick={() => { navigator.clipboard?.writeText("rtmps://global-live.mux.com:443/app"); notify("RTMP URL copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
                </div>
              </div>

              {/* Stream Key */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .7, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Stream Key</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value={muxStreamKey} className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                  <button onClick={() => { navigator.clipboard?.writeText(muxStreamKey); notify("Stream key copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
                </div>
              </div>

              {/* OBS steps */}
              <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>OBS Setup</div>
                1. Open OBS → Settings → Stream<br />
                2. Service: <strong style={{ color: "#fff" }}>Custom</strong><br />
                3. Paste the RTMP URL and Stream Key above<br />
                4. Click OK, then <strong style={{ color: "#fff" }}>Start Streaming</strong>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowGoLive(false); setGoLiveStep(1); }} style={{ flex: 1, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Close — I'm Streaming
                </button>
                <button onClick={async () => { await handleEndStream(); setShowGoLive(false); setGoLiveStep(1); }} style={{ flex: 1, background: "var(--ink3)", border: "1px solid rgba(255,45,85,.3)", color: "var(--red)", borderRadius: 12, padding: 13, fontSize: 14, cursor: "pointer" }}>
                  End Stream
                </button>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* SIGNUP PROMPT — shown when guest tries to chat, gift, or follow */}
      {showSignupPrompt && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSignupPrompt(false)}>
          <div className="modal-box" style={{ maxWidth: 360, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
            <div className="modal-title" style={{ fontSize: 26 }}>Join STEM Free</div>
            <div className="modal-sub" style={{ marginBottom: 22 }}>Sign up to join the chat, earn coins while watching, send gifts, and withdraw real cash.</div>
            <button className="btn-g" style={{ width: "100%", padding: "13px 0", fontSize: 15, marginBottom: 10, borderRadius: 12, border: "none" }} onClick={() => { setShowSignupPrompt(false); setAuthMode("signup"); go("auth"); }}>
              Sign Up Free — Start Earning
            </button>
            <button className="btn-o" style={{ width: "100%", padding: "11px 0", fontSize: 14, borderRadius: 12 }} onClick={() => { setShowSignupPrompt(false); setAuthMode("login"); go("auth"); }}>
              Already have an account? Log in
            </button>
            <button onClick={() => setShowSignupPrompt(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", marginTop: 14 }}>
              Continue watching without account
            </button>
          </div>
        </div>
      )}

      {/* GIFT ANIMATIONS */}
      {giftAnims.length > 0 && (
        <div className="gift-anim-wrap">
          {giftAnims.map(g => (
            <div key={g.id} className="gift-anim-item" style={{ left: `${g.x}%` }}>
              <span className="gift-anim-emoji">{g.emoji}</span>
              <span className="gift-anim-label">{g.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* PREDICTION RECAP OVERLAY */}
      {predRecap && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPredRecap(null)}>
          <div style={{ background: "linear-gradient(145deg,var(--ink3),var(--ink4))", border: "1px solid rgba(77,159,255,.3)", borderRadius: 24, padding: "32px 28px", maxWidth: 380, width: "100%", textAlign: "center", animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {predRecap.myResult === "won" ? "🏆" : predRecap.myResult === "lost" ? "😔" : "🔮"}
            </div>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, letterSpacing: 1, marginBottom: 6 }}>Prediction Resolved!</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "rgba(255,255,255,.85)" }}>{predRecap.title}</div>
            <div style={{ background: "rgba(77,159,255,.1)", border: "1px solid rgba(77,159,255,.25)", borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .6, marginBottom: 4 }}>Winner</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--blue)" }}>{predRecap.winLabel}</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "var(--ink4)", borderRadius: 12, padding: "10px 8px" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{predRecap.potCoins.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Total Pot 🪙</div>
              </div>
              <div style={{ flex: 1, background: "var(--ink4)", borderRadius: 12, padding: "10px 8px" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{predRecap.winnerCount}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Winners</div>
              </div>
            </div>
            {predRecap.myResult && (
              <div style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 16, background: predRecap.myResult === "won" ? "rgba(0,245,160,.1)" : "rgba(255,45,85,.08)", border: `1px solid ${predRecap.myResult === "won" ? "rgba(0,245,160,.3)" : "rgba(255,45,85,.25)"}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: predRecap.myResult === "won" ? "var(--green)" : "var(--red)" }}>
                  {predRecap.myResult === "won" ? `You won! 🎉 Payout added to wallet.` : `You lost ${predRecap.myBet.toLocaleString()} 🪙 — better luck next time!`}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => { const txt = encodeURIComponent(`🔮 ${predRecap.winLabel} won the STEM prediction!\n"${predRecap.title}"\n${predRecap.winnerCount} winner${predRecap.winnerCount !== 1 ? "s" : ""} split ${predRecap.potCoins.toLocaleString()} coins 🪙`); window.open(`https://twitter.com/intent/tweet?text=${txt}`, "_blank"); }} style={{ background: "#1DA1F2", border: "none", color: "#fff", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>𝕏 Share</button>
              <button onClick={() => { const txt = encodeURIComponent(`🔮 ${predRecap.winLabel} won! "${predRecap.title}" — ${predRecap.winnerCount} winners split ${predRecap.potCoins.toLocaleString()} coins on STEM 🪙`); window.open(`https://wa.me/?text=${txt}`, "_blank"); }} style={{ background: "#25D366", border: "none", color: "#fff", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>WhatsApp</button>
              <button onClick={() => setPredRecap(null)} style={{ background: "var(--ink4)", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "9px 16px", fontSize: 12, cursor: "pointer" }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">🪙 {toast}</div>}

      {/* SUB TIER PICKER */}
      {showSubTierPicker && (
        <div className="tier-picker-overlay" onClick={() => setShowSubTierPicker(false)}>
          <div className="tier-picker-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, letterSpacing: 1, marginBottom: 4 }}>Subscribe to {stream?.streamer}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Pick a tier — supports the streamer directly!</div>
            {SUB_TIERS.map(t => (
              <div key={t.tier} className="tier-card" style={{ background: `${t.color}14`, borderColor: `${t.color}40` }} onClick={() => handleSubscribe(t.tier)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{t.badge}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.color }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.cost.toLocaleString()} coins · 30 days</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>🪙 {t.cost.toLocaleString()}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowSubTierPicker(false)} style={{ width: "100%", background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "10px", fontSize: 13, cursor: "pointer", marginTop: 4 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* STREAM RECAP MODAL */}
      {streamRecap && (
        <div className="recap-overlay" onClick={() => setStreamRecap(null)}>
          <div className="recap-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, letterSpacing: 1, marginBottom: 2 }}>Stream Recap 📺</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{streamRecap.title}"</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                ["⏱", "Duration", `${streamRecap.durationMins}m`],
                ["👥", "Peak Viewers", (streamRecap.peak || 0).toLocaleString()],
                ["📺", "Ad Revenue", `+${streamRecap.adRevenue || 0} 🪙`],
                ["🪙", "You Earned", `+${streamRecap.viewerEarnings || 0} 🪙`],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, letterSpacing: .5, color: "var(--gold)" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            {streamRecap.topGifters && streamRecap.topGifters.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Top Gifters</div>
                {streamRecap.topGifters.map((g, i) => (
                  <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 14 }}>{["🥇","🥈","🥉"][i] || "🎁"}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>🪙 {g.coins.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setStreamRecap(null)} className="btn-g" style={{ width: "100%", marginBottom: 12 }}>Done</button>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: .6, textTransform: "uppercase", marginBottom: 10 }}>🚀 Raid a Channel</div>
              {liveStreams.filter(s => s.user_id !== user?.id).length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "8px 0" }}>No other streams live to raid right now.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                  {liveStreams.filter(s => s.user_id !== user?.id).slice(0, 5).map(s => (
                    <button key={s.id} onClick={() => { handleRaid(s); setStreamRecap(null); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,.5)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.profiles?.full_name || s.streamer_name || "Streamer"}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{s.category} · 👁 {(s.viewer_count || 0).toLocaleString()}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", flexShrink: 0 }}>Raid →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-title">⚑ Submit a Report</div>
            <div className="modal-sub" style={{ marginBottom: 16 }}>
              {reportType === "stream" && `Reporting stream${reportTargetMeta?.title ? `: "${reportTargetMeta.title}"` : ""}`}
              {reportType === "message" && `Reporting message from ${reportTargetMeta?.author || "user"}`}
              {reportType === "user" && `Reporting user ${reportTargetMeta?.username || ""}`}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {["Spam or scam", "Hate speech", "Harassment", "Inappropriate content", "Impersonation", "Other"].map(r => (
                <button key={r} onClick={() => setReportReason(r)} style={{ background: reportReason === r ? "rgba(124,58,237,.2)" : "var(--ink3)", border: `1px solid ${reportReason === r ? "rgba(124,58,237,.5)" : "var(--line)"}`, color: reportReason === r ? "var(--purple)" : "var(--muted)", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>{r}</button>
              ))}
            </div>
            <textarea
              placeholder="Add more detail (optional)..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              style={{ width: "100%", background: "var(--ink4)", border: "1px solid var(--line2)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14 }}
            />
            <button onClick={submitReport} disabled={submittingReport || !reportReason.trim()} className="btn-g" style={{ width: "100%", opacity: !reportReason.trim() ? .5 : 1 }}>
              {submittingReport ? "Submitting…" : "Submit Report"}
            </button>
            <button onClick={() => setShowReportModal(false)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", padding: 8 }}>Cancel</button>
          </div>
        </div>
      )}
      {/* WELCOME / ONBOARDING MODAL — 3-step */}
      {showWelcome && (() => {
        const steps = [
          {
            icon: "📺",
            title: "Watch Streams, Earn Coins",
            body: "Every minute you spend watching a live stream earns you coins automatically. Chat, follow streamers, and create clips for even more bonus coins.",
            accent: "#7c3aed",
          },
          {
            icon: "💸",
            title: "Coins = Real Cash",
            body: "1,000 coins = $1.00. Once you hit 20,000 coins ($20 minimum), you can withdraw directly to PayPal — paid within 24 hours.",
            accent: "#00f5a0",
          },
          {
            icon: "🔗",
            title: "Invite Friends, Earn Together",
            body: "Share your referral link from the Wallet page. You and every friend who joins both receive 500 bonus coins — no cap on referrals.",
            accent: "#ffc800",
          },
        ];
        const s = steps[onboardStep - 1];
        const isLast = onboardStep === steps.length;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}>
            <div style={{ background: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: 24, width: "100%", maxWidth: 420, overflow: "hidden", animation: "popIn .35s cubic-bezier(.34,1.56,.64,1)" }}>
              {/* Progress bar */}
              <div style={{ height: 3, background: "var(--ink4)" }}>
                <div style={{ height: "100%", background: `linear-gradient(90deg,var(--purple),var(--red))`, width: `${(onboardStep / steps.length) * 100}%`, transition: "width .35s ease" }} />
              </div>

              {/* Icon + step counter */}
              <div style={{ padding: "32px 28px 0", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 12, filter: `drop-shadow(0 4px 16px ${s.accent}66)` }}>{s.icon}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
                  {steps.map((_, i) => (
                    <div key={i} style={{ width: i === onboardStep - 1 ? 20 : 6, height: 6, borderRadius: 3, background: i === onboardStep - 1 ? "var(--purple)" : "var(--ink4)", transition: "all .25s ease" }} />
                  ))}
                </div>
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.65, marginBottom: 28, padding: "0 4px" }}>{s.body}</div>
              </div>

              {/* Navigation */}
              <div style={{ padding: "0 28px 28px", display: "flex", gap: 10 }}>
                {onboardStep > 1 && (
                  <button
                    onClick={() => setOnboardStep(v => v - 1)}
                    style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 14, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isLast) {
                      localStorage.setItem("stem_onboarded", "1");
                      setShowWelcome(false);
                      setOnboardStep(1);
                    } else {
                      setOnboardStep(v => v + 1);
                    }
                  }}
                  style={{ flex: onboardStep > 1 ? 2 : 1, background: "linear-gradient(135deg,var(--purple),var(--red))", color: "#fff", border: "none", borderRadius: 14, padding: "13px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: .3 }}
                >
                  {isLast ? "Start Earning →" : `Next (${onboardStep}/${steps.length})`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* GIFT SUB MODAL */}
      {showGiftSubModal && <GiftSubModal stream={stream} user={user} chat={chat} handleGiftSub={handleGiftSub} giftingSubTo={giftingSubTo} setShowGiftSubModal={setShowGiftSubModal} notify={notify} />}
    </>
  );
}
