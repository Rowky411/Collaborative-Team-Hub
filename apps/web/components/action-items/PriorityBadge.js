const CONFIG = {
  LOW:    { label: "Low",    color: "#22c55e" },
  MEDIUM: { label: "Medium", color: "#f97316" },
  HIGH:   { label: "High",   color: "#f97316" },
  URGENT: { label: "Urgent", color: "#ef4444" },
};

export function PriorityBadge({ priority }) {
  const cfg = CONFIG[priority] ?? CONFIG.MEDIUM;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 999,
        background: cfg.color + "1a",
        color: cfg.color,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
      }}
    >
      {cfg.label}
    </span>
  );
}
