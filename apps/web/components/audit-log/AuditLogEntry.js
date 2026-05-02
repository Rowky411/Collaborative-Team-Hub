"use client";

const ACTION_LABELS = {
  'goal.created':        'Created goal',
  'goal.updated':        'Updated goal',
  'goal.deleted':        'Deleted goal',
  'milestone.created':   'Created milestone',
  'milestone.updated':   'Updated milestone',
  'milestone.deleted':   'Deleted milestone',
  'actionItem.created':  'Created action item',
  'actionItem.updated':  'Updated action item',
  'actionItem.deleted':  'Deleted action item',
  'announcement.created':'Published announcement',
  'announcement.updated':'Updated announcement',
  'announcement.pinned': 'Pinned announcement',
  'member.invited':      'Invited member',
  'member.roleChanged':  'Changed member role',
  'member.removed':      'Removed member',
};

const ENTITY_ICONS = {
  Goal:         '🎯',
  Milestone:    '🏁',
  ActionItem:   '📋',
  Announcement: '📢',
  Member:       '👤',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AuditLogEntry({ entry, onClick, selected }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const icon = ENTITY_ICONS[entry.entityType] ?? '📝';
  const hasDiff = entry.diff && Object.keys(entry.diff).length > 0;

  return (
    <div
      onClick={() => onClick?.(entry)}
      className={`flex items-start gap-3 border-b border-[color:var(--border)] px-4 py-3 cursor-pointer transition-colors
        ${selected ? 'bg-[color:var(--accent)]/10' : 'hover:bg-[color:var(--border)]/20'}`}
    >
      {/* Actor avatar */}
      <div className="mt-0.5 shrink-0">
        {entry.actor?.avatarUrl ? (
          <img src={entry.actor.avatarUrl} alt={entry.actor.name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">
            {(entry.actor?.name ?? '?')[0].toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="font-medium">{entry.actor?.name ?? entry.actorId}</span>
          {' · '}
          <span className="text-[color:var(--muted)]">{label}</span>
          {' '}
          <span>{icon}</span>
        </p>
        <p className="text-xs text-[color:var(--muted)]">
          {entry.entityType} · {timeAgo(entry.createdAt)}
        </p>
      </div>

      {/* Diff badge */}
      {hasDiff && (
        <span className="shrink-0 rounded-full bg-[color:var(--border)]/60 px-2 py-0.5 text-[10px] text-[color:var(--muted)]">
          diff
        </span>
      )}
    </div>
  );
}
