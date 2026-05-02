// flux-nav.jsx — Top nav, workspace cover header, tab bar

function TopNav({ t, screen, setScreen, theme, setTheme, wsName, wsColor, onlineCount = 2, members = [] }) {
  const [cmdOpen, setCmdOpen] = React.useState(false);

  return (
    <div style={{
      height: 48, background: t.surface, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      flexShrink: 0, position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div
        onClick={() => setScreen('picker')}
        style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: PURPLE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#fff', fontWeight: 800, letterSpacing: '-0.02em',
        }}>T</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Team Hub</span>
      </div>

      {wsName && (
        <>
          <div style={{ width: 1, height: 18, background: t.border }} />
          <span style={{ fontSize: 13, color: t.muted }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{wsName}</span>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* ⌘K command bar */}
      <div
        onClick={() => setCmdOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          borderRadius: 9, background: t.inputBg, border: `1px solid ${t.border}`,
          color: t.muted, fontSize: 12, cursor: 'text', width: 180,
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ fontSize: 13, opacity: 0.6 }}>⌕</span>
        <span style={{ flex: 1 }}>Search…</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <kbd style={{ padding: '1px 5px', borderRadius: 4, background: t.subtle, fontSize: 10, fontFamily: 'DM Mono', color: t.muted, border: `1px solid ${t.border}` }}>⌘K</kbd>
        </div>
      </div>

      {/* online pill */}
      {wsName && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: GREEN + '14', border: `1px solid ${GREEN}28`,
          fontSize: 11, color: GREEN, fontWeight: 600,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN }} />
          {onlineCount} online
        </div>
      )}

      {/* theme toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{
          width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`,
          background: t.inputBg, cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted,
        }}
      >{theme === 'dark' ? '☀' : '◑'}</button>

      {/* avatar */}
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <Avatar name="Demo User" size={30} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: GREEN, border: `2px solid ${t.surface}` }} />
      </div>

      {/* cmd palette overlay */}
      {cmdOpen && (
        <div
          onClick={() => setCmdOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 560, background: t.surface, borderRadius: 16,
              border: `1px solid ${t.borderStrong}`,
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 16, color: t.muted }}>⌕</span>
              <input autoFocus placeholder="Search goals, announcements, members…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: t.text, fontFamily: 'DM Sans, sans-serif' }} />
              <kbd style={{ padding: '2px 6px', borderRadius: 5, background: t.subtle, fontSize: 11, fontFamily: 'DM Mono', color: t.muted }}>esc</kbd>
            </div>
            {[
              { icon: '◎', label: 'Q2 Product Launch', sub: 'Goal · In Progress' },
              { icon: '◈', label: 'Team standup moved to 10am', sub: 'Announcement · 2h ago' },
              { icon: '◻', label: 'Fix login bug', sub: 'Action Item · High priority' },
              { icon: '◉', label: 'Alice', sub: 'Member · Marketing' },
            ].map((item, i) => (
              <div key={i} onClick={() => setCmdOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', borderBottom: `1px solid ${t.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PURPLE_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: PURPLE }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{item.sub}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '8px 18px', display: 'flex', gap: 14 }}>
              {['↑↓ navigate','↵ open','esc close'].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: t.muted, fontFamily: 'DM Mono' }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkspaceCover({ t, wsName, wsColor, wsDesc, wsRole, tabs, activeTab, setActiveTab, members }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${wsColor}22 0%, ${wsColor}08 60%, transparent 100%)`,
      borderBottom: `1px solid ${wsColor}28`,
      flexShrink: 0,
    }}>
      {/* header row */}
      <div style={{ padding: '18px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, background: wsColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff',
            boxShadow: `0 4px 18px ${wsColor}50`,
          }}>{wsName[0]}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: '-0.025em' }}>{wsName}</div>
              <StatusBadge status={wsRole} />
            </div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{wsDesc}</div>
          </div>
        </div>

        {/* member stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {members.slice(0, 4).map((m, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: 4 - i }}>
                <Avatar name={m.name} size={28} color={m.color} style={{ border: `2px solid ${t.bg}` }} />
                {m.online && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: GREEN, border: `1.5px solid ${t.bg}` }} />
                )}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: t.muted }}>{members.length} members</span>
        </div>
      </div>

      {/* tab bar */}
      <div style={{ display: 'flex', gap: 0, padding: '12px 20px 0', marginTop: 4 }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 14px', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? wsColor : t.muted,
              borderBottom: activeTab === tab.id ? `2px solid ${wsColor}` : '2px solid transparent',
              background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${wsColor}` : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TopNav, WorkspaceCover });
