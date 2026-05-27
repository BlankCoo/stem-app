import { useApp } from "../AppContext";

export default function ChatMessages() {
  const {
    chat, chatBans, user, isStreamOwner,
    viewVProfile, parseMessage, msgMenuId, setMsgMenuId,
    timeoutUser, banUser,
  } = useApp();

  return (
    <>
      {chat.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
          {user ? "Be first to chat! +10 coins per message" : "Sign in to chat and earn coins"}
        </div>
      )}
      {chat.filter(m => !chatBans.has(m.uid)).map((m, i) => (
        <div key={i} className={`cmsg ${m.sc ? "sc" : ""} mod-msg-wrap`} style={{ display: "block" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <div style={{ flex: 1 }}>
              {m.sc && (m.t?.startsWith("gifted") && m.t?.includes("sub")
                ? <div style={{ fontSize: 10, color: "#a855f7", fontWeight: 700, marginBottom: 3 }}>🎁 GIFT SUBS · {m.amt}</div>
                : <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, marginBottom: 3 }}>🪙 {m.amt}</div>
              )}
              {m.badge && <span style={{ fontSize: 12, marginRight: 3 }}>{m.badge}</span>}
              <span className="cmsg-a" style={{ color: m.c, cursor: m.uid ? "pointer" : "default" }}
                onClick={() => m.uid && viewVProfile(m.uid)}>{m.a}</span>
              <span className="cmsg-t" style={{ marginLeft: 6 }}>{parseMessage(m.t)}</span>
            </div>
            {isStreamOwner && m.uid && m.uid !== user.id && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setMsgMenuId(msgMenuId === i ? null : i)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "2px 4px" }}>⋮</button>
                {msgMenuId === i && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMsgMenuId(null)} />
                    <div className="mod-menu">
                      <button className="mod-menu-btn" style={{ color: "var(--orange)" }} onClick={() => timeoutUser(m.uid, m.a, 5)}>Timeout 5 min</button>
                      <button className="mod-menu-btn" style={{ color: "var(--orange)", borderTop: "1px solid var(--line)" }} onClick={() => timeoutUser(m.uid, m.a, 60)}>Timeout 1 hr</button>
                      <button className="mod-menu-btn" style={{ color: "var(--red)", borderTop: "1px solid var(--line)" }} onClick={() => banUser(m.uid, m.a)}>Ban User</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
