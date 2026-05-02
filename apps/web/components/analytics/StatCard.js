"use client";

export function StatCard({ icon, label, value, sub, accent }) {
  const color = accent ? "var(--accent, #7c5cfc)" : "var(--text)";
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 20 }}>{icon}</span>
        {sub && (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</span>
        )}
      </div>
      <div>
        <p
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color,
          }}
        >
          {value ?? "—"}
        </p>
        <p style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{label}</p>
      </div>
    </div>
  );
}
