"use client";

import { FixedSizeList } from "react-window";
import { AuditLogEntry } from "./AuditLogEntry";

const ROW_HEIGHT = 68;
const LIST_HEIGHT = 560;

function Row({ index, style, data }) {
  const { items, selectedId, onSelect } = data;
  const entry = items[index];
  return (
    <div style={style}>
      <AuditLogEntry
        entry={entry}
        selected={selectedId === entry.id}
        onClick={onSelect}
      />
    </div>
  );
}

export function AuditLogTimeline({ items, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mx-4 h-12 animate-pulse rounded-xl bg-[color:var(--border)]/30" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="py-16 text-center text-sm text-[color:var(--muted)]">
        No audit log entries match the current filters.
      </p>
    );
  }

  const height = Math.min(items.length * ROW_HEIGHT, LIST_HEIGHT);

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={ROW_HEIGHT}
      width="100%"
      itemData={{ items, selectedId, onSelect }}
    >
      {Row}
    </FixedSizeList>
  );
}
