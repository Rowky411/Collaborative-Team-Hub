"use client";

import { AuditLogEntry } from "./AuditLogEntry";

export function AuditLogTimeline({ items, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 18px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, width: "55%", borderRadius: 6, background: "var(--border)", marginBottom: 6 }} />
              <div style={{ height: 10, width: "35%", borderRadius: 6, background: "var(--border)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p style={{ padding: "48px 18px", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        No audit log entries match the current filters.
      </p>
    );
  }

  return (
    <div>
      {items.map((entry) => (
        <AuditLogEntry
          key={entry.id}
          entry={entry}
          selected={selectedId === entry.id}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
