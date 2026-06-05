import { useEffect, useRef, useState, useCallback } from "react";
import { DailyProvider, useDaily, useLocalParticipant, useParticipantIds, useParticipant, DailyAudio, useActiveSpeakerId } from "@daily-co/daily-react";
import DailyIframe from "@daily-co/daily-js";
import { useApp } from "../AppContext";
import { supabase } from "../supabase";

// ── Participant tile ───────────────────────────────────────────────────────
function ParticipantTile({ id, isHost, canRemove, onRemove }) {
  const p = useParticipant(id);
  const activeSpeakerId = useActiveSpeakerId();
  const isSpeaking = activeSpeakerId === id;
  const isMuted = !p?.tracks?.audio?.persistentTrack || p?.tracks?.audio?.state === "off";
  const name = p?.user_name || "Listener";
  const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", minWidth: 72 }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: isSpeaking ? "linear-gradient(135deg,var(--purple),var(--red))" : "var(--ink3)",
        border: isSpeaking ? "2px solid var(--purple)" : "2px solid var(--line2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 700, color: "#fff",
        transition: "all .2s",
        boxShadow: isSpeaking ? "0 0 16px rgba(124,58,237,.5)" : "none",
      }}>
        {initials}
      </div>
      {isMuted && (
        <div style={{ position: "absolute", bottom: 22, right: 4, background: "rgba(0,0,0,.8)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🔇</div>
      )}
      {isSpeaking && (
        <div style={{ position: "absolute", bottom: 22, right: 4, background: "var(--purple)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🎙</div>
      )}
      <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, textAlign: "center", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {isHost ? `${name} 👑` : name}
      </div>
      {canRemove && (
        <button onClick={() => onRemove(id)} style={{ fontSize: 9, color: "var(--red)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
      )}
    </div>
  );
}

// ── Inner room (needs DailyProvider context) ──────────────────────────────
function SpaceRoom({ space, isHost, profile, onLeave, onEnd }) {
  const call = useDaily();
  const local = useLocalParticipant();
  const allIds = useParticipantIds();
  const activeSpeakerId = useActiveSpeakerId();

  const { sendGift, showTipInput, setShowTipInput, customTipAmt, setCustomTipAmt, sendCustomTip, notify, coinMultiplier } = useApp();

  const [role, setRole] = useState(isHost ? "host" : "listener");
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState({}); // { participantId: { name, userId } }
  const [speakers, setSpeakers] = useState(new Set());
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const [listenerCount, setListenerCount] = useState(0);
  const [recordingId, setRecordingId] = useState(null);
  const chatRef = useRef(null);

  // ── Chat subscription ───────────────────────────────────────────────────
  useEffect(() => {
    // Load recent messages
    supabase.from("messages").select("*").eq("stream_id", space.id)
      .order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => setChat(data?.map(m => ({ id: m.id, a: m.username, t: m.content, c: m.color || "#ff2d55", uid: m.user_id })) || []));

    const ch = supabase.channel(`space-chat:${space.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `stream_id=eq.${space.id}` }, (payload) => {
        const m = payload.new;
        setChat(prev => [...prev.slice(-199), { id: m.id, a: m.username, t: m.content, c: m.color || "#ff2d55", uid: m.user_id }]);
      }).subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [space.id]);

  // Scroll chat to bottom
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chat]);

  // ── Daily event listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!call) return;

    // Track participant count for listener count
    const updateCounts = () => {
      const count = call.participantCounts?.();
      if (count) setListenerCount(count.present || 0);
    };

    // App messages for raise hand / speaker approval
    const onAppMsg = (e) => {
      const data = e.data;
      if (data.type === "raise_hand") {
        setRaisedHands(prev => ({ ...prev, [e.fromId]: { name: data.name, userId: data.userId } }));
        if (isHost) notify(`✋ ${data.name} wants to speak`);
      }
      if (data.type === "lower_hand") {
        setRaisedHands(prev => { const n = { ...prev }; delete n[e.fromId]; return n; });
      }
      if (data.type === "approved_speaker") {
        if (data.userId === profile?.id) {
          setRole("speaker");
          setSpeakers(prev => new Set([...prev, local?.session_id]));
          notify("🎙 You're now a speaker! Your mic is live.");
        }
      }
    };

    // Recording started
    const onRecordingStarted = (e) => { setRecordingId(e.recordingId); };

    // Participant updates (detect speakers from permission changes)
    const onParticipantUpdated = (e) => {
      const p = e.participant;
      if (p?.permissions?.canSend?.includes("audio")) {
        setSpeakers(prev => new Set([...prev, p.session_id]));
      }
      updateCounts();
    };

    call.on("app-message", onAppMsg);
    call.on("recording-started", onRecordingStarted);
    call.on("participant-updated", onParticipantUpdated);
    call.on("participant-joined", updateCounts);
    call.on("participant-left", updateCounts);

    // Host auto-starts recording
    if (isHost) {
      call.startRecording({ layout: { preset: "audio-only" } }).catch(() => {});
    }

    return () => {
      call.off("app-message", onAppMsg);
      call.off("recording-started", onRecordingStarted);
      call.off("participant-updated", onParticipantUpdated);
      call.off("participant-joined", updateCounts);
      call.off("participant-left", updateCounts);
    };
  }, [call, isHost, profile?.id]);

  // ── Controls ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!call) return;
    call.setLocalAudio(!local?.audio);
  }, [call, local?.audio]);

  const raiseHand = useCallback(() => {
    if (!call || !profile) return;
    const raised = !handRaised;
    setHandRaised(raised);
    call.sendAppMessage({ type: raised ? "raise_hand" : "lower_hand", name: profile.full_name || profile.username, userId: profile.id }, "*");
  }, [call, handRaised, profile]);

  const approveSpeaker = useCallback((sessionId) => {
    if (!call) return;
    call.updateParticipant(sessionId, { updatePermissions: { canSend: ["audio"], hasPresence: true } });
    const hands = { ...raisedHands };
    const entry = hands[sessionId];
    delete hands[sessionId];
    setRaisedHands(hands);
    call.sendAppMessage({ type: "approved_speaker", userId: entry?.userId }, "*");
    setSpeakers(prev => new Set([...prev, sessionId]));
  }, [call, raisedHands]);

  const removeSpeaker = useCallback((sessionId) => {
    if (!call) return;
    call.updateParticipant(sessionId, { updatePermissions: { canSend: [], hasPresence: true } });
    setSpeakers(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
  }, [call]);

  const sendChat = async () => {
    if (!msg.trim() || !profile) return;
    const content = msg.trim();
    setMsg("");
    await supabase.from("messages").insert({
      stream_id: space.id, user_id: profile.id,
      username: profile.full_name?.split(" ")[0] || profile.username || "User",
      content, color: profile.chat_color || "#ff2d55",
      is_superchat: false, coins_spent: 0,
    });
  };

  const isMuted = !local?.audio;
  const speakerIds = allIds.filter(id => speakers.has(id) || id === local?.session_id);
  const listenerIds = allIds.filter(id => !speakers.has(id) && id !== local?.session_id);
  const raiseHandCount = Object.keys(raisedHands).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingTop: 56, background: "var(--bg)" }}>
      <DailyAudio />

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.4)", color: "var(--purple)", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "2px 8px", letterSpacing: .5 }}>🎙 SPACE</span>
            {coinMultiplier > 1 && <span style={{ background: "rgba(255,200,0,.12)", border: "1px solid rgba(255,200,0,.3)", color: "var(--gold)", borderRadius: 20, fontSize: 9, fontWeight: 800, padding: "2px 8px" }}>🎉 {coinMultiplier}x COINS</span>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{space.title}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>👥 {listenerCount} listening</div>
        </div>
        <button onClick={isHost ? onEnd : onLeave}
          style={{ background: isHost ? "rgba(255,45,85,.15)" : "var(--ink3)", border: isHost ? "1px solid rgba(255,45,85,.4)" : "1px solid var(--line2)", color: isHost ? "var(--red)" : "var(--muted)", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          {isHost ? "End Space" : "Leave"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Raised hands (host sees) */}
        {isHost && raiseHandCount > 0 && (
          <div style={{ padding: "10px 16px", background: "rgba(124,58,237,.08)", borderBottom: "1px solid rgba(124,58,237,.2)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--purple)", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>✋ Wants to speak ({raiseHandCount})</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(raisedHands).map(([sessionId, data]) => (
                <div key={sessionId} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.25)", borderRadius: 20, padding: "5px 10px 5px 8px" }}>
                  <span style={{ fontSize: 12 }}>👤</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{data.name}</span>
                  <button onClick={() => approveSpeaker(sessionId)}
                    style={{ background: "var(--purple)", border: "none", color: "#fff", borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Add to stage</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speakers on stage */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>On Stage</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {/* Local participant (always shown) */}
            {local && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 72 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: activeSpeakerId === local.session_id ? "linear-gradient(135deg,var(--purple),var(--red))" : "var(--ink3)",
                  border: activeSpeakerId === local.session_id ? "2px solid var(--purple)" : "2px solid var(--line2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff",
                  boxShadow: activeSpeakerId === local.session_id ? "0 0 16px rgba(124,58,237,.5)" : "none",
                }}>
                  {(profile?.full_name || "Me").slice(0, 2).toUpperCase()}
                </div>
                {isMuted && <div style={{ position: "absolute", fontSize: 10 }}>🔇</div>}
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>
                  {isHost ? `${profile?.full_name?.split(" ")[0] || "You"} 👑` : `${profile?.full_name?.split(" ")[0] || "You"}${role === "speaker" ? " 🎙" : ""}`}
                </div>
              </div>
            )}
            {/* Other speakers */}
            {speakerIds.map(id => (
              <ParticipantTile key={id} id={id} isHost={false}
                canRemove={isHost}
                onRemove={removeSpeaker} />
            ))}
          </div>
        </div>

        {/* Listeners */}
        {listenerIds.length > 0 && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Listeners ({listenerIds.length})</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {listenerIds.slice(0, 30).map(id => {
                const p = { session_id: id };
                return (
                  <div key={id} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ink3)", border: "1px solid var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
                );
              })}
              {listenerIds.length > 30 && <div style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>+{listenerIds.length - 30} more</div>}
            </div>
          </div>
        )}

        {/* Gifts strip */}
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Send a gift</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["🌟", "Star", "1,000"], ["🏆", "Trophy", "5,000"], ["👑", "Crown", "10,000"]].map(([e, n, c]) => (
              <div key={n} className="gift" onClick={() => sendGift(n, c, e)} style={{ cursor: "pointer" }}>
                <span className="gift-e">{e}</span>
                <div className="gift-c">🪙 {c}</div>
                <div className="gift-n">{n}</div>
              </div>
            ))}
            <div className="gift" onClick={() => setShowTipInput(v => !v)}>
              <span className="gift-e">💸</span><div className="gift-c">Custom</div><div className="gift-n">Tip</div>
            </div>
          </div>
          {showTipInput && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
              <input type="number" min={100} step={100} value={customTipAmt} onChange={e => setCustomTipAmt(e.target.value)}
                placeholder="e.g. 1500" style={{ flex: 1, background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 8, color: "#fff", padding: "7px 10px", fontSize: 13, outline: "none" }}
                onKeyDown={e => e.key === "Enter" && sendCustomTip()} />
              <button className="btn-g" style={{ padding: "7px 14px", fontSize: 12 }} onClick={sendCustomTip}>Tip 🪙</button>
            </div>
          )}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderTop: "1px solid var(--line)", minHeight: 200 }}>
          <div style={{ padding: "10px 16px 6px", fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: .5, textTransform: "uppercase" }}>Chat</div>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "0 16px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
            {chat.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>Be first to chat!</div>}
            {chat.map((m, i) => (
              <div key={m.id || i} style={{ fontSize: 13, lineHeight: 1.4 }}>
                <span style={{ color: m.c, fontWeight: 700 }}>{m.a}</span>
                <span style={{ color: "rgba(255,255,255,.85)", marginLeft: 6 }}>{m.t}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 16px 12px", display: "flex", gap: 8 }}>
            <input className="chat-in" value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Say something..." style={{ flex: 1 }} />
            <button className="chat-send" onClick={sendChat}>↑</button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--line)", background: "var(--ink2)", display: "flex", gap: 10, justifyContent: "center" }}>
        {(role === "host" || role === "speaker") && (
          <button onClick={toggleMic} style={{
            background: isMuted ? "rgba(255,45,85,.15)" : "rgba(0,245,160,.12)",
            border: isMuted ? "1px solid rgba(255,45,85,.3)" : "1px solid rgba(0,245,160,.3)",
            color: isMuted ? "var(--red)" : "var(--green)",
            borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            {isMuted ? "🔇 Unmute" : "🎙 Mute"}
          </button>
        )}
        {role === "listener" && (
          <button onClick={raiseHand} style={{
            background: handRaised ? "rgba(124,58,237,.2)" : "var(--ink3)",
            border: handRaised ? "1px solid rgba(124,58,237,.4)" : "1px solid var(--line2)",
            color: handRaised ? "var(--purple)" : "var(--muted)",
            borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            {handRaised ? "✋ Hand Raised" : "✋ Raise Hand"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Outer wrapper — creates Daily call object ─────────────────────────────
export default function SpacePage() {
  const { currentSpace, spaceToken, spaceRole, profile, leaveSpace, endSpace, notify } = useApp();
  const [callObject, setCallObject] = useState(null);
  const [joined, setJoined] = useState(false);

  const isHost = spaceRole === "host";

  useEffect(() => {
    if (!currentSpace || !spaceToken) return;

    const co = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: false,
      dailyConfig: { experimentalChromeVideoMuteLightOff: true },
    });

    co.join({ url: currentSpace.room_url, token: spaceToken })
      .then(() => setJoined(true))
      .catch(err => { notify("Could not join Space — check mic permissions"); console.error(err); });

    setCallObject(co);
    return () => { co.leave().then(() => co.destroy()); };
  }, [currentSpace?.id]);

  const handleLeave = async () => {
    if (callObject) await callObject.leave();
    leaveSpace();
  };

  const handleEnd = async () => {
    if (callObject) {
      // Grab recording ID before leaving
      const state = callObject.meetingState();
      await callObject.stopRecording().catch(() => {});
      await callObject.leave();
    }
    endSpace();
  };

  if (!currentSpace || !callObject) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <div style={{ fontSize: 14, color: "var(--muted)" }}>Joining Space…</div>
    </div>
  );

  return (
    <DailyProvider callObject={callObject}>
      {joined && (
        <SpaceRoom
          space={currentSpace}
          isHost={isHost}
          profile={profile}
          onLeave={handleLeave}
          onEnd={handleEnd}
        />
      )}
      {!joined && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Connecting…</div>
        </div>
      )}
    </DailyProvider>
  );
}
