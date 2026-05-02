"use client";

const ACTION_LABELS = {
  'goal.created':         'Created goal',
  'goal.updated':         'Updated goal status',
  'goal.deleted':         'Deleted goal',
  'milestone.created':    'Created milestone',
  'milestone.updated':    'Updated milestone',
  'milestone.deleted':    'Deleted milestone',
  'actionItem.created':   'Created action item',
  'actionItem.updated':   'Updated action item',
  'actionItem.deleted':   'Deleted action item',
  'announcement.created': 'Published announcement',
  'announcement.updated': 'Updated announcement',
  'announcement.pinned':  'Pinned announcement',
  'member.invited':       'Invited member',
  'member.roleChanged':   'Changed member role',
  'member.removed':       'Removed member',
};

const ENTITY_ICONS = {
  Goal:         '🎯',
  Milestone:    '○',
  ActionItem:   '⬛',
  Announcement: '📢',
  Member:       '👤',
};

// Entity type pill colours matching screenshot
const ENTITY_COLORS = {
  Goal:         { bg: 'rgba(124,92,252,0.15)', color: '#7c5cfc' },
  Milestone:    { bg: 'rgba(124,92,252,0.15)', color: '#7c5cfc' },
  ActionItem:   { bg: 'rgba(124,92,252,0.15)', color: '#7c5cfc' },
  Announcement: { bg: 'rgba(124,92,252,0.15)', color: '#7c5cfc' },
  Member:       { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Build a short readable snippet from the diff
function buildSnippet(entry) {
  if (!entry.diff || Object.keys(entry.diff).length === 0) return null;
  const parts = [];
  for (const [key, val] of Object.entries(entry.diff)) {
    if (key === 'status' && val?.from && val?.to) {
      parts.push(`"${val.from}" → ${val.to}`);
    } else if (key === 'progress' && val?.from !== undefined) {
      parts.push(`progress → ${val.to}%`);
    } else if (key === 'title') {
      const t = typeof val === 'string' ? val : val?.to;
      if (t) parts.push(`"${t}"`);
    } else if (typeof val === 'string') {
      parts.push(`"${val.slice(0, 40)}"`);
    }
    if (parts.length >= 1) break;
  }
  return parts.join(', ') || null;
}

export function AuditLogEntry({ entry, onClick, selected }) {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const icon  = ENTITY_ICONS[entry.entityType] ?? '📝';
  const ec    = ENTITY_COLORS[entry.entityType] ?? { bg: 'rgba(136,136,160,0.15)', color: '#8888a0' };
  const snippet = buildSnippet(entry);
  const actorInitial = (entry.actor?.name ?? '?')[0].toUpperCase();

  return (
    <div
      onClick={() => onClick?.(entry)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '11px 18px',
        borderBottom: '1px solid var(--border)',
        background: selected ? 'color-mix(in srgb, var(--accent, #7c5cfc) 8%, transparent)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      className="hover:bg-[color:var(--border)]/20"
    >
      {/* Actor avatar */}
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {entry.actor?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.actor.avatarUrl}
            alt={entry.actor.name}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent, #7c5cfc)',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {actorInitial}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Primary line */}
        <p style={{ fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>
            {entry.actor?.name ?? entry.actorId}
          </span>
          <span style={{ color: 'var(--muted)' }}> · {label} </span>
          <span style={{ fontSize: 14 }}>{icon}</span>
        </p>

        {/* Secondary line: entity badge + time + snippet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '1px 7px', borderRadius: 999,
            background: ec.bg, color: ec.color,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
          }}>
            {entry.entityType}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(entry.createdAt)}</span>
          {snippet && (
            <span style={{
              fontSize: 11, color: 'var(--muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 320,
            }}>
              · {snippet}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
