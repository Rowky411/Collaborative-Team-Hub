"use client";

const ENTITY_TYPES = ['Goal', 'Milestone', 'ActionItem', 'Announcement', 'Member'];

const selectCls =
  "rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40 transition";

export function AuditLogFilters({ filters, members, onChange, onReset }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value || '' });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Entity type */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[color:var(--muted)]">Entity type</label>
        <select className={selectCls} value={filters.entityType} onChange={(e) => set('entityType', e.target.value)}>
          <option value="">All types</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Actor */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[color:var(--muted)]">Actor</label>
        <select className={selectCls} value={filters.actorId} onChange={(e) => set('actorId', e.target.value)}>
          <option value="">Anyone</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* From */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[color:var(--muted)]">From</label>
        <input
          type="date"
          className={selectCls}
          value={filters.from}
          onChange={(e) => set('from', e.target.value)}
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[color:var(--muted)]">To</label>
        <input
          type="date"
          className={selectCls}
          value={filters.to}
          onChange={(e) => set('to', e.target.value)}
        />
      </div>

      <button
        onClick={onReset}
        className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
      >
        Reset
      </button>
    </div>
  );
}
