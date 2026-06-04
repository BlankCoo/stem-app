import { useApp } from "../AppContext";
import TierBar from "../components/TierBar";

export default function WalletPage() {
  const {
    go, user, profile, coins, firstName, mode, streakDays,
    viewerTier, VIEWER_TIER_INFO,
    getStreakBonus,
    setShowWithdrawModal,
    transactions, loadingTxns, fetchTransactions,
    withdrawHistory, fetchWithdrawHistory,
    predHistory, loadingPredHistory, fetchPredHistory,
    dailyMissions, fetchDailyMissions, claimMissionBonus,
    achievements, fetchAchievements, ACHIEVEMENTS,
    notify, emailVerified,
    resendVerificationEmail,
    referralCode,
    COIN_PACKAGES, handleBuyCoins, buyingCoins,
  } = useApp();

  const pendingWithdrawals = withdrawHistory.filter(w => w.status === "pending" || w.status === "processing");

  return (
    <div className="wallet-page page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 4 }}>My Wallet</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Hey {firstName || "there"}! Your coins and earnings.</div>
      </div>

      {/* Pending withdrawal alert */}
      {pendingWithdrawals.length > 0 && (
        <div style={{ background: "rgba(255,149,0,.08)", border: "1px solid rgba(255,149,0,.3)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", marginBottom: 2 }}>
              {pendingWithdrawals.length === 1
                ? `Withdrawal of $${Number(pendingWithdrawals[0].net_usd).toFixed(2)} in progress`
                : `${pendingWithdrawals.length} withdrawals in progress`}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {pendingWithdrawals[0].status === "processing"
                ? "Payment sent — should arrive in your PayPal within minutes."
                : "Under review — you'll receive payment within 24 hours."}
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--orange)", background: "rgba(255,149,0,.15)", border: "1px solid rgba(255,149,0,.3)", borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
            {pendingWithdrawals[0].status === "processing" ? "PROCESSING" : "PENDING"}
          </span>
        </div>
      )}
      {/* Streak card */}
      <div style={{ background: streakDays >= 3 ? "linear-gradient(135deg,rgba(255,149,0,.12),rgba(255,149,0,.04))" : "var(--card)", border: streakDays >= 3 ? "1px solid rgba(255,149,0,.25)" : "1px solid var(--line)", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 36 }}>{streakDays >= 14 ? "🔥" : streakDays >= 7 ? "🔥" : streakDays >= 3 ? "🔥" : streakDays >= 1 ? "🌱" : "💤"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, color: streakDays >= 3 ? "var(--orange)" : "#fff" }}>
            {streakDays === 0 ? "No active streak" : `${streakDays}-day ${mode === "streamer" ? "stream" : "watch"} streak`}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {streakDays === 0 && (mode === "streamer" ? "Go live today to start your streak and earn bonus coins." : "Watch a stream today to start your streak and earn bonus coins.")}
            {streakDays === 1 && (mode === "streamer" ? "Stream tomorrow to keep your streak going!" : "Watch tomorrow to keep your streak going!")}
            {streakDays === 2 && "One more day for a 1.25x coin bonus!"}
            {streakDays >= 3 && streakDays < 7 && `+${getStreakBonus(streakDays)}% coin speed active · ${7 - streakDays} days to 1.5x`}
            {streakDays >= 7 && streakDays < 14 && `+${getStreakBonus(streakDays)}% coin speed active · ${14 - streakDays} days to 2x`}
            {streakDays >= 14 && "2x coins — maximum streak bonus active!"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 28, color: streakDays >= 3 ? "var(--orange)" : "var(--muted)" }}>{streakDays}d</div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>streak</div>
        </div>
      </div>

      {/* Buy Coins */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">🪙 Buy Coins</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: .5, color: "var(--orange)", background: "rgba(255,149,0,.12)", border: "1px solid rgba(255,149,0,.3)", borderRadius: 20, padding: "3px 10px" }}>COMING SOON</span>
        </div>
        <div style={{ padding: "14px 16px" }}>
          {/* Grayed-out package preview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 16, opacity: .4, pointerEvents: "none", userSelect: "none" }}>
            {COIN_PACKAGES.map(pkg => (
              <div key={pkg.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 12px", position: "relative", textAlign: "center" }}>
                {pkg.tag && (
                  <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: "var(--ink4)", border: "1px solid var(--line)", color: "var(--muted)", fontSize: 9, fontWeight: 800, borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap" }}>
                    {pkg.tag}
                  </div>
                )}
                <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, letterSpacing: .5, color: "var(--gold)", marginBottom: 2 }}>
                  {pkg.coins.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8 }}>
                  coins{pkg.bonus > 0 ? ` (+${pkg.bonus.toLocaleString()} bonus)` : ""}
                </div>
                <div style={{ background: "rgba(255,200,0,.08)", border: "1px solid rgba(255,200,0,.2)", borderRadius: 8, padding: "7px 0", fontSize: 13, fontWeight: 800, color: "var(--gold)" }}>
                  {pkg.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", paddingTop: 4 }}>Coin purchasing coming soon — earn coins free by watching streams.</div>
        </div>
      </div>

      {/* Viewer Tier Card */}
      {mode === "viewer" && (() => {
        const ti = VIEWER_TIER_INFO[viewerTier] || VIEWER_TIER_INFO.guest;
        const days = Math.floor((Date.now() - new Date(profile?.created_at || Date.now())) / 86400000);
        const hw = profile?.hours_watched || 0;
        const sw = profile?.streams_watched || 0;
        const ref = profile?.referral_count || 0;
        const nextTiers = {
          guest: null,
          active: [["Account age", days, 3, "days"], ["Watch time", parseFloat(hw.toFixed(1)), 1, "hrs"], ["Streams watched", sw, 2]],
          verified_earner: [["Account age", days, 90, "days"], ["Watch time", parseFloat(hw.toFixed(1)), 100, "hrs"], ["Referrals", ref, 1]],
          elite: null,
        };
        const reqs = nextTiers[viewerTier];
        const nextTi = ti.next ? VIEWER_TIER_INFO[ti.next] : null;
        return (
          <div style={{ background: "var(--card)", border: `1px solid ${ti.color}40`, borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: (reqs || viewerTier === "guest") ? 14 : 0 }}>
              <div style={{ fontSize: 28 }}>{ti.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: ti.color }}>{ti.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {viewerTier === "guest" && "Verify your email to start earning coins and chatting"}
                  {viewerTier === "active" && "✓ Chat · ✓ Earn coins · ✓ Send gifts"}
                  {viewerTier === "verified_earner" && "✓ Withdrawals · ✓ Referrals · ✓ Streak bonuses"}
                  {viewerTier === "elite" && "✓ 2x coins · ✓ Elite badge · ✓ All features"}
                </div>
              </div>
            </div>
            {viewerTier === "guest" && (
              <button onClick={() => { resendVerificationEmail(); notify("Verification email sent — check your inbox"); }}
                style={{ width: "100%", background: "rgba(255,149,0,.12)", border: "1px solid rgba(255,149,0,.3)", color: "var(--orange)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ✉️ Resend Verification Email
              </button>
            )}
            {reqs && nextTi && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Progress to {nextTi.label} {nextTi.emoji}</div>
                {reqs.map(([label, cur, tgt, unit]) => (
                  <TierBar key={label} label={`${label}${unit ? ` (${unit})` : ""}`} current={cur} target={tgt} color={ti.next === "elite" ? "var(--gold)" : ti.next === "verified_earner" ? "#0ea5e9" : "var(--green)"} />
                ))}
              </div>
            )}
            {!reqs && viewerTier !== "guest" && <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>🏆 Maximum viewer tier reached!</div>}
          </div>
        );
      })()}

      <div className="wcards">
        <div className="wcard g">
          <div className="wcard-l">Withdrawable Balance</div>
          <div className="wcard-v">${(coins / 1000).toFixed(2)}</div>
          <div className="wcard-sub">{coins.toLocaleString()} coins · {Math.max(0, 20000 - coins).toLocaleString()} more needed</div>
          <button
            className="wbtn"
            disabled={!emailVerified || coins < 20000 || (viewerTier !== "verified_earner" && viewerTier !== "elite")}
            onClick={() => {
              if (!emailVerified) { resendVerificationEmail(); notify("Verification email sent — check your inbox"); return; }
              if (coins >= 20000 && (viewerTier === "verified_earner" || viewerTier === "elite")) setShowWithdrawModal(true);
            }}
          >
            {!emailVerified ? "Verify Email to Withdraw" : viewerTier === "guest" || viewerTier === "active" ? "Unlock at Verified Earner" : coins >= 20000 ? "Withdraw Now" : "Withdraw ($20 min)"}
          </button>
        </div>
        <div className="wcard y">
          <div className="wcard-l">STEM Coins</div>
          <div className="wcard-v">🪙 {coins.toLocaleString()}</div>
          <div className="wcard-sub">1,000 coins = $1.00 · 2% fee</div>
          <button className="wbtn" style={{ background: "var(--gold)" }} onClick={() => mode === "streamer" ? go("dash") : go("disc")}>{mode === "streamer" ? "Go Live" : "Earn Coins"}</button>
        </div>
        <div className="wcard p">
          <div className="wcard-l">Total Earned</div>
          <div className="wcard-v">${(profile?.total_earned || 0).toFixed(2)}</div>
          <div className="wcard-sub">{mode === "streamer" ? "Streaming, gifts, referrals" : "Watching, chatting, referrals"}</div>
          <button className="wbtn" style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", opacity: .7, cursor: "default" }} disabled>Coming Soon</button>
        </div>
      </div>
      {/* Premium Coming Soon */}
      <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.1),rgba(255,45,85,.07))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 16, padding: "20px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 32 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, letterSpacing: .5, marginBottom: 3 }}>STEM Premium</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>2x earnings, priority withdrawals, ad-free — coming soon.</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: "var(--purple)", background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 20, padding: "4px 10px", flexShrink: 0, letterSpacing: .5 }}>SOON</span>
      </div>

      {/* Referral */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">🔗 Referral Program</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Invite friends to STEM and you both earn <strong style={{ color: "var(--gold)" }}>500 coins</strong> when they sign up.</div>
          {profile?.referral_code ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input readOnly value={`${window.location.origin}/?ref=${profile.referral_code}`} className="fi" style={{ margin: 0, flex: 1, fontSize: 12, fontFamily: "monospace" }} />
                <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?ref=${profile.referral_code}`); notify("Referral link copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
                {typeof navigator.share === "function" && (
                  <button onClick={() => navigator.share({ title: "Join STEM — Earn Money Watching Streams", text: `Sign up with my link and we both get 500 free coins!`, url: `${window.location.origin}/?ref=${profile.referral_code}` }).catch(() => {})} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 10, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Share</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--green)" }}>{profile?.referral_count || 0}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Friends referred</div>
                </div>
                <div style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--gold)" }}>{((profile?.referral_count || 0) * 500).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Coins earned</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Generating your referral code… refresh the page in a moment.</div>
          )}
        </div>
      </div>

      {/* Withdrawal History — shown first when there are any requests */}
      {withdrawHistory.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-hd">
            <span className="panel-title">💸 Withdrawals</span>
            <button onClick={fetchWithdrawHistory} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
          </div>
          <div>
            {withdrawHistory.map((w, idx) => {
              const sc = { pending: "var(--orange)", processing: "var(--blue)", paid: "var(--green)", rejected: "var(--red)" };
              const icon = { pending: "⏳", processing: "🔄", paid: "✅", rejected: "❌" };
              const isLast = idx === withdrawHistory.length - 1;
              return (
                <div key={w.id} style={{ padding: "14px 16px", borderBottom: isLast ? "none" : "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icon[w.status] || "💸"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>${Number(w.net_usd).toFixed(2)}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{w.amount_coins?.toLocaleString()} coins · {new Date(w.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: sc[w.status], background: `${sc[w.status]}18`, border: `1px solid ${sc[w.status]}44`, borderRadius: 20, padding: "2px 8px" }}>
                          {w.status === "pending" ? "PENDING" : w.status === "processing" ? "PROCESSING" : w.status === "paid" ? "PAID ✓" : "REJECTED"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: w.status === "pending" || w.status === "rejected" ? 6 : 0 }}>
                        → {w.paypal_email}
                      </div>
                      {w.status === "pending" && (
                        <div style={{ fontSize: 11, color: "var(--orange)", background: "rgba(255,149,0,.08)", border: "1px solid rgba(255,149,0,.2)", borderRadius: 8, padding: "5px 10px" }}>
                          Under review — payment sent to your PayPal within 24 hours.
                        </div>
                      )}
                      {w.status === "processing" && (
                        <div style={{ fontSize: 11, color: "var(--blue)", background: "rgba(77,159,255,.08)", border: "1px solid rgba(77,159,255,.2)", borderRadius: 8, padding: "5px 10px" }}>
                          Payment sent — should arrive in your PayPal within minutes.
                        </div>
                      )}
                      {w.status === "rejected" && (
                        <div style={{ fontSize: 11, color: "var(--red)", background: "rgba(255,45,85,.08)", border: "1px solid rgba(255,45,85,.2)", borderRadius: 8, padding: "5px 10px" }}>
                          Rejected — your coins have been refunded. Email <a href="mailto:support@stemapp.online" style={{ color: "var(--red)", fontWeight: 700 }}>support@stemapp.online</a> if you have questions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">📋 Transaction History</span>
          <button onClick={fetchTransactions} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingTxns ? (
          <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13 }}>No transactions yet. Start watching to earn!</div>
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {transactions.map(t => {
              const icons = { watch: "📺", chat: "💬", gift_sent: "🎁", gift_received: "🎁", sub_income: "⭐", follow: "➕", clip: "✂", signup_bonus: "🎉", referral_bonus: "🎁", referral_reward: "🔗", withdrawal: "💸", coins_purchased: "🪙" };
              const colors = { watch: "var(--green)", chat: "var(--blue)", gift_sent: "var(--red)", gift_received: "var(--green)", sub_income: "var(--green)", follow: "var(--green)", clip: "var(--purple)", signup_bonus: "var(--gold)", referral_bonus: "var(--gold)", referral_reward: "var(--gold)", withdrawal: "var(--red)", coins_purchased: "var(--gold)" };
              const isOut = t.type === "withdrawal" || t.type === "gift_sent" || t.type === "subscription";
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icons[t.type] || "🪙"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || t.type}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{new Date(t.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: colors[t.type] || "var(--green)", flexShrink: 0 }}>{isOut ? "-" : "+"}{Math.abs(t.amount).toLocaleString()} 🪙</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prediction History */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">🔮 Prediction History</span>
          <button onClick={fetchPredHistory} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {loadingPredHistory ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
        ) : predHistory.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔮</div>
            No prediction bets yet — join a live stream and bet on an outcome!
          </div>
        ) : (
          <div>
            {predHistory.map(h => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 20 }}>{h.won ? "🎉" : "😔"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.prediction_title || "Prediction"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Bet on: {h.option_label} · {h.coins_bet.toLocaleString()} 🪙 wagered · {new Date(h.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: h.won ? "var(--green)" : "var(--red)", flexShrink: 0 }}>
                  {h.won ? `+${(h.coins_won - h.coins_bet).toLocaleString()} 🪙` : `-${h.coins_bet.toLocaleString()} 🪙`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Missions */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">📋 Daily Missions</span>
          <button onClick={fetchDailyMissions} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {(() => {
          const dm = dailyMissions;
          if (!dm) return <div style={{ padding: "20px 16px", color: "var(--muted)", fontSize: 13 }}>Loading…</div>;
          const allDone = dm.watch_mins >= 10 && dm.chat_count >= 5 && dm.followed_today;
          return (
            <>
              <div className="mission-row">
                <span className="mission-icon">📺</span>
                <div className="mission-bar-wrap">
                  <div className="mission-label">Watch 10 minutes of streams</div>
                  <div className="mission-bar"><div className="mission-bar-fill" style={{ width: `${Math.min(100, (dm.watch_mins / 10) * 100)}%`, background: "linear-gradient(90deg,var(--purple),var(--blue))" }} /></div>
                  <div className="mission-prog">{Math.min(10, dm.watch_mins)}/10 min</div>
                </div>
                <span style={{ fontSize: 18 }}>{dm.watch_mins >= 10 ? "✅" : ""}</span>
              </div>
              <div className="mission-row">
                <span className="mission-icon">💬</span>
                <div className="mission-bar-wrap">
                  <div className="mission-label">Send 5 chat messages</div>
                  <div className="mission-bar"><div className="mission-bar-fill" style={{ width: `${Math.min(100, (dm.chat_count / 5) * 100)}%`, background: "linear-gradient(90deg,var(--red),var(--orange))" }} /></div>
                  <div className="mission-prog">{Math.min(5, dm.chat_count)}/5 messages</div>
                </div>
                <span style={{ fontSize: 18 }}>{dm.chat_count >= 5 ? "✅" : ""}</span>
              </div>
              <div className="mission-row" style={{ borderBottom: "none" }}>
                <span className="mission-icon">❤️</span>
                <div className="mission-bar-wrap">
                  <div className="mission-label">Follow a streamer</div>
                  <div className="mission-bar"><div className="mission-bar-fill" style={{ width: dm.followed_today ? "100%" : "0%", background: "linear-gradient(90deg,var(--green),var(--blue))" }} /></div>
                  <div className="mission-prog">{dm.followed_today ? "Done!" : "Not yet"}</div>
                </div>
                <span style={{ fontSize: 18 }}>{dm.followed_today ? "✅" : ""}</span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                {dm.bonus_claimed ? (
                  <div style={{ textAlign: "center", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>🎉 Bonus claimed! Come back tomorrow.</div>
                ) : (
                  <button onClick={claimMissionBonus} disabled={!allDone} style={{ width: "100%", background: allDone ? "linear-gradient(135deg,var(--green),var(--blue))" : "var(--ink3)", border: allDone ? "none" : "1px solid var(--line)", color: allDone ? "#000" : "var(--muted)", borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, cursor: allDone ? "pointer" : "default" }}>
                    {allDone ? "🎁 Claim 500 Coins!" : "Complete all missions to claim 500 coins"}
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>

      {/* Achievements */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">🏆 Achievements</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{achievements.size}/{Object.keys(ACHIEVEMENTS).length} earned</span>
        </div>
        <div className="ach-grid">
          {Object.entries(ACHIEVEMENTS).map(([key, ach]) => {
            const earned = achievements.has(key);
            return (
              <div key={key} className={`ach-card${earned ? " earned" : ""}`} title={ach.desc}>
                <div className="ach-emoji" style={{ opacity: earned ? 1 : 0.25 }}>{ach.emoji}</div>
                <div className="ach-label" style={{ color: earned ? "var(--gold)" : "var(--muted)" }}>{ach.label}</div>
                <div className="ach-desc">{ach.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
