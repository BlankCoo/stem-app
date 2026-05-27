import MuxPlayer from "@mux/mux-player-react";
import { useApp } from "../AppContext";
import ChatMessages from "../components/ChatMessages";

export default function StreamPage() {
  const {
    go, stream, user, viewerCount, streamAlert,
    isStreamOwner, following, loadingFollow, handleFollow,
    notify, setShowClipModal, isSubscribed, subscribing, setShowSubTierPicker,
    viewChannel, streakDays, getStreakBonus, sess, coins,
    topGifters, activePrediction, predEntries, predCountdown, myPredBet,
    predBetAmount, setPredBetAmount, predForm, setPredForm,
    placeBet, placingBet, createPrediction, setShowCreatePred, showCreatePred,
    lockPrediction, resolvePrediction, cancelPrediction, toggleFeaturedPrediction,
    activePoll, pollVoted, votePoll, endPoll,
    pollForm, setPollForm, createPoll, showPollCreator, setShowPollCreator,
    hypeProgress, hypeCelebrating,
    sendGift, showTipInput, setShowTipInput, customTipAmt, setCustomTipAmt, sendCustomTip,
    triggerGiftAnim, streamClips, streamGoal,
    chatRef, chatRef2,
    slowCooldown, slowModeSecs, setSlowModeSecs,
    subOnly, setSubOnly, followerOnly, setFollowerOnly, clearChat,
    streamEmotes, showEmotePicker, setShowEmotePicker,
    msg, setMsg, sendChat, isBannedFromChannel, viewerTier,
    setShowSignupPrompt, setAuthMode,
    editingStreamInfo, setEditingStreamInfo, streamInfoDraft, setStreamInfoDraft, updateStreamInfo,
    openReport,
  } = useApp();

  return (
    <div className="slayout" style={{ paddingTop: 56 }}>
      <div className="sleft">
        <div className="splayer">
          {/* Stream alert overlay */}
          {streamAlert && (
            <div className="stream-alert">
              <span style={{ fontSize: 28, flexShrink: 0 }}>{streamAlert.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{streamAlert.msg}</div>
                {streamAlert.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{streamAlert.sub}</div>}
              </div>
            </div>
          )}
          {/* Back button — always visible over the player */}
          <button onClick={() => go("disc")} style={{ position: "absolute", top: 10, left: 10, zIndex: 20, background: "rgba(0,0,0,.65)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(6px)" }}>
            ← Home
          </button>
          {/* Viewer count pill */}
          <div className="viewer-count-pill">
            <span style={{ width: 7, height: 7, background: "var(--red)", borderRadius: "50%", animation: "blink 1.6s infinite", flexShrink: 0 }} />
            {(viewerCount || stream.viewers || 0).toLocaleString()} watching
          </div>
          {/* Fullscreen button */}
          <button className="fs-btn" title="Fullscreen" onClick={() => {
            const el = document.querySelector(".splayer");
            if (!document.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); }
            else { (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document); }
          }}>⛶</button>
          {stream.mux_playback_id ? (
            <MuxPlayer
              playbackId={stream.mux_playback_id}
              streamType="live"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              autoPlay
              muted
            />
          ) : (
            <div className="splayer-inner" style={{ background: `linear-gradient(${stream.bg})` }}>
              <div className="splayer-emoji">{stream.emoji}</div>
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span className="lpip" style={{ fontSize: 12, padding: "5px 14px" }}><span className="lpip-dot" />LIVE — {stream.viewers.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Earning coins while you watch</span>
              </div>
            </div>
          )}
        </div>
        <div className="sbelow">
          {editingStreamInfo ? (
            <div style={{ marginBottom: 10 }}>
              <input value={streamInfoDraft.title} onChange={e => setStreamInfoDraft(d => ({ ...d, title: e.target.value }))} placeholder="Stream title" style={{ width: "100%", background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "8px 10px", fontSize: 14, fontWeight: 700, marginBottom: 6, boxSizing: "border-box" }} />
              <input value={streamInfoDraft.game} onChange={e => setStreamInfoDraft(d => ({ ...d, game: e.target.value }))} placeholder="Category / game" style={{ width: "100%", background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "7px 10px", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={updateStreamInfo} style={{ flex: 1, background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditingStreamInfo(false)} style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "8px 0", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 2 }}>
              <div className="stitle" style={{ flex: 1 }}>{stream.title}</div>
              {isStreamOwner && <button onClick={() => { setStreamInfoDraft({ title: stream.title || "", game: stream.game || "" }); setEditingStreamInfo(true); }} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", flexShrink: 0, marginTop: 4 }}>✏️ Edit</button>}
            </div>
          )}
          <div className="sactions">
            <button className={`abtn ${following ? "flwing" : "flw"}`} onClick={handleFollow} disabled={loadingFollow}>
              {loadingFollow ? "..." : following ? "✓ Following" : "+ Follow"}
            </button>
            <button className="abtn" onClick={() => { navigator.clipboard?.writeText(window.location.href); notify("Link copied!"); }}>Share</button>
            <button className="abtn" onClick={() => { if (!user) { setShowSignupPrompt(true); return; } setShowClipModal(true); }}>✂ Clip</button>
            {stream.user_id && stream.user_id !== user?.id && (
              <button className="abtn" style={{ color: "var(--muted)" }} onClick={() => openReport("stream", stream.id || stream.user_id, { title: stream.title, streamer: stream.streamer })}>⚑ Report</button>
            )}
            {stream.user_id && stream.user_id !== user?.id && (
              <button className="abtn" style={{ background: isSubscribed ? "rgba(0,245,160,.12)" : "", border: isSubscribed ? "1px solid rgba(0,245,160,.3)" : "", color: isSubscribed ? "var(--green)" : "" }} onClick={() => isSubscribed ? null : setShowSubTierPicker(true)} disabled={subscribing || isSubscribed}>
                {isSubscribed ? `⭐ Subscribed` : subscribing ? "…" : "⭐ Subscribe"}
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 14, cursor: stream.user_id ? "pointer" : "default" }} onClick={() => stream.user_id && viewChannel(stream.user_id)}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: stream.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{stream.emoji}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{stream.streamer}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{stream.game} · {(stream.follower_count || 0).toLocaleString()} followers</div></div>
            {stream.user_id && <span style={{ fontSize: 11, color: "var(--purple)", flexShrink: 0 }}>View →</span>}
          </div>
          {user ? (
            <div className="earn-box">
              <div className="ebox-title">Session Earnings</div>
              {/* Streak badge */}
              {streakDays >= 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,149,0,.1)", border: "1px solid rgba(255,149,0,.2)", borderRadius: 8, padding: "7px 10px", marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🔥</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)" }}>{streakDays}-day streak</span>
                    {streakDays >= 3 && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>+{getStreakBonus(streakDays)}% speed boost</span>}
                  </div>
                  {streakDays < 3 && <span style={{ fontSize: 11, color: "var(--muted)" }}>{3 - streakDays} day{3 - streakDays > 1 ? "s" : ""} to bonus</span>}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div><div className="ebig">+{sess}</div><div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>coins this session</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 24, color: "var(--gold)" }}>🪙 {coins.toLocaleString()}</div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>total balance</div></div>
              </div>
              <div className="ecells">
                <div className="ecell"><div className="ecell-v" style={{ color: "var(--green)" }}>+4/hr</div><div className="ecell-l">Ad share</div></div>
                <div className="ecell">
                  <div className="ecell-v" style={{ color: "var(--gold)" }}>+{Math.round(10 * (1 + getStreakBonus(streakDays) / 100))}</div>
                  <div className="ecell-l">Per chat</div>
                </div>
                <div className="ecell">
                  <div className="ecell-v" style={{ color: streakDays >= 3 ? "var(--orange)" : "var(--muted)" }}>
                    {streakDays >= 3 ? `+${getStreakBonus(streakDays)}%` : "1x"}
                  </div>
                  <div className="ecell-l">{streakDays >= 3 ? "Bonus" : "Streak"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.10),rgba(255,45,85,.07))", border: "1px solid rgba(124,58,237,.22)", borderRadius: 14, padding: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32 }}>🪙</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Earn coins while you watch</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Free account gets you +4 coins/hr, +10 per chat, real cash withdrawals.</div>
                <button className="btn-g" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => { setAuthMode("signup"); go("auth"); }}>Sign Up Free — Start Earning</button>
              </div>
            </div>
          )}
          {/* Top gifters this session */}
          {Object.keys(topGifters).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Top Gifters</div>
              <div className="gifters-strip">
                {Object.entries(topGifters).sort((a,b) => b[1].total - a[1].total).slice(0,5).map(([uid, g], i) => (
                  <span key={uid} className="gifter-chip">{["🥇","🥈","🥉","4️⃣","5️⃣"][i]} {g.name} · {g.total.toLocaleString()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Active prediction */}
          {activePrediction && (() => {
            const predOpts = [
              { id: "a", label: activePrediction.option_a, color: "var(--green)", fill: "rgba(0,245,160,.15)" },
              { id: "b", label: activePrediction.option_b, color: "var(--red)", fill: "rgba(255,45,85,.15)" },
              ...(activePrediction.option_c ? [{ id: "c", label: activePrediction.option_c, color: "var(--blue)", fill: "rgba(77,159,255,.15)" }] : []),
              ...(activePrediction.option_d ? [{ id: "d", label: activePrediction.option_d, color: "var(--orange)", fill: "rgba(255,149,0,.15)" }] : []),
              ...(activePrediction.option_e ? [{ id: "e", label: activePrediction.option_e, color: "var(--gold)", fill: "rgba(255,200,0,.15)" }] : []),
            ];
            const totalPot = predEntries.reduce((s, e) => s + e.coins, 0);
            const optTotals = Object.fromEntries(predOpts.map(o => [o.id, predEntries.filter(e => e.option === o.id).reduce((s, e) => s + e.coins, 0)]));
            const canBet = activePrediction.status === "open" && predCountdown > 0 && !myPredBet && user?.id !== activePrediction.streamer_id;
            const isOwner = user?.id === activePrediction.streamer_id;
            const myOptTotal = myPredBet ? (optTotals[myPredBet.option] || 0) : 0;
            const potentialPayout = myPredBet && totalPot > 0 && myOptTotal > 0
              ? Math.round(myPredBet.coins * totalPot / myOptTotal)
              : 0;
            const STATUS_COLOR = { open: "var(--green)", locked: "var(--orange)", resolved: "var(--blue)", cancelled: "var(--muted)" };
            const STATUS_LABEL = { open: "OPEN", locked: "LOCKED", resolved: "RESOLVED", cancelled: "CANCELLED" };
            const myBetLabel = myPredBet ? (predOpts.find(o => o.id === myPredBet.option)?.label || myPredBet.option) : null;
            return (
              <div className="pred-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>🔮 {activePrediction.title}{activePrediction.is_featured && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>⭐ FEATURED</span>}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                    {activePrediction.status === "open" && predCountdown > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: predCountdown < 30 ? "var(--red)" : "var(--blue)", fontVariantNumeric: "tabular-nums" }}>
                        {Math.floor(predCountdown / 60)}:{String(predCountdown % 60).padStart(2, "0")}
                      </span>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 800, color: STATUS_COLOR[activePrediction.status], background: `${STATUS_COLOR[activePrediction.status]}18`, border: `1px solid ${STATUS_COLOR[activePrediction.status]}44`, borderRadius: 6, padding: "2px 7px", letterSpacing: .5 }}>
                      {STATUS_LABEL[activePrediction.status]}
                    </span>
                  </div>
                </div>

                {/* Option bars — supports up to 5 */}
                <div style={{ display: "flex", flexDirection: predOpts.length > 2 ? "column" : "row", gap: 6, marginBottom: 12 }}>
                  {predOpts.map(({ id, label, color, fill }) => {
                    const total = optTotals[id] || 0;
                    const pct = totalPot ? Math.round(total / totalPot * 100) : Math.round(100 / predOpts.length);
                    const isWinner = activePrediction.status === "resolved" && activePrediction.winning_option === id;
                    const isMyBet = myPredBet?.option === id;
                    return (
                      <div key={id} style={{ flex: predOpts.length <= 2 ? 1 : undefined, background: "var(--ink3)", border: `1px solid ${isMyBet || isWinner ? color : "rgba(255,255,255,.08)"}`, borderRadius: 10, padding: "8px 10px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: fill, transition: "width .6s ease", borderRadius: 10 }} />
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color, minWidth: 36 }}>{pct}%</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
                            <div style={{ fontSize: 10, color: "var(--muted)" }}>{total.toLocaleString()} 🪙</div>
                          </div>
                          {isWinner && <span style={{ fontSize: 10, color, fontWeight: 800 }}>✓ Winner</span>}
                          {isMyBet && !isWinner && <span style={{ fontSize: 10, color, fontWeight: 700 }}>Your bet</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bet input */}
                {canBet && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <input type="number" min={10} value={predBetAmount} onChange={e => setPredBetAmount(e.target.value)}
                        style={{ flex: 1, background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "Outfit,sans-serif" }} />
                      {[50, 100, 500].map(v => (
                        <button key={v} onClick={() => setPredBetAmount(v)} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 8, padding: "0 8px", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>{v}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(predOpts.length, 3)}, 1fr)`, gap: 6 }}>
                      {predOpts.map(({ id, label, color }) => (
                        <button key={id} onClick={() => placeBet(id)} disabled={placingBet} style={{ background: `${color}18`, border: `1px solid ${color}55`, color, borderRadius: 8, padding: "8px 4px", fontSize: 11, fontWeight: 700, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Bet {label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* My bet status */}
                {myPredBet && activePrediction.status !== "resolved" && (
                  <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: "var(--muted)" }}>Your bet: </span>
                    <span style={{ fontWeight: 700 }}>{myPredBet.coins.toLocaleString()} 🪙 on {myBetLabel}</span>
                    {potentialPayout > 0 && <span style={{ color: "var(--muted)", marginLeft: 6 }}>· ~{potentialPayout.toLocaleString()} 🪙 if win</span>}
                  </div>
                )}

                {/* Resolution result */}
                {activePrediction.status === "resolved" && myPredBet && (
                  <div style={{ borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, background: myPredBet.option === activePrediction.winning_option ? "rgba(0,245,160,.08)" : "rgba(255,45,85,.08)", border: `1px solid ${myPredBet.option === activePrediction.winning_option ? "rgba(0,245,160,.25)" : "rgba(255,45,85,.25)"}`, color: myPredBet.option === activePrediction.winning_option ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                    {myPredBet.option === activePrediction.winning_option ? `🎉 You won! Coins have been paid out.` : `You lost ${myPredBet.coins.toLocaleString()} 🪙`}
                  </div>
                )}

                {/* Streamer controls */}
                {isOwner && activePrediction.status !== "resolved" && activePrediction.status !== "cancelled" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                    {activePrediction.status === "open" && (
                      <button onClick={lockPrediction} style={{ background: "rgba(255,149,0,.12)", border: "1px solid rgba(255,149,0,.3)", color: "var(--orange)", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🔒 Lock Bets</button>
                    )}
                    <button onClick={toggleFeaturedPrediction} style={{ background: activePrediction.is_featured ? "rgba(255,200,0,.15)" : "none", border: activePrediction.is_featured ? "1px solid rgba(255,200,0,.4)" : "1px solid var(--line)", color: activePrediction.is_featured ? "var(--gold)" : "var(--muted)", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>⭐ {activePrediction.is_featured ? "Featured" : "Feature"}</button>
                    {(activePrediction.status === "locked" || activePrediction.status === "open") && predOpts.map(({ id, label, color }) => (
                      <button key={id} onClick={() => resolvePrediction(id)} style={{ flex: 1, minWidth: 70, background: `${color}18`, border: `1px solid ${color}44`, color, borderRadius: 8, padding: "6px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label} Wins</button>
                    ))}
                    <button onClick={cancelPrediction} style={{ background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                  </div>
                )}

                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  {totalPot.toLocaleString()} 🪙 total · {predEntries.length} bet{predEntries.length !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })()}

          {/* Active poll */}
          {activePoll && (() => {
            const totalVotes = Object.values(activePoll.votes).reduce((s,v) => s+v, 0);
            return (
              <div className="poll-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📊 {activePoll.question}</div>
                  {user?.id === stream?.user_id && <button onClick={endPoll} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>End</button>}
                </div>
                {activePoll.options.map(opt => {
                  const pct = totalVotes ? Math.round((activePoll.votes[opt] || 0) / totalVotes * 100) : 0;
                  return (
                    <button key={opt} className={`poll-opt ${pollVoted === opt ? "voted" : ""}`} onClick={() => votePoll(opt)} disabled={!!pollVoted}>
                      <div className="poll-bar" style={{ width: pollVoted ? `${pct}%` : "0%" }} />
                      <span style={{ position: "relative" }}>{opt}{pollVoted && <span style={{ float: "right", fontWeight: 700, color: "var(--purple)" }}>{pct}%</span>}</span>
                    </button>
                  );
                })}
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</div>
              </div>
            );
          })()}

          {/* Poll creator (streamer only) */}
          {user?.id === stream?.user_id && !activePoll && showPollCreator && (
            <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Create Poll</div>
              <input className="fi" style={{ margin: "0 0 8px", fontSize: 13 }} placeholder="Poll question…" value={pollForm.question} onChange={e => setPollForm(f => ({ ...f, question: e.target.value }))} />
              {pollForm.options.map((o, i) => (
                <input key={i} className="fi" style={{ margin: "0 0 6px", fontSize: 13 }} placeholder={`Option ${i+1}`} value={o} onChange={e => { const ops = [...pollForm.options]; ops[i] = e.target.value; setPollForm(f => ({ ...f, options: ops })); }} />
              ))}
              {pollForm.options.length < 4 && <button onClick={() => setPollForm(f => ({ ...f, options: [...f.options, ""] }))} style={{ background: "none", border: "none", color: "var(--purple)", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>+ Add option</button>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={createPoll} className="btn-g" style={{ flex: 1, padding: "8px 0", fontSize: 13 }}>Launch Poll</button>
                <button onClick={() => setShowPollCreator(false)} style={{ background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Prediction creator (streamer only) */}
          {user?.id === stream?.user_id && !activePrediction && showCreatePred && (
            <div style={{ background: "var(--ink3)", border: "1px solid rgba(77,159,255,.25)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🔮 Create Prediction</div>
              <input className="fi" style={{ margin: "0 0 8px", fontSize: 13 }} placeholder="Will I win this round?" value={predForm.title} onChange={e => setPredForm(f => ({ ...f, title: e.target.value }))} />
              <div style={{ marginBottom: 8 }}>
                {predForm.options.map((opt, i) => (
                  <div key={i} style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    <input className="fi" style={{ margin: 0, flex: 1, fontSize: 13 }} placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const opts = [...predForm.options]; opts[i] = e.target.value; setPredForm(f => ({ ...f, options: opts })); }} />
                    {i >= 2 && <button onClick={() => setPredForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} style={{ background: "none", border: "1px solid var(--line)", color: "var(--red)", borderRadius: 6, padding: "0 10px", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>×</button>}
                  </div>
                ))}
                {predForm.options.length < 5 && (
                  <button onClick={() => setPredForm(f => ({ ...f, options: [...f.options, ""] }))} style={{ background: "none", border: "none", color: "var(--blue)", fontSize: 12, cursor: "pointer" }}>+ Add option</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>Duration:</span>
                {[[60, "1 min"], [120, "2 min"], [300, "5 min"]].map(([s, l]) => (
                  <button key={s} onClick={() => setPredForm(f => ({ ...f, duration: s }))} style={{ flex: 1, background: predForm.duration === s ? "rgba(77,159,255,.15)" : "var(--ink4)", border: predForm.duration === s ? "1px solid rgba(77,159,255,.4)" : "1px solid var(--line2)", color: predForm.duration === s ? "var(--blue)" : "var(--muted)", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: predForm.duration === s ? 700 : 400, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={createPrediction} className="btn-g" style={{ flex: 1, padding: "8px 0", fontSize: 13 }}>Start Prediction</button>
                <button onClick={() => setShowCreatePred(false)} style={{ background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Hype Train */}
          {hypeProgress > 0 && (
            <div className="hype-wrap">
              {hypeCelebrating ? (
                <div className="hype-celebrate">🚂 HYPE TRAIN! Keep it going! 🔥</div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>🚂 Hype Train</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{hypeProgress}%</span>
                  </div>
                  <div className="hype-bar"><div className="hype-bar-fill" style={{ width: `${hypeProgress}%` }} /></div>
                </>
              )}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Send a gift</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["🌟", "Star", "1,000"], ["🏆", "Trophy", "5,000"], ["👑", "Crown", "10,000"], ["🚀", "Rocket", "2,500"]].map(([e, n, c]) => (
                <div key={n} className="gift" onClick={() => sendGift(n, c, e)}><span className="gift-e">{e}</span><div className="gift-c">🪙 {c}</div><div className="gift-n">{n}</div></div>
              ))}
              <div className="gift" onClick={() => setShowTipInput(t => !t)} style={{ borderColor: showTipInput ? "rgba(255,200,0,.5)" : "" }}>
                <span className="gift-e">💸</span><div className="gift-c">Custom</div><div className="gift-n">Tip</div>
              </div>
            </div>
            {showTipInput && (
              <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                <input type="number" min={100} step={100} value={customTipAmt} onChange={e => setCustomTipAmt(e.target.value)} placeholder="e.g. 1500" style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 8, color: "#fff", padding: "7px 10px", fontSize: 13, outline: "none" }} onKeyDown={e => e.key === "Enter" && sendCustomTip()} />
                <button className="btn-g" style={{ padding: "7px 14px", fontSize: 12 }} onClick={sendCustomTip}>Tip 🪙</button>
              </div>
            )}
            {/* Quick reactions — free, just for fun */}
            <div className="react-bar">
              {["👍","❤️","😂","😮","🔥"].map(e => (
                <button key={e} className="react-btn" onClick={() => triggerGiftAnim(e, "")}>{e}</button>
              ))}
            </div>
          </div>
          {/* Clips */}
          {streamClips.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Recent Clips</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {streamClips.map(clip => (
                  <div key={clip.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>✂</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clip.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>by {clip.profiles?.full_name || "viewer"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Goal widget — mobile */}
          {streamGoal && streamGoal.goal_target > 0 && (
            <div style={{ background: "rgba(124,58,237,.07)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)" }}>🎯 {streamGoal.goal_label || (streamGoal.goal_type === "followers" ? "Follower Goal" : "Viewer Goal")}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{streamGoal.current.toLocaleString()} / {streamGoal.goal_target.toLocaleString()}</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 3 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--purple),var(--red))", borderRadius: 3, width: `${Math.min(100, (streamGoal.current / streamGoal.goal_target) * 100).toFixed(1)}%`, transition: "width .6s ease" }} />
              </div>
              {streamGoal.current >= streamGoal.goal_target && <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, marginTop: 4 }}>🎉 Goal reached!</div>}
            </div>
          )}
          {/* Mobile chat */}
          <div className="chat-section">
            <div className="chat-hd">
              <span className="chat-hd-title">Live Chat</span>
              <div style={{ display: "flex", align: "center", gap: 8 }}>
                {isStreamOwner && !activePoll && (
                  <button onClick={() => setShowPollCreator(p => !p)} style={{ background: showPollCreator ? "rgba(124,58,237,.2)" : "var(--ink3)", border: "1px solid var(--line2)", color: showPollCreator ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "3px 8px", cursor: "pointer", fontWeight: 700 }}>📊 Poll</button>
                )}
                {isStreamOwner && !activePrediction && (
                  <button onClick={() => setShowCreatePred(p => !p)} style={{ background: showCreatePred ? "rgba(77,159,255,.2)" : "var(--ink3)", border: "1px solid var(--line2)", color: showCreatePred ? "var(--blue)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "3px 8px", cursor: "pointer", fontWeight: 700 }}>🔮 Predict</button>
                )}
                {isStreamOwner && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <select value={slowModeSecs} onChange={e => setSlowModeSecs(Number(e.target.value))} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 6, fontSize: 10, padding: "2px 6px", cursor: "pointer" }}>
                      <option value={0}>No slow</option>
                      <option value={10}>10s</option>
                      <option value={30}>30s</option>
                      <option value={60}>1 min</option>
                    </select>
                    <button onClick={() => setSubOnly(v => !v)} style={{ background: subOnly ? "rgba(124,58,237,.2)" : "var(--ink3)", border: subOnly ? "1px solid var(--purple)" : "1px solid var(--line2)", color: subOnly ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}>Sub</button>
                    <button onClick={() => setFollowerOnly(v => !v)} style={{ background: followerOnly ? "rgba(255,45,85,.15)" : "var(--ink3)", border: followerOnly ? "1px solid rgba(255,45,85,.4)" : "1px solid var(--line2)", color: followerOnly ? "var(--red)" : "var(--muted)", borderRadius: 6, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}>❤️</button>
                    <button onClick={clearChat} title="Clear chat" style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 6, fontSize: 10, padding: "2px 8px", cursor: "pointer" }}>🗑</button>
                  </div>
                )}
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{(viewerCount || stream.viewers || 0).toLocaleString()} 👁</span>
              </div>
            </div>
            <div className="chat-msgs" ref={chatRef}><ChatMessages /></div>
            <div className="chat-foot">
              {user ? (
                <>
                  {slowCooldown > 0 && <div className="slow-badge">⏱ Slow mode — {slowCooldown}s</div>}
                  {slowModeSecs > 0 && slowCooldown === 0 && <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Slow mode: {slowModeSecs}s</div>}
                  <div className="chat-tip">+10 coins per message</div>
                  {showEmotePicker && streamEmotes.length > 0 && (
                    <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 10, padding: 8, marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                      {streamEmotes.map(e => (
                        <img key={e.id} src={e.image_url} alt={`:${e.name}:`} title={`:${e.name}:`} onClick={() => setMsg(m => m + `:${e.name}: `)} style={{ width: 32, height: 32, objectFit: "contain", cursor: "pointer", borderRadius: 4, padding: 2 }} onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,.1)"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"} />
                      ))}
                    </div>
                  )}
                  <div className="chat-row">
                    {streamEmotes.length > 0 && (
                      <button onClick={() => setShowEmotePicker(v => !v)} style={{ background: showEmotePicker ? "rgba(124,58,237,.2)" : "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "0 10px", fontSize: 16, cursor: "pointer", flexShrink: 0, height: 38 }} title="Emotes">😄</button>
                    )}
                    <input className="chat-in" placeholder={isBannedFromChannel ? "You are banned from this chat" : viewerTier === "guest" ? "Chat unlocks at Active Viewer status..." : slowCooldown > 0 ? `Wait ${slowCooldown}s...` : streamEmotes.length ? "Chat or pick an emote..." : "Say something..."} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} disabled={slowCooldown > 0 || isBannedFromChannel || viewerTier === "guest"} />
                    <button className="chat-send" onClick={sendChat} disabled={slowCooldown > 0 || isBannedFromChannel || viewerTier === "guest"}>↑</button>
                  </div>
                </>
              ) : (
                <button onClick={() => setShowSignupPrompt(true)} style={{ width: "100%", background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 10, padding: "11px 14px", color: "rgba(255,255,255,.7)", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Join to chat and earn coins</span>
                  <span style={{ color: "var(--purple)", fontWeight: 700 }}>Sign up →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Desktop chat panel — separate ref to fix auto-scroll */}
      <div className="chat-panel-desktop" style={{ display: "none" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isStreamOwner ? 8 : 0 }}>
            <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, letterSpacing: .5 }}>Live Chat</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{(viewerCount || stream.viewers || 0).toLocaleString()} 👁</span>
          </div>
          {isStreamOwner && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={slowModeSecs} onChange={e => setSlowModeSecs(Number(e.target.value))} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 6, fontSize: 11, padding: "3px 8px", cursor: "pointer", flex: 1 }}>
                <option value={0}>No slow mode</option>
                <option value={10}>Slow: 10s</option>
                <option value={30}>Slow: 30s</option>
                <option value={60}>Slow: 1 min</option>
              </select>
              <button onClick={() => setSubOnly(v => !v)} style={{ background: subOnly ? "rgba(124,58,237,.2)" : "var(--ink3)", border: subOnly ? "1px solid var(--purple)" : "1px solid var(--line2)", color: subOnly ? "var(--purple)" : "var(--muted)", borderRadius: 6, fontSize: 11, padding: "3px 10px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                {subOnly ? "Sub ✓" : "Sub"}
              </button>
              <button onClick={() => setFollowerOnly(v => !v)} title="Follower-only chat" style={{ background: followerOnly ? "rgba(255,45,85,.15)" : "var(--ink3)", border: followerOnly ? "1px solid rgba(255,45,85,.4)" : "1px solid var(--line2)", color: followerOnly ? "var(--red)" : "var(--muted)", borderRadius: 6, fontSize: 11, padding: "3px 10px", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                {followerOnly ? "Fol ✓" : "Fol"}
              </button>
              <button onClick={clearChat} title="Clear chat" style={{ background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--muted)", borderRadius: 6, fontSize: 11, padding: "3px 10px", cursor: "pointer", flexShrink: 0 }}>🗑</button>
            </div>
          )}
        </div>
        {/* Goal widget */}
        {streamGoal && streamGoal.goal_target > 0 && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)" }}>🎯 {streamGoal.goal_label || (streamGoal.goal_type === "followers" ? "Follower Goal" : "Viewer Goal")}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{streamGoal.current.toLocaleString()} / {streamGoal.goal_target.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 3 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,var(--purple),var(--red))", borderRadius: 3, width: `${Math.min(100, (streamGoal.current / streamGoal.goal_target) * 100).toFixed(1)}%`, transition: "width .6s ease" }} />
            </div>
            {streamGoal.current >= streamGoal.goal_target && <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700, marginTop: 4 }}>🎉 Goal reached!</div>}
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }} ref={chatRef2}><ChatMessages /></div>
        <div style={{ padding: 12, borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          {user ? (
            <>
              {slowCooldown > 0 && <div className="slow-badge" style={{ marginBottom: 6 }}>⏱ Slow mode — wait {slowCooldown}s</div>}
              <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 6 }}>+10 coins per message</div>
              {showEmotePicker && streamEmotes.length > 0 && (
                <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 10, padding: 8, marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 120, overflowY: "auto" }}>
                  {streamEmotes.map(e => (
                    <img key={e.id} src={e.image_url} alt={`:${e.name}:`} title={`:${e.name}:`} onClick={() => setMsg(m => m + `:${e.name}: `)} style={{ width: 32, height: 32, objectFit: "contain", cursor: "pointer", borderRadius: 4, padding: 2 }} onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,.1)"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"} />
                  ))}
                </div>
              )}
              <div className="chat-row">
                {streamEmotes.length > 0 && (
                  <button onClick={() => setShowEmotePicker(v => !v)} style={{ background: showEmotePicker ? "rgba(124,58,237,.2)" : "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 8, padding: "0 10px", fontSize: 16, cursor: "pointer", flexShrink: 0, height: 38 }} title="Emotes">😄</button>
                )}
                <input className="chat-in" placeholder={isBannedFromChannel ? "You are banned from this chat" : viewerTier === "guest" ? "Chat unlocks at Active Viewer status..." : slowCooldown > 0 ? `Wait ${slowCooldown}s...` : streamEmotes.length ? "Chat or pick an emote..." : "Say something..."} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} disabled={slowCooldown > 0 || isBannedFromChannel || viewerTier === "guest"} />
                <button className="chat-send" onClick={sendChat} disabled={slowCooldown > 0 || isBannedFromChannel || viewerTier === "guest"}>↑</button>
              </div>
            </>
          ) : (
            <button onClick={() => setShowSignupPrompt(true)} style={{ width: "100%", background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.08))", border: "1px solid rgba(124,58,237,.25)", borderRadius: 10, padding: "11px 14px", color: "rgba(255,255,255,.7)", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Join to chat and earn coins</span>
              <span style={{ color: "var(--purple)", fontWeight: 700 }}>Sign up →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
