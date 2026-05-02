"use client";

const CONFIG = {
  NOT_STARTED: { label: "On Track",    color: "#22c55e" },
  IN_PROGRESS: { label: "In Progress", color: "#7c5cfc" },
  COMPLETED:   { label: "Completed",   color: "#22c55e" },
  OVERDUE:     { label: "At Risk",     color: "#f97316" },
};

export function StatusBadge({ status, onClick, className = "" }) {
  const cfg = CONFIG[status] || CONFIG.NOT_STARTED;
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        background: cfg.color + "1a",
        color: cfg.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
        cursor: onClick ? "pointer" : "default",
        border: "none",
      }}
      aria-label={onClick ? `Change status, current: ${cfg.label}` : cfg.label}
    >
      {cfg.label}
    </Tag>
  );
}

export const STATUS_OPTIONS = Object.entries(CONFIG).map(([value, { label }]) => ({ value, label }));
