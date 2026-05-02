// flux-tokens.js — shared design tokens + micro-components for Team Collab Hub (Flux direction)

const PURPLE = '#7c5cfc';
const PURPLE_LIGHT = '#a78bfa';
const PURPLE_DIM = 'rgba(124,92,252,0.14)';
const GREEN = '#22c55e';
const ORANGE = '#f97316';
const RED = '#ef4444';

const DARK = {
  bg: '#0d0d14',
  surface: '#13131e',
  card: '#1a1a2a',
  cardHover: '#1f1f32',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  text: '#eeeef5',
  textSub: '#b0b0c8',
  muted: '#6a6a85',
  subtle: '#2e2e44',
  inputBg: '#0f0f1a',
  scrollbar: 'rgba(255,255,255,0.1)',
};

const LIGHT = {
  bg: '#f4f4f8',
  surface: '#ffffff',
  card: '#ffffff',
  cardHover: '#f9f9fc',
  border: 'rgba(0,0,0,0.07)',
  borderStrong: 'rgba(0,0,0,0.13)',
  text: '#111118',
  textSub: '#44445a',
  muted: '#8888a0',
  subtle: '#e0e0ec',
  inputBg: '#f8f8fc',
  scrollbar: 'rgba(0,0,0,0.1)',
};

function useTheme(mode) {
  const t = mode === 'dark' ? DARK : LIGHT;
  return { ...t, isDark: mode === 'dark', purple: PURPLE, purpleLight: PURPLE_LIGHT, purpleDim: PURPLE_DIM, green: GREEN, orange: ORANGE, red: RED };
}

// ── Micro-components ──────────────────────────────────────────────────────────

function Avatar({ name = '?', size = 30, color, style = {} }) {
  const colors = [PURPLE, GREEN, ORANGE, '#06b6d4', '#ec4899', '#84cc16'];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.37, fontWeight: 700, color: '#fff', flexShrink: 0,
      fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em', ...style,
    }}>{initials}</div>
  );
}

function OnlineBadge({ online, card, size = 8 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: online ? GREEN : 'rgba(150,150,180,0.4)',
      border: `2px solid ${card}`, flexShrink: 0,
    }} />
  );
}

function Badge({ label, color = PURPLE, size = 'sm' }) {
  const pad = size === 'xs' ? '1px 6px' : '3px 9px';
  const fs = size === 'xs' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: pad, borderRadius: 999,
      background: color + '1a', color,
      fontSize: fs, fontWeight: 600,
      fontFamily: 'DM Mono, monospace', letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    'In Progress': PURPLE,
    'On Track': GREEN,
    'At Risk': ORANGE,
    'Completed': GREEN,
    'Not Started': '#8888a0',
    'Overdue': RED,
    'Todo': '#8888a0',
    'Done': GREEN,
    'High': RED,
    'Medium': ORANGE,
    'Low': GREEN,
  };
  return <Badge label={status} color={map[status] || '#8888a0'} />;
}

function ProgressRing({ pct = 0, size = 48, stroke = 4, color = PURPLE, trackOpacity = 0.08 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} opacity={trackOpacity} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

function ProgressBar({ pct = 0, height = 4, color = PURPLE, bg = 'rgba(128,128,160,0.12)', animated = false }) {
  return (
    <div style={{ background: bg, borderRadius: 999, height, overflow: 'hidden', width: '100%' }}>
      <div style={{
        width: `${pct}%`, height: '100%', background: color, borderRadius: 999,
        transition: animated ? 'width 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }} />
    </div>
  );
}

function Divider({ t }) {
  return <div style={{ height: 1, background: t.border, flexShrink: 0 }} />;
}

function IconBtn({ icon, label, onClick, t, active = false, accent = false }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
      background: accent ? PURPLE : active ? PURPLE_DIM : 'transparent',
      color: accent ? '#fff' : active ? PURPLE : t.muted,
      fontSize: 15, transition: 'all 0.12s', fontFamily: 'inherit',
    }}>{icon}</button>
  );
}

function Chip({ label, active, color = PURPLE, onClick, t }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 12px', borderRadius: 999,
      background: active ? color + '1a' : 'transparent',
      border: `1px solid ${active ? color + '44' : t.border}`,
      color: active ? color : t.muted,
      fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
      transition: 'all 0.12s', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
    }}>{label}</button>
  );
}

function Card({ children, t, style = {}, onClick, hover = true }) {
  const [isHover, setIsHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        background: isHover && hover ? t.cardHover : t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        transition: 'background 0.15s, box-shadow 0.15s',
        boxShadow: isHover && hover ? (t.isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.07)') : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >{children}</div>
  );
}

function EmptyState({ icon, title, desc, action, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: t.muted, maxWidth: 260 }}>{desc}</div>}
      {action}
    </div>
  );
}

// Export to window
Object.assign(window, {
  PURPLE, PURPLE_LIGHT, PURPLE_DIM, GREEN, ORANGE, RED,
  DARK, LIGHT, useTheme,
  Avatar, OnlineBadge, Badge, StatusBadge,
  ProgressRing, ProgressBar,
  Divider, IconBtn, Chip, Card, EmptyState,
});
