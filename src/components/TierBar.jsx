export default function TierBar({ label, current, target, color = "var(--purple)" }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontSize: 11, color: current >= target ? "var(--green)" : "rgba(255,255,255,.5)" }}>{typeof current === "number" ? current.toLocaleString() : current} / {typeof target === "number" ? target.toLocaleString() : target} {current >= target ? "✓" : ""}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,.07)", borderRadius: 2 }}>
        <div style={{ height: "100%", background: current >= target ? "var(--green)" : color, borderRadius: 2, width: `${Math.min(100, (current / target) * 100).toFixed(0)}%`, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}
