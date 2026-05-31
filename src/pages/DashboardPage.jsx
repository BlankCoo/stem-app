import { useApp } from "../AppContext";
import { supabase } from "../supabase";
import TierBar from "../components/TierBar";

export default function DashboardPage() {
  const {
    go, user, profile, setProfile, coins, firstName,
    isStreaming, goLiveForm,
    editingLiveInfo, setEditingLiveInfo, liveInfoForm, setLiveInfoForm,
    updateLiveInfo, savingLiveInfo,
    setGoLiveStep, setShowGoLive, handleEndStream,
    muxStreamKey, adRevenue,
    showGoalEditor, setShowGoalEditor, streamGoal, goalForm, setGoalForm,
    saveGoal, savingGoal, clearGoal,
    streamerTier, STREAMER_TIER_INFO,
    streamerAnalytics, loadingAnalytics, fetchStreamerAnalytics,
    CAT_META,
    setShowScheduleModal, channelSchedule, upcomingSchedule, deleteSchedule,
    myEmotes, emoteName, setEmoteName, emoteFileRef,
    uploadEmote, uploadingEmote, deleteEmote,
    bannedWords, newBannedWord, setNewBannedWord, addBannedWord, removeBannedWord,
    chatBans, unbanUser,
    notify,
  } = useApp();

  return (
    <div className="dash-page page">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 36, letterSpacing: 1, marginBottom: 3 }}>Creator Dashboard</div>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Hey {firstName || "Streamer"}! Ready to go live and get paid?</div>
      </div>

      {/* GO LIVE HERO — dominant element */}
      {isStreaming ? (
        <div style={{ background: "linear-gradient(135deg,rgba(255,45,85,.15),rgba(255,107,53,.1))", border: "1px solid rgba(255,45,85,.4)", borderRadius: 20, padding: "22px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--red),#ff6b35)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, background: "var(--red)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
              <span style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 22, letterSpacing: .5, color: "var(--red)" }}>LIVE NOW</span>
            </div>
            {!editingLiveInfo && <>
              <span style={{ fontSize: 14, fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{goLiveForm.title}"</span>
              <span style={{ fontSize: 12, color: "var(--muted)", background: "rgba(255,255,255,.06)", borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>{goLiveForm.category}</span>
              <button onClick={() => { setLiveInfoForm({ title: goLiveForm.title, category: goLiveForm.category }); setEditingLiveInfo(true); }} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Edit</button>
            </>}
          </div>
          {editingLiveInfo && (
            <div style={{ marginBottom: 14 }}>
              <input value={liveInfoForm.title} onChange={e => setLiveInfoForm(f => ({ ...f, title: e.target.value }))} placeholder="Stream title..." style={{ width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, marginBottom: 8, boxSizing: "border-box" }} />
              <select value={liveInfoForm.category} onChange={e => setLiveInfoForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13, marginBottom: 10 }}>
                {["Gaming","IRL","Music","Sports","Education","Art","Tech","Just Chatting","Cooking","Travel","Business","Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={updateLiveInfo} disabled={savingLiveInfo} style={{ flex: 1, background: "var(--green)", color: "#000", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{savingLiveInfo ? "Saving..." : "Save"}</button>
                <button onClick={() => setEditingLiveInfo(false)} style={{ flex: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", borderRadius: 8, padding: "9px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>Your stream is live — viewers can find you on the Discover page. Open OBS and start streaming if you haven't already.</div>
          {muxStreamKey && (
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, letterSpacing: .5, textTransform: "uppercase" }}>Stream Key</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,.6)", flex: 1, wordBreak: "break-all" }}>{muxStreamKey.slice(0, 24)}•••</span>
              <button onClick={() => { navigator.clipboard?.writeText(muxStreamKey); notify("Stream key copied!"); }} style={{ background: "var(--ink4)", border: "1px solid var(--line2)", color: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Copy</button>
            </div>
          )}
          {/* Live ad revenue ticker */}
          {adRevenue > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,245,160,.08)", border: "1px solid rgba(0,245,160,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📺</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>Ad Revenue This Stream</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>~4 coins/hr per viewer · 40% your share</div>
              </div>
              <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, color: "var(--green)" }}>+{adRevenue} 🪙</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => go("disc")} className="btn-g" style={{ flex: 1, minWidth: 120 }}>View on Discover</button>
            <button onClick={handleEndStream} className="btn-red" style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />End Stream
            </button>
          </div>
          {/* Goal editor */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showGoalEditor ? 10 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: streamGoal ? "var(--purple)" : "var(--muted)" }}>
                🎯 {streamGoal ? `Goal: ${streamGoal.current.toLocaleString()} / ${streamGoal.goal_target.toLocaleString()} ${streamGoal.goal_type}` : "Set a stream goal"}
              </div>
              <button onClick={() => { setGoalForm(streamGoal ? { type: streamGoal.goal_type, target: streamGoal.goal_target, label: streamGoal.goal_label || "" } : { type: "followers", target: 500, label: "" }); setShowGoalEditor(v => !v); }} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>{showGoalEditor ? "Cancel" : streamGoal ? "Edit" : "Set"}</button>
            </div>
            {showGoalEditor && (
              <div>
                <select value={goalForm.type} onChange={e => setGoalForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, marginBottom: 6 }}>
                  <option value="followers">Followers</option>
                  <option value="viewers">Viewers</option>
                </select>
                <input type="number" min="1" value={goalForm.target} onChange={e => setGoalForm(f => ({ ...f, target: e.target.value }))} placeholder="Target (e.g. 500)" style={{ width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }} />
                <input value={goalForm.label} onChange={e => setGoalForm(f => ({ ...f, label: e.target.value }))} placeholder="Label (optional — e.g. '500 followers to unlock emotes!')" style={{ width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveGoal} disabled={savingGoal} style={{ flex: 2, background: "var(--purple)", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{savingGoal ? "Saving..." : "Save Goal"}</button>
                  {streamGoal && <button onClick={clearGoal} style={{ flex: 1, background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "9px", fontSize: 12, cursor: "pointer" }}>Clear</button>}
                </div>
              </div>
            )}
            {streamGoal && !showGoalEditor && (
              <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--purple),var(--red))", borderRadius: 2, width: `${Math.min(100, (streamGoal.current / streamGoal.goal_target) * 100).toFixed(1)}%` }} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.12),rgba(255,45,85,.10))", border: "2px dashed rgba(255,45,85,.35)", borderRadius: 20, padding: "32px 28px", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎙</div>
          <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 32, letterSpacing: 1, marginBottom: 8 }}>Ready to Stream?</div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
            Go live in seconds. Your viewers earn coins while they watch — the more engaged your audience, the more everyone earns.
          </div>
          <button
            onClick={() => { setGoLiveStep(1); setShowGoLive(true); }}
            style={{ background: "linear-gradient(135deg,var(--red),#ff6b35)", color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 30px rgba(255,45,85,.4)", display: "inline-flex", alignItems: "center", gap: 10, letterSpacing: .3 }}
          >
            <span style={{ width: 10, height: 10, background: "#fff", borderRadius: "50%", animation: "blink 1.6s infinite" }} />
            Go Live Now
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {[["⚡", "Instant setup"], ["🪙", "Earn from stream 1"], ["📡", "Real RTMP via OBS"]].map(([icon, label]) => (
              <div key={label} style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OBS Alert Overlay */}
      {user && (
        <div style={{ background: "linear-gradient(135deg,rgba(77,159,255,.08),rgba(124,58,237,.06))", border: "1px solid rgba(77,159,255,.22)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>📡</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>OBS Alert Overlay</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>Add as a Browser Source in OBS to show follow, gift and sub alerts on stream.</div>
            </div>
          </div>
          <div style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <code style={{ fontSize: 12, color: "var(--blue)", flex: 1, wordBreak: "break-all", fontFamily: "monospace" }}>
              {window.location.origin}/overlay/{user.id}
            </code>
            <button
              onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/overlay/${user.id}`); notify("Overlay URL copied!"); }}
              style={{ background: "rgba(77,159,255,.18)", border: "1px solid rgba(77,159,255,.35)", color: "var(--blue)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
            >
              Copy URL
            </button>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
            <span style={{ fontWeight: 700, color: "rgba(255,255,255,.5)" }}>OBS setup:</span> Sources → + → Browser → paste URL → set 800×200 → check "Shutdown source when not visible" → OK
          </div>
        </div>
      )}

      {/* KPIs — real data */}
      <div className="kpis" style={{ marginBottom: 16 }}>
        {[
          ["r", "Balance", `$${(coins / 1000).toFixed(2)}`, `${coins.toLocaleString()} coins`],
          ["g", "Followers", (profile?.follower_count || 0).toLocaleString(), "total followers"],
          ["y", "Total Earned", `$${(profile?.total_earned || 0).toFixed(2)}`, "lifetime"],
          ["b", "Streams", streamerAnalytics.streamCount.toLocaleString(), "total broadcasts"],
        ].map(([col, l, v, ch]) => (
          <div key={l} className={`kpi ${col}`}><div className="kpi-l">{l}</div><div className="kpi-v">{v}</div><div className="kpi-ch">{ch}</div></div>
        ))}
      </div>

      {/* Streamer Tier Card */}
      {(() => {
        const ti = STREAMER_TIER_INFO[streamerTier] || STREAMER_TIER_INFO.none;
        const days = Math.floor((Date.now() - new Date(profile?.created_at || Date.now())) / 86400000);
        const fl = profile?.follower_count || 0;
        const hs = parseFloat((profile?.hours_streamed || 0).toFixed(1));
        const sd = profile?.streaming_days || 0;
        const nextTiers = {
          none: [["Followers", fl, 100], ["Hours streamed", hs, 20, "hrs"], ["Streaming days", sd, 14], ["Account age", days, 30, "days"]],
          affiliate: [["Followers", fl, 500], ["Hours streamed", hs, 100, "hrs"], ["Streaming days", sd, 30]],
          partner: null,
        };
        const reqs = nextTiers[streamerTier];
        const nextTi = ti.next ? STREAMER_TIER_INFO[ti.next] : null;
        return (
          <div style={{ background: "var(--card)", border: `1px solid ${ti.color}40`, borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: reqs ? 16 : 0 }}>
              <div style={{ fontSize: 28 }}>{ti.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: ti.color }}>{ti.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {streamerTier === "none" && "Build an audience to unlock Affiliate status"}
                  {streamerTier === "affiliate" && "✓ Ad revenue share · ✓ Coin payouts · ✓ Virtual gifts"}
                  {streamerTier === "partner" && "✓ Subscriptions · ✓ Brand deals · ✓ Verified badge"}
                </div>
              </div>
              {streamerTier !== "none" && <span style={{ background: `${ti.color}20`, border: `1px solid ${ti.color}50`, color: ti.color, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800 }}>{ti.emoji} {ti.label.toUpperCase()}</span>}
            </div>
            {reqs && nextTi && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Progress to {nextTi.label} {nextTi.emoji}</div>
                {reqs.map(([label, cur, tgt, unit]) => (
                  <TierBar key={label} label={`${label}${unit ? ` (${unit})` : ""}`} current={cur} target={tgt} color={ti.next === "partner" ? "var(--purple)" : "var(--orange)"} />
                ))}
              </div>
            )}
            {!reqs && <div style={{ fontSize: 12, color: "var(--purple)", fontWeight: 700 }}>✅ Maximum streamer tier reached!</div>}
          </div>
        );
      })()}

      {/* Revenue Breakdown — real data */}
      {(() => {
        const giftUsd = streamerAnalytics.giftRevenue / 1000;
        const subUsd = streamerAnalytics.activeSubs;
        const balUsd = coins / 1000;
        const total = giftUsd + subUsd + balUsd || 1;
        const rows = [
          ["Gifts received", giftUsd, "linear-gradient(90deg,var(--gold),var(--orange))"],
          ["Subscriptions", subUsd, "linear-gradient(90deg,var(--green),#00c8a0)"],
          ["Coin balance", balUsd, "linear-gradient(90deg,var(--red),#ff6b35)"],
        ];
        return (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-hd">
              <span className="panel-title">Revenue Breakdown</span>
              <button onClick={fetchStreamerAnalytics} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Refresh</button>
            </div>
            {loadingAnalytics ? (
              <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
            ) : (
              <div style={{ padding: 16 }}>
                {rows.map(([l, usd, grad]) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>${usd.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "var(--ink4)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${Math.round(usd / total * 100)}%`, height: "100%", borderRadius: 4, background: grad, transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>Total value</span>
                  <span style={{ fontWeight: 800, color: "var(--green)" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Ad Revenue Split */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">Ad Revenue Split</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            <div style={{ flex: 40, background: "var(--green)", borderRadius: 4 }} />
            <div style={{ flex: 40, background: "var(--red)", borderRadius: 4 }} />
            <div style={{ flex: 20, background: "rgba(255,255,255,.2)", borderRadius: 4 }} />
          </div>
          {[["var(--green)", "You (streamer)", "40%"], ["var(--red)", "STEM platform", "40%"], ["rgba(255,255,255,.4)", "Your viewers", "20%"]].map(([c, l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Overview — real data */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-hd"><span className="panel-title">Audience Overview</span><span style={{ fontSize: 12, color: "var(--muted)" }}>All time</span></div>
        {loadingAnalytics ? (
          <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : (
          <div style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Peak Viewers", streamerAnalytics.peakViewers.toLocaleString(), "var(--gold)"],
                ["Avg. Viewers", streamerAnalytics.avgPeakViewers.toLocaleString(), "var(--blue)"],
                ["New Followers (30d)", streamerAnalytics.newFollowers30d.toLocaleString(), "var(--purple)"],
                ["Active Subs", streamerAnalytics.activeSubs.toLocaleString(), "var(--green)"],
                ["Total Clips", streamerAnalytics.totalClips.toLocaleString(), "var(--red)"],
                ["Total Streams", streamerAnalytics.streamCount.toLocaleString(), "var(--muted)"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6, fontWeight: 600, letterSpacing: .4, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 26, color: c }}>{v || "0"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Streams — real data */}
      {streamerAnalytics.recentStreams.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-hd"><span className="panel-title">📺 Recent Streams</span></div>
          <div>
            {streamerAnalytics.recentStreams.map((s, i) => {
              const meta = CAT_META[s.category] || CAT_META["Just Chatting"];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < streamerAnalytics.recentStreams.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(${meta.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{meta.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.category} · {new Date(s.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 18, color: "var(--gold)" }}>{(s.peak_viewers || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>peak</div>
                  </div>
                  {s.mux_playback_id && <span style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700, flexShrink: 0 }}>VOD</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stream Schedule */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-title">📅 Stream Schedule</span>
          <button onClick={() => setShowScheduleModal(true)} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
        </div>
        {channelSchedule.length === 0 && upcomingSchedule.filter(s => s.user_id === user?.id).length === 0 ? (
          <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--muted)" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 600 }}>No scheduled streams</div>
            <div style={{ fontSize: 12 }}>Let your audience know when you're going live next.</div>
          </div>
        ) : (
          <div>
            {upcomingSchedule.filter(s => s.user_id === user?.id).map(s => {
              const d = new Date(s.scheduled_at);
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ textAlign: "center", minWidth: 42, background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 8, padding: "6px 4px" }}>
                    <div style={{ fontSize: 10, color: "var(--purple)", fontWeight: 700 }}>{d.toLocaleDateString([], { month: "short" }).toUpperCase()}</div>
                    <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: 20, lineHeight: 1 }}>{d.getDate()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.category} · {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <button onClick={() => deleteSchedule(s.id)} style={{ background: "rgba(255,45,85,.1)", border: "1px solid rgba(255,45,85,.25)", color: "var(--red)", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Channel Emotes */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">😄 Channel Emotes</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{myEmotes.length}/50</span>
            <button
              onClick={async () => {
                const next = !(profile?.emotes_enabled ?? true);
                await supabase.from("profiles").update({ emotes_enabled: next }).eq("id", user.id);
                setProfile(p => ({ ...p, emotes_enabled: next }));
                notify(next ? "Emotes enabled for your channel" : "Emotes disabled for your channel");
              }}
              style={{ background: (profile?.emotes_enabled ?? true) ? "rgba(0,245,160,.12)" : "var(--ink4)", border: (profile?.emotes_enabled ?? true) ? "1px solid rgba(0,245,160,.3)" : "1px solid var(--line2)", color: (profile?.emotes_enabled ?? true) ? "var(--green)" : "var(--muted)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
            >
              {(profile?.emotes_enabled ?? true) ? "ON" : "OFF"}
            </button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {!(profile?.emotes_enabled ?? true) && (
            <div style={{ background: "rgba(255,149,0,.08)", border: "1px solid rgba(255,149,0,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--orange)" }}>
              Emotes are currently disabled — viewers cannot use your emotes in chat. Toggle ON to enable them.
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            Upload emotes your viewers can use in your chat. Type <code style={{ background: "var(--ink4)", padding: "1px 5px", borderRadius: 4 }}>:emotename:</code> to use them.
          </div>
          {/* Upload form */}
          <div style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Emote Name</label>
                <input className="fi" style={{ margin: 0 }} placeholder="e.g. stemFire" value={emoteName} onChange={e => setEmoteName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} />
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Letters, numbers, underscore only</div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Image (PNG/GIF, max 512KB)</label>
                <input ref={emoteFileRef} type="file" accept="image/png,image/gif,image/webp" style={{ fontSize: 12, color: "var(--muted)", width: "100%" }} />
              </div>
              <button onClick={uploadEmote} disabled={uploadingEmote} style={{ background: "linear-gradient(135deg,var(--purple),var(--red))", border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: uploadingEmote ? "not-allowed" : "pointer", opacity: uploadingEmote ? 0.7 : 1, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                {uploadingEmote ? <div className="spinner" /> : "Upload"}
              </button>
            </div>
          </div>
          {/* Existing emotes grid */}
          {myEmotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😄</div>
              <div style={{ fontSize: 13 }}>No emotes yet — upload your first one above.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {myEmotes.map(e => (
                <div key={e.id} style={{ background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80, position: "relative" }}>
                  <img src={e.image_url} alt={e.name} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }} />
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>:{e.name}:</div>
                  <button onClick={() => deleteEmote(e)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(255,45,85,.15)", border: "none", color: "var(--red)", borderRadius: 4, width: 18, height: 18, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-mod Word Filter */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-hd">
          <span className="panel-title">🛡 Auto-mod Word Filter</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{bannedWords.length} words</span>
        </div>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="fi" style={{ margin: 0, flex: 1, fontSize: 13 }} placeholder="Add banned word…" value={newBannedWord} onChange={e => setNewBannedWord(e.target.value)} onKeyDown={e => e.key === "Enter" && addBannedWord()} />
            <button onClick={addBannedWord} style={{ background: "var(--red)", border: "none", color: "#fff", borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Add</button>
          </div>
          {bannedWords.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>No banned words. Messages containing added words will be auto-blocked.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {bannedWords.map(w => (
                <span key={w} className="word-chip">
                  {w}
                  <button onClick={() => removeBannedWord(w)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Bans */}
      {chatBans.size > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-hd">
            <span className="panel-title">🚫 Banned Users</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{chatBans.size} banned</span>
          </div>
          <div style={{ padding: 16 }}>
            {[...chatBans].map(uid => (
              <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,45,85,.15)", border: "1px solid rgba(255,45,85,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🚫</div>
                <div style={{ flex: 1, fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{uid.slice(0, 16)}…</div>
                <button onClick={() => unbanUser(uid)} style={{ background: "rgba(0,245,160,.1)", border: "1px solid rgba(0,245,160,.25)", color: "var(--green)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Unban</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
