"use client";

const PALETTE = ["#7c5cfc", "#22c55e", "#f97316", "#06b6d4", "#ec4899", "#84cc16"];

const STATUS_COLORS = {
  "In Progress": "#7c5cfc",
  "On Track": "#22c55e",
  "At Risk": "#f97316",
  "Completed": "#22c55e",
  "Not Started": "#8888a0",
  "Overdue": "#ef4444",
  "Todo": "#8888a0",
  "Done": "#22c55e",
  "High": "#ef4444",
  "Medium": "#f97316",
  "Low": "#22c55e",
  Admin: "#7c5cfc",
  ADMIN: "#7c5cfc",
  Member: "#8888a0",
  MEMBER: "#8888a0",
};

export function pickColor(name = "?") {
  const code = name.charCodeAt(0) || 0;
  return PALETTE[code % PALETTE.length];
}

export function Avatar({ name = "?", size = 30, color, style = {}, className = "" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = color || pickColor(name);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.37,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

export function Badge({ label, color = "#7c5cfc", size = "sm" }) {
  const pad = size === "xs" ? "1px 6px" : "3px 9px";
  const fs = size === "xs" ? 10 : 11;
  return (
    <span
      className="font-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: pad,
        borderRadius: 999,
        background: color + "1a",
        color,
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (!status) return null;
  return <Badge label={status} color={STATUS_COLORS[status] || "#8888a0"} />;
}

export function ProgressRing({ pct = 0, size = 48, stroke = 4, color = "#7c5cfc", trackOpacity = 0.1 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} opacity={trackOpacity} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProgressBar({ pct = 0, height = 4, color = "#7c5cfc", animated = false }) {
  return (
    <div
      style={{
        background: "color-mix(in srgb, var(--muted) 18%, transparent)",
        borderRadius: 999,
        height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: animated ? "width 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      />
    </div>
  );
}

export function OnlineDot({ online, size = 8, ring = "var(--card)" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: online ? "#22c55e" : "rgba(150,150,180,0.5)",
        border: `2px solid ${ring}`,
        flexShrink: 0,
      }}
    />
  );
}
