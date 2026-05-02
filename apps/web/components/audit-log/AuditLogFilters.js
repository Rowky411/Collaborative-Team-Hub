"use client";

const ENTITY_TYPES = ["Goal", "Milestone", "ActionItem", "Announcement", "Member"];

const selectStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontSize: 12,
  outline: "none",
  cursor: "pointer",
  minWidth: 110,
};

const labelStyle = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 5,
  display: "block",
};

export function AuditLogFilters({ filters, members, onChange, onReset }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value || "" });
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
      {/* Entity type */}
      <div>
        <label style={labelStyle}>Entity Type</label>
        <select
          style={selectStyle}
          value={filters.entityType}
          onChange={(e) => set("entityType", e.target.value)}
        >
          <option value="">All types</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Actor */}
      <div>
        <label style={labelStyle}>Actor</label>
        <select
          style={selectStyle}
          value={filters.actorId}
          onChange={(e) => set("actorId", e.target.value)}
        >
          <option value="">Anyone</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* From date */}
      <div>
        <label style={labelStyle}>From</label>
        <input
          type="date"
          style={{ ...selectStyle, minWidth: 130, colorScheme: "dark" }}
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>

      {/* To date */}
      <div>
        <label style={labelStyle}>To</label>
        <input
          type="date"
          style={{ ...selectStyle, minWidth: 130, colorScheme: "dark" }}
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "var(--muted)",
          fontSize: 12,
          cursor: "pointer",
          transition: "background 0.12s",
        }}
        className="hover:bg-[color:var(--border)]"
      >
        Reset
      </button>
    </div>
  );
}
