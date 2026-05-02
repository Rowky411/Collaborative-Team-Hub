// flux-screens.jsx — All screens for Team Collab Hub (Flux direction)

// ── SHARED DATA ───────────────────────────────────────────────────────────────
const MEMBERS = [
  { name: 'Demo User', role: 'Admin', color: PURPLE, online: true, email: 'demo@team-hub.dev' },
  { name: 'Alice', role: 'Member', color: GREEN, online: true, email: 'alice@example.com' },
  { name: 'user1', role: 'Member', color: ORANGE, online: false, email: 'user1@gmail.com' },
];

const WORKSPACES = [
  { name: 'Demo Workspace', desc: 'A starter workspace for the demo account', members: 3, role: 'Admin', color: PURPLE, goals: 8, pct: 62, initials: 'DW' },
  { name: 'Marketing', desc: 'Phase 2 campaign planning', members: 1, role: 'Admin', color: GREEN, goals: 3, pct: 38, initials: 'MK' },
  { name: 'Test 2', desc: 'A test workspace', members: 2, role: 'Member', color: ORANGE, goals: 1, pct: 15, initials: 'T2' },
];

const GOALS = [
  { id: 1, name: 'Q2 Product Launch', desc: 'Deliver the full v2.0 release with all planned features', pct: 65, milestones: 3, owner: 'Demo User', due: 'May 13', status: 'In Progress', ownerColor: PURPLE },
  { id: 2, name: 'Marketing Campaign', desc: 'Q2 awareness push across social and email channels', pct: 25, milestones: 2, owner: 'Alice', due: 'May 9', status: 'In Progress', ownerColor: GREEN },
  { id: 3, name: 'Infra Migration', desc: 'Full migration to Railway with zero downtime', pct: 90, milestones: 4, owner: 'Demo User', due: 'May 3', status: 'On Track', ownerColor: PURPLE },
  { id: 4, name: 'Hire 3 Engineers', desc: 'Backend and frontend engineering roles to be filled', pct: 40, milestones: 2, owner: 'Alice', due: 'Jun 1', status: 'At Risk', ownerColor: GREEN },
];

const ACTION_ITEMS = [
  { id: 1, title: 'Fix login redirect bug', assignee: 'Demo User', priority: 'High', due: 'May 3', status: 'Todo', goalId: 1 },
  { id: 2, title: 'Write API documentation', assignee: 'Alice', priority: 'Medium', due: 'May 8', status: 'In Progress', goalId: 1 },
  { id: 3, title: 'Design onboarding flow', assignee: 'Demo User', priority: 'High', due: 'May 10', status: 'In Progress', goalId: 1 },
  { id: 4, title: 'Set up email templates', assignee: 'user1', priority: 'Low', due: 'May 15', status: 'Todo', goalId: 2 },
  { id: 5, title: 'Deploy to Railway prod', assignee: 'Demo User', priority: 'High', due: 'May 3', status: 'Done', goalId: 3 },
  { id: 6, title: 'Write job descriptions', assignee: 'Alice', priority: 'Medium', due: 'May 7', status: 'Done', goalId: 4 },
  { id: 7, title: 'Set up Cloudinary', assignee: 'user1', priority: 'Medium', due: 'May 12', status: 'Todo', goalId: 3 },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Team standup moved to 10am', body: 'Starting next Monday, the daily standup will be at 10:00am UTC. Please update your calendars. This applies to all members across all timezones.', author: 'Demo User', time: '2h ago', reactions: { '👍': 4, '🎉': 2 }, comments: 1, pinned: true },
  { id: 2, title: 'Q2 planning doc is ready for review', body: 'The full Q2 roadmap and planning document has been posted in Notion. Please review by Friday and leave your comments.', author: 'Alice', time: '1d ago', reactions: { '👀': 3, '✅': 1 }, comments: 3, pinned: false },
  { id: 3, title: 'New workspace guidelines', body: 'We\'ve updated the workspace naming conventions and member invite process. Please read the updated guidelines before inviting new members.', author: 'Demo User', time: '3d ago', reactions: { '👍': 2 }, comments: 0, pinned: false },
];

// ── WORKSPACE PICKER ─────────────────────────────────────────────────────────
function ScreenPicker({ t, onSelect }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflow: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* greeting */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: '-0.035em', marginBottom: 8 }}>
            Good morning, Demo <span style={{ color: PURPLE }}>✦</span>
          </div>
          <div style={{ fontSize: 14, color: t.muted }}>Jump back into where you left off</div>
        </div>

        {/* search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
          borderRadius: 12, background: t.card, border: `1px solid ${t.border}`,
          marginBottom: 20, color: t.muted, fontSize: 14, cursor: 'text',
          boxShadow: t.isDark ? '0 1px 0 rgba(255,255,255,0.04)' : '0 1px 0 rgba(0,0,0,0.02)',
        }}>
          <span style={{ fontSize: 16, opacity: 0.5 }}>⌕</span>
          <span style={{ flex: 1, color: t.muted, fontSize: 13 }}>Search or create a workspace…</span>
          <kbd style={{ padding: '2px 6px', borderRadius: 5, background: t.subtle, fontSize: 11, fontFamily: 'DM Mono', color: t.muted, border: `1px solid ${t.border}` }}>⌘K</kbd>
        </div>

        {/* workspace list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WORKSPACES.map((ws, i) => (
            <div
              key={i}
              onClick={() => onSelect(ws)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? t.cardHover : t.card,
                border: `1px solid ${hovered === i ? ws.color + '44' : t.border}`,
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: hovered === i ? (t.isDark ? `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${ws.color}22` : `0 4px 16px rgba(0,0,0,0.07), 0 0 0 1px ${ws.color}22`) : 'none',
              }}
            >
              {/* workspace icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: ws.color + (t.isDark ? '22' : '18'),
                border: `1.5px solid ${ws.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: ws.color, flexShrink: 0,
              }}>{ws.initials}</div>

              {/* info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: '-0.015em' }}>{ws.name}</div>
                  <Badge label={ws.role} color={ws.color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, maxWidth: 200 }}>
                    <ProgressBar pct={ws.pct} height={3} color={ws.color} bg={t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.muted, flexShrink: 0 }}>{ws.pct}% goals</span>
                </div>
              </div>

              {/* meta */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: t.muted }}>{ws.members} member{ws.members !== 1 ? 's' : ''}</span>
                <div style={{ display: 'flex' }}>
                  {MEMBERS.slice(0, ws.members).map((m, j) => (
                    <Avatar key={j} name={m.name} size={20} color={m.color} style={{ marginLeft: j > 0 ? -6 : 0, border: `1.5px solid ${t.card}` }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 18, color: t.muted, transition: 'transform 0.15s', transform: hovered === i ? 'translateX(2px)' : 'none' }}>›</div>
            </div>
          ))}

          {/* create new */}
          <div style={{
            border: `1.5px dashed ${t.subtle}`, borderRadius: 14,
            padding: '16px 20px', display: 'flex', alignItems: 'center',
            gap: 16, cursor: 'pointer', color: t.muted, fontSize: 13,
            transition: 'border-color 0.15s',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              border: `1.5px dashed ${t.subtle}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 300, color: t.muted,
            }}>+</div>
            <span style={{ fontWeight: 500 }}>Create a new workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function ScreenDashboard({ t, ws, setScreen }) {
  const wsColor = ws.color;

  const stats = [
    { label: 'Total Goals', val: GOALS.length, sub: '3 active', icon: '◎', color: wsColor, pct: 62 },
    { label: 'Completed', val: 4, sub: 'this week', icon: '✓', color: GREEN, pct: 50 },
    { label: 'Overdue', val: 2, sub: 'need attention', icon: '⚠', color: ORANGE, pct: 25 },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px', display: 'flex', gap: 22 }}>
      {/* main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* stats ring bar */}
        <Card t={t} style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 14,
                borderRight: i < stats.length - 1 ? `1px solid ${t.border}` : 'none',
                paddingRight: i < stats.length - 1 ? 22 : 0,
                paddingLeft: i > 0 ? 22 : 0,
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ProgressRing pct={s.pct} size={52} stroke={5} color={s.color} trackOpacity={0.1} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s.icon}</div>
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginTop: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* active goals */}
        <Card t={t}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Active Goals</span>
            <button onClick={() => setScreen('goals')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>View all →</button>
          </div>
          {GOALS.map((g, i) => (
            <div key={i} style={{
              padding: '12px 18px', borderBottom: i < GOALS.length - 1 ? `1px solid ${t.border}` : 'none',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <ProgressRing pct={g.pct} size={36} stroke={3} color={wsColor} trackOpacity={0.1} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{g.name}</div>
                <ProgressBar pct={g.pct} height={3} color={wsColor} bg={t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} animated />
              </div>
              <div style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.muted, width: 30, textAlign: 'right' }}>{g.pct}%</div>
              <StatusBadge status={g.status} />
            </div>
          ))}
        </Card>

        {/* recent action items */}
        <Card t={t}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Recent Action Items</span>
            <button onClick={() => setScreen('actions')} style={{ fontSize: 12, color: wsColor, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>View board →</button>
          </div>
          {ACTION_ITEMS.slice(0, 3).map((item, i) => (
            <div key={i} style={{ padding: '11px 18px', borderBottom: i < 2 ? `1px solid ${t.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${item.status === 'Done' ? GREEN : t.border}`,
                background: item.status === 'Done' ? GREEN : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#fff', flexShrink: 0,
              }}>{item.status === 'Done' ? '✓' : ''}</div>
              <div style={{ flex: 1, fontSize: 13, color: item.status === 'Done' ? t.muted : t.text, textDecoration: item.status === 'Done' ? 'line-through' : 'none' }}>{item.title}</div>
              <StatusBadge status={item.priority} />
              <Avatar name={item.assignee} size={22} />
            </div>
          ))}
        </Card>
      </div>

      {/* right sidebar */}
      <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* members */}
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Members</div>
          {MEMBERS.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={m.name} size={26} color={m.color} />
                <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                  <OnlineBadge online={m.online} card={t.card} size={7} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: 10, color: t.muted }}>{m.role}</div>
              </div>
              {m.online && <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />}
            </div>
          ))}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
            <button style={{ width: '100%', padding: '7px 10px', borderRadius: 8, background: wsColor + '14', border: `1px solid ${wsColor}28`, color: wsColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans' }}>+ Invite member</button>
          </div>
        </Card>

        {/* pinned announcement */}
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Pinned</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 3, background: wsColor, borderRadius: 99, flexShrink: 0, alignSelf: 'stretch' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.4, marginBottom: 4 }}>{ANNOUNCEMENTS[0].title}</div>
              <div style={{ fontSize: 11, color: t.muted }}>{ANNOUNCEMENTS[0].time} · {Object.values(ANNOUNCEMENTS[0].reactions).reduce((a, b) => a + b, 0)} reactions</div>
            </div>
          </div>
        </Card>

        {/* mini chart placeholder */}
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Goal Progress</div>
          {/* simple bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
            {[40, 65, 25, 90, 62, 78, 45].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', height: `${h * 0.6}%`, background: i === 3 ? wsColor : wsColor + '44', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: t.muted, fontFamily: 'DM Mono' }}>{d}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── GOALS LIST ────────────────────────────────────────────────────────────────
function ScreenGoals({ t, ws, setScreen, setSelectedGoal }) {
  const wsColor = ws.color;
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'In Progress', 'On Track', 'At Risk', 'Completed'];
  const filtered = filter === 'All' ? GOALS : GOALS.filter(g => g.status === filter);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '18px 28px' }}>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <Chip key={f} label={f} active={filter === f} color={wsColor} onClick={() => setFilter(f)} t={t} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2, background: t.card, border: `1px solid ${t.border}`, borderRadius: 9, padding: 3 }}>
            {['☰ List', '⊞ Board'].map((v, i) => (
              <div key={i} style={{ padding: '4px 10px', borderRadius: 6, background: i === 0 ? wsColor + '18' : 'transparent', color: i === 0 ? wsColor : t.muted, fontSize: 12, cursor: 'pointer', fontWeight: i === 0 ? 600 : 400 }}>{v}</div>
            ))}
          </div>
          <button style={{ padding: '7px 16px', borderRadius: 9, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>+ New Goal</button>
        </div>
      </div>

      {/* summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[
          { label: `${GOALS.length} total`, color: t.text },
          { label: `${GOALS.filter(g => g.status === 'In Progress').length} in progress`, color: wsColor },
          { label: `${GOALS.filter(g => g.status === 'On Track').length} on track`, color: GREEN },
          { label: `${GOALS.filter(g => g.status === 'At Risk').length} at risk`, color: ORANGE },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: t.card, border: `1px solid ${t.border}`, fontSize: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
            <span style={{ color: t.muted }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* goal cards 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map((g) => (
          <Card key={g.id} t={t} onClick={() => { setSelectedGoal(g); setScreen('goal-detail'); }} style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            {/* progress bar top edge */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: `${g.pct}%`, height: 3, background: wsColor, borderRadius: '14px 0 0 0', opacity: 0.85 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: '-0.015em', marginBottom: 5 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{g.desc}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <ProgressRing pct={g.pct} size={48} stroke={4} color={wsColor} trackOpacity={0.1} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <StatusBadge status={g.status} />
              <span style={{ fontSize: 11, color: t.muted }}>{g.milestones} milestone{g.milestones !== 1 ? 's' : ''}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: 'DM Mono', letterSpacing: '-0.04em' }}>{g.pct}<span style={{ fontSize: 13, fontWeight: 500, color: t.muted }}>%</span></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Avatar name={g.owner} size={22} color={g.ownerColor} />
                <span style={{ fontSize: 12, color: t.muted }}>{g.owner}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.muted }}>Due {g.due}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── GOAL DETAIL ───────────────────────────────────────────────────────────────
function ScreenGoalDetail({ t, ws, goal, setScreen }) {
  const wsColor = ws.color;
  const [activeTab, setActiveTab] = React.useState('overview');
  const goalItems = ACTION_ITEMS.filter(a => a.goalId === goal.id);
  const milestones = [
    { name: 'Initial research', pct: 100, done: true },
    { name: 'Design complete', pct: 80, done: false },
    { name: 'Development', pct: 45, done: false },
  ].slice(0, goal.milestones);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px' }}>
      {/* back */}
      <button onClick={() => setScreen('goals')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 13, fontFamily: 'DM Sans', marginBottom: 18, padding: 0 }}>
        ← Goals
      </button>

      {/* hero */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 22 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.03em' }}>{goal.name}</div>
            <StatusBadge status={goal.status} />
          </div>
          <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, marginBottom: 12 }}>{goal.desc}</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: t.muted }}>
            <span>Owner: <strong style={{ color: t.text }}>{goal.owner}</strong></span>
            <span>Due: <strong style={{ color: t.text }}>{goal.due}</strong></span>
            <span>Milestones: <strong style={{ color: t.text }}>{goal.milestones}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProgressRing pct={goal.pct} size={80} stroke={6} color={wsColor} trackOpacity={0.1} />
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: t.text, fontFamily: 'DM Mono', letterSpacing: '-0.04em' }}>{goal.pct}%</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: t.muted }}>complete</div>
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={{ padding: '7px 16px', borderRadius: 8, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>Edit Goal</button>
        <button style={{ padding: '7px 16px', borderRadius: 8, background: t.card, color: t.muted, border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans' }}>Post update</button>
        <button style={{ padding: '7px 16px', borderRadius: 8, background: t.card, color: RED, border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans' }}>Delete</button>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, marginBottom: 20 }}>
        {['overview','activity','action-items'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? wsColor : t.muted,
            borderBottom: activeTab === tab ? `2px solid ${wsColor}` : '2px solid transparent',
            background: 'none', border: 'none', borderBottom: activeTab === tab ? `2px solid ${wsColor}` : '2px solid transparent',
            cursor: 'pointer', fontFamily: 'DM Sans', textTransform: 'capitalize',
          }}>{tab.replace('-', ' ')}</button>
        ))}
      </div>

      {/* tab content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Milestones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {milestones.map((m, i) => (
                <Card key={i} t={t} style={{ padding: '13px 16px' }} hover={false}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${m.done ? GREEN : t.border}`,
                      background: m.done ? GREEN : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', flexShrink: 0,
                    }}>{m.done ? '✓' : ''}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>{m.name}</div>
                      <ProgressBar pct={m.pct} height={4} color={m.done ? GREEN : wsColor} bg={t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} animated />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.muted, flexShrink: 0 }}>{m.pct}%</span>
                  </div>
                </Card>
              ))}
              <button style={{ padding: '9px 14px', borderRadius: 9, background: 'transparent', border: `1.5px dashed ${t.subtle}`, color: t.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', textAlign: 'left' }}>+ Add milestone</button>
            </div>
          </div>
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Details</div>
            <Card t={t} style={{ padding: 16 }} hover={false}>
              {[
                { label: 'Status', value: <StatusBadge status={goal.status} /> },
                { label: 'Owner', value: <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar name={goal.owner} size={20} color={goal.ownerColor} /><span style={{ fontSize: 12, color: t.text }}>{goal.owner}</span></div> },
                { label: 'Due date', value: <span style={{ fontSize: 12, fontFamily: 'DM Mono', color: t.text }}>{goal.due}</span> },
                { label: 'Milestones', value: <span style={{ fontSize: 12, color: t.text }}>{goal.milestones}</span> },
                { label: 'Action items', value: <span style={{ fontSize: 12, color: t.text }}>{goalItems.length}</span> },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
                  <span style={{ fontSize: 12, color: t.muted }}>{row.label}</span>
                  {row.value}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div style={{ maxWidth: 560 }}>
          {[
            { user: 'Demo User', action: 'updated progress to 65%', time: '2h ago', color: PURPLE },
            { user: 'Alice', action: 'completed milestone "Initial research"', time: '1d ago', color: GREEN },
            { user: 'Demo User', action: 'created this goal', time: '3d ago', color: PURPLE },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar name={a.user} size={30} color={a.color} />
                {i < 2 && <div style={{ width: 1, flex: 1, background: t.border, marginTop: 6 }} />}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <div style={{ fontSize: 13, color: t.text, marginBottom: 2 }}>
                  <strong>{a.user}</strong> {a.action}
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>{a.time}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Avatar name="Demo User" size={30} />
            <input placeholder="Post an update… (@mention teammates)" style={{
              flex: 1, padding: '8px 14px', borderRadius: 9,
              background: t.inputBg, border: `1px solid ${t.border}`,
              color: t.text, fontSize: 13, fontFamily: 'DM Sans', outline: 'none',
            }} />
          </div>
        </div>
      )}

      {activeTab === 'action-items' && (
        <div>
          {goalItems.length === 0
            ? <EmptyState icon="◻" title="No action items" desc="Link action items to this goal to track progress" t={t} />
            : goalItems.map((item, i) => (
              <Card key={i} t={t} style={{ padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${item.status === 'Done' ? GREEN : t.border}`,
                    background: item.status === 'Done' ? GREEN : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#fff', flexShrink: 0,
                  }}>{item.status === 'Done' ? '✓' : ''}</div>
                  <span style={{ flex: 1, fontSize: 13, color: item.status === 'Done' ? t.muted : t.text, textDecoration: item.status === 'Done' ? 'line-through' : 'none' }}>{item.title}</span>
                  <StatusBadge status={item.priority} />
                  <StatusBadge status={item.status} />
                  <Avatar name={item.assignee} size={22} />
                </div>
              </Card>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
function ScreenAnnouncements({ t, ws }) {
  const wsColor = ws.color;
  const [expanded, setExpanded] = React.useState(null);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '18px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: t.muted }}>{ANNOUNCEMENTS.length} announcements</div>
        <button style={{ padding: '7px 16px', borderRadius: 9, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>+ Post announcement</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ANNOUNCEMENTS.map((ann, i) => (
          <Card key={i} t={t} style={{ padding: '18px 20px' }}>
            {/* pin badge */}
            {ann.pinned && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: wsColor, fontWeight: 700 }}>📌 Pinned</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Avatar name={ann.author} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: '-0.015em' }}>{ann.title}</div>
                  <span style={{ fontSize: 11, color: t.muted, flexShrink: 0, marginLeft: 12 }}>{ann.time}</span>
                </div>
                <div style={{ fontSize: 12, color: t.muted, marginBottom: 4 }}>{ann.author}</div>
                <div style={{
                  fontSize: 13, color: t.textSub, lineHeight: 1.6,
                  maxHeight: expanded === i ? 'none' : 60, overflow: 'hidden',
                  WebkitMaskImage: expanded === i ? 'none' : 'linear-gradient(180deg, black 50%, transparent 100%)',
                }}>{ann.body}</div>
                {ann.body.length > 120 && (
                  <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: 'none', border: 'none', color: wsColor, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', padding: '4px 0', fontWeight: 600 }}>
                    {expanded === i ? 'Show less' : 'Read more'}
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(ann.reactions).map(([emoji, count], j) => (
                      <div key={j} style={{ padding: '3px 9px', borderRadius: 999, background: t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', border: `1px solid ${t.border}`, fontSize: 12, color: t.text, cursor: 'pointer' }}>{emoji} {count}</div>
                    ))}
                    <div style={{ padding: '3px 9px', borderRadius: 999, background: 'transparent', border: `1px dashed ${t.subtle}`, fontSize: 12, color: t.muted, cursor: 'pointer' }}>+</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  {ann.comments > 0 && <span style={{ fontSize: 12, color: t.muted }}>💬 {ann.comments} comment{ann.comments > 1 ? 's' : ''}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── ACTION ITEMS / KANBAN ─────────────────────────────────────────────────────
function ScreenActions({ t, ws }) {
  const wsColor = ws.color;
  const [view, setView] = React.useState('board');

  const columns = [
    { id: 'Todo', label: 'Todo', color: t.muted },
    { id: 'In Progress', label: 'In Progress', color: wsColor },
    { id: 'Done', label: 'Done', color: GREEN },
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* toolbar */}
      <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: t.muted }}>{ACTION_ITEMS.length} items</span>
        </div>
        <div style={{ display: 'flex', gap: 2, background: t.card, border: `1px solid ${t.border}`, borderRadius: 9, padding: 3 }}>
          {['board', 'list'].map((v, i) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 6,
              background: view === v ? wsColor + '18' : 'transparent',
              color: view === v ? wsColor : t.muted,
              fontSize: 12, cursor: 'pointer', fontWeight: view === v ? 600 : 400,
              border: 'none', fontFamily: 'DM Sans',
            }}>{v === 'board' ? '⊞ Board' : '☰ List'}</button>
          ))}
        </div>
        <button style={{ padding: '7px 16px', borderRadius: 9, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>+ New item</button>
      </div>

      {view === 'board' ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 28px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {columns.map(col => {
            const items = ACTION_ITEMS.filter(a => a.status === col.id);
            return (
              <div key={col.id} style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* column header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{col.label}</span>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: t.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: t.muted, fontWeight: 700 }}>{items.length}</div>
                </div>
                {/* items */}
                {items.map((item, i) => (
                  <Card key={i} t={t} style={{ padding: '13px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10, lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={item.assignee} size={20} />
                        <span style={{ fontSize: 11, color: t.muted }}>{item.assignee.split(' ')[0]}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <StatusBadge status={item.priority} />
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: t.muted, fontFamily: 'DM Mono' }}>Due {item.due}</div>
                  </Card>
                ))}
                {/* add */}
                <div style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px dashed ${t.subtle}`, cursor: 'pointer', color: t.muted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 300 }}>+</span> Add item
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 28px' }}>
          <Card t={t} hover={false}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 90px 90px', gap: 12, padding: '10px 16px', borderBottom: `1px solid ${t.border}` }}>
              {['Title', 'Assignee', 'Priority', 'Status', 'Due'].map((h, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {ACTION_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 90px 90px', gap: 12, padding: '11px 16px', borderBottom: i < ACTION_ITEMS.length - 1 ? `1px solid ${t.border}` : 'none', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${item.status === 'Done' ? GREEN : t.border}`, background: item.status === 'Done' ? GREEN : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', flexShrink: 0 }}>{item.status === 'Done' ? '✓' : ''}</div>
                  <span style={{ fontSize: 13, color: item.status === 'Done' ? t.muted : t.text, textDecoration: item.status === 'Done' ? 'line-through' : 'none' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={item.assignee} size={20} />
                  <span style={{ fontSize: 11, color: t.muted }}>{item.assignee.split(' ')[0]}</span>
                </div>
                <StatusBadge status={item.priority} />
                <StatusBadge status={item.status} />
                <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: t.muted }}>{item.due}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── AUDIT LOG DATA ────────────────────────────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, actor: 'Demo User', actorColor: PURPLE, action: 'Published announcement', entity: 'Announcement', icon: '📢', time: '1h ago', detail: '"Team standup moved to 10am"' },
  { id: 2, actor: 'Demo User', actorColor: PURPLE, action: 'Published announcement', entity: 'Announcement', icon: '📢', time: '1h ago', detail: '"Q2 planning doc ready"' },
  { id: 3, actor: 'Demo User', actorColor: PURPLE, action: 'Updated action item', entity: 'ActionItem', icon: '☑', time: '4h ago', detail: '"Fix login redirect bug" → Done' },
  { id: 4, actor: 'Demo User', actorColor: PURPLE, action: 'Created action item', entity: 'ActionItem', icon: '☑', time: '4h ago', detail: '"Design onboarding flow"' },
  { id: 5, actor: 'Demo User', actorColor: PURPLE, action: 'Created action item', entity: 'ActionItem', icon: '☑', time: '4h ago', detail: '"Write API documentation"' },
  { id: 6, actor: 'Demo User', actorColor: PURPLE, action: 'Updated milestone', entity: 'Milestone', icon: '⬡', time: '6h ago', detail: '"Design complete" → 80%' },
  { id: 7, actor: 'user1', actorColor: ORANGE, action: 'Updated milestone', entity: 'Milestone', icon: '⬡', time: '6h ago', detail: '"Initial research" → 100%' },
  { id: 8, actor: 'user1', actorColor: ORANGE, action: 'Created milestone', entity: 'Milestone', icon: '⬡', time: '6h ago', detail: '"Development" added to Q2 Launch' },
  { id: 9, actor: 'Alice', actorColor: GREEN, action: 'Invited member', entity: 'Workspace', icon: '◉', time: '1d ago', detail: 'user1@gmail.com joined as Member' },
  { id: 10, actor: 'Demo User', actorColor: PURPLE, action: 'Created goal', entity: 'Goal', icon: '◎', time: '1d ago', detail: '"Hire 3 Engineers"' },
  { id: 11, actor: 'Alice', actorColor: GREEN, action: 'Updated goal status', entity: 'Goal', icon: '◎', time: '2d ago', detail: '"Marketing Campaign" → In Progress' },
  { id: 12, actor: 'Demo User', actorColor: PURPLE, action: 'Created workspace', entity: 'Workspace', icon: '⊞', time: '3d ago', detail: '"Demo Workspace test"' },
];

// ── DASHBOARD SCREEN ──────────────────────────────────────────────────────────
function ScreenAnalyticsDashboard({ t, ws, setScreen }) {
  const wsColor = ws.color;

  const statTiles = [
    { icon: '🎯', label: 'Total Goals', val: GOALS.length, sub: null, color: wsColor, tag: null },
    { icon: '✅', label: 'Items Completed This Week', val: 4, sub: null, color: GREEN, tag: 'action items' },
    { icon: '⚠️', label: 'Overdue Goals', val: 2, sub: null, color: ORANGE, tag: null },
    { icon: '👥', label: 'Active Members', val: 2, sub: null, color: '#8b5cf6', tag: 'past 7 days' },
    { icon: '📋', label: 'Total Action Items', val: ACTION_ITEMS.length, sub: null, color: t.text, tag: null },
    { icon: '🏆', label: 'Goals Completed This Week', val: 0, sub: null, color: ORANGE, tag: 'goals' },
  ];

  // chart data — 12 weeks
  const chartData = [
    { week: 'W07', completed: 0, created: 1 },
    { week: 'W08', completed: 0, created: 0 },
    { week: 'W09', completed: 0, created: 0 },
    { week: 'W10', completed: 0, created: 1 },
    { week: 'W11', completed: 0, created: 0 },
    { week: 'W12', completed: 0, created: 0 },
    { week: 'W13', completed: 0, created: 0 },
    { week: 'W14', completed: 0, created: 0 },
    { week: 'W15', completed: 0, created: 1 },
    { week: 'W16', completed: 0, created: 0 },
    { week: 'W17', completed: 0, created: 2 },
    { week: 'W18', completed: 1, created: 3 },
  ];
  const maxVal = 4;
  const chartH = 120;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px' }}>
      {/* section label */}
      <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Overview</div>

      {/* stat tiles grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {statTiles.slice(0, 4).map((s, i) => (
          <Card key={i} t={t} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              {s.tag && <span style={{ fontSize: 10, color: t.muted, fontFamily: 'DM Mono' }}>{s.tag}</span>}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {statTiles.slice(4).map((s, i) => (
          <Card key={i} t={t} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              {s.tag && <span style={{ fontSize: 10, color: t.muted, fontFamily: 'DM Mono' }}>{s.tag}</span>}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: t.muted }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* goal completion chart */}
      <Card t={t} style={{ padding: '20px 24px' }} hover={false}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 20 }}>Goal Completion — Last 12 Weeks</div>
        <div style={{ position: 'relative' }}>
          {/* y axis grid lines */}
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} style={{ position: 'absolute', left: 28, right: 0, bottom: 24 + (v / maxVal) * chartH, height: 1, background: t.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <span style={{ position: 'absolute', left: -24, top: -8, fontSize: 9, color: t.muted, fontFamily: 'DM Mono', width: 20, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
          {/* bars */}
          <div style={{ display: 'flex', gap: 4, paddingLeft: 28, paddingBottom: 24, alignItems: 'flex-end', height: chartH + 24 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  {/* completed bar */}
                  <div style={{ width: '80%', height: (d.completed / maxVal) * chartH, background: wsColor, borderRadius: '3px 3px 0 0', minHeight: d.completed > 0 ? 2 : 0 }} />
                  {/* created bar (stacked as separate color beneath) */}
                  <div style={{ width: '80%', height: (d.created / maxVal) * chartH, background: t.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', borderRadius: d.completed > 0 ? 0 : '3px 3px 0 0', minHeight: d.created > 0 ? 2 : 0 }} />
                </div>
                <div style={{ fontSize: 8, color: t.muted, fontFamily: 'DM Mono', marginTop: 2 }}>{d.week}</div>
              </div>
            ))}
          </div>
        </div>
        {/* legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[
            { color: wsColor, label: 'Completed' },
            { color: t.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', label: 'Created' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11, color: t.muted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── ENHANCED ANNOUNCEMENTS WITH COMMENTS ─────────────────────────────────────
function ScreenAnnouncementsV2({ t, ws }) {
  const wsColor = ws.color;
  const [expandedComments, setExpandedComments] = React.useState({ 0: true });
  const [commentInputs, setCommentInputs] = React.useState({});

  const annData = [
    {
      id: 1, pinned: true,
      author: 'Demo User', authorColor: PURPLE, time: '1h ago',
      title: 'Team standup moved to 10am',
      body: 'Starting next Monday, the daily standup will be at 10:00am UTC. Please update your calendars.',
      reactions: [{ emoji: '❤️', count: 1 }, { emoji: '😮', count: 1 }],
      comments: [
        { author: 'user1', color: ORANGE, time: 'just now', text: '@Demo User sounds good, already updated my calendar!' },
      ],
    },
    {
      id: 2, pinned: false,
      author: 'Demo User', authorColor: PURPLE, time: '1h ago',
      title: 'Q2 planning doc ready',
      body: 'The full Q2 roadmap has been posted. Please review by Friday.',
      reactions: [{ emoji: '🎉', count: 1 }],
      comments: [
        { author: 'Alice', color: GREEN, time: '30m ago', text: 'Looks great! I have a few comments on the timeline.' },
        { author: 'user1', color: ORANGE, time: '15m ago', text: '@Alice agree — let\'s discuss in standup.' },
        { author: 'Demo User', color: PURPLE, time: '10m ago', text: 'Will add time buffer. Thanks both!' },
        { author: 'Alice', color: GREEN, time: '5m ago', text: 'Perfect 👍' },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '18px 28px', maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: t.muted }}>{annData.length} announcements</div>
        <button style={{ padding: '7px 16px', borderRadius: 9, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>+ New Announcement</button>
      </div>

      {annData.map((ann, idx) => (
        <div key={ann.id}>
          {/* divider label */}
          {idx === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: t.border }} />
              <span style={{ fontSize: 11, color: t.muted, fontFamily: 'DM Mono' }}>Earlier</span>
              <div style={{ flex: 1, height: 1, background: t.border }} />
            </div>
          )}

          <Card t={t} style={{
            marginBottom: 12,
            border: ann.pinned ? `1px solid ${wsColor}40` : `1px solid ${t.border}`,
            background: ann.pinned ? (t.isDark ? wsColor + '0a' : wsColor + '06') : t.card,
          }} hover={false}>
            {/* pin badge */}
            {ann.pinned && (
              <div style={{ padding: '8px 18px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12, color: wsColor, fontWeight: 700 }}>📌 Pinned announcement</span>
              </div>
            )}

            {/* post header */}
            <div style={{ padding: '14px 18px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar name={ann.author} size={36} color={ann.authorColor} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{ann.author}</div>
                      <div style={{ fontSize: 11, color: t.muted }}>{ann.time}</div>
                    </div>
                    {/* action icons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['📌', '✏️', '🗑'].map((ic, i) => (
                        <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: '2px 4px', borderRadius: 5 }}>{ic}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginTop: 8 }}>{ann.title}</div>
                  <div style={{ fontSize: 13, color: t.textSub, marginTop: 4, lineHeight: 1.6 }}>{ann.body}</div>

                  {/* reactions */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {ann.reactions.map((r, i) => (
                      <div key={i} style={{ padding: '3px 9px', borderRadius: 999, background: t.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', border: `1px solid ${t.border}`, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{r.emoji}</span><span style={{ fontSize: 11, color: t.muted, fontFamily: 'DM Mono' }}>{r.count}</span>
                      </div>
                    ))}
                    <div style={{ padding: '3px 9px', borderRadius: 999, background: 'transparent', border: `1px dashed ${t.subtle}`, fontSize: 12, color: t.muted, cursor: 'pointer' }}>+</div>
                  </div>

                  {/* comment toggle */}
                  <button
                    onClick={() => setExpandedComments(p => ({ ...p, [idx]: !p[idx] }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 12, marginTop: 10, padding: 0, fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    💬 {ann.comments.length} comment{ann.comments.length !== 1 ? 's' : ''} {expandedComments[idx] ? '▲' : '▼'}
                  </button>
                </div>
              </div>
            </div>

            {/* comments thread */}
            {expandedComments[idx] && (
              <div style={{ padding: '12px 18px 16px', borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
                {ann.comments.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <Avatar name={c.author} size={26} color={c.color} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{c.author}</span>
                        <span style={{ fontSize: 10, color: t.muted }}>{c.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: t.textSub, marginTop: 2, lineHeight: 1.5 }}>
                        {c.text.split(/(@\w+)/g).map((part, pi) =>
                          part.startsWith('@')
                            ? <span key={pi} style={{ color: wsColor, fontWeight: 600 }}>{part}</span>
                            : <span key={pi}>{part}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* comment input */}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Avatar name="Demo User" size={26} color={PURPLE} />
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    <input
                      placeholder="Add a comment… use @ to mention teammates"
                      value={commentInputs[idx] || ''}
                      onChange={e => setCommentInputs(p => ({ ...p, [idx]: e.target.value }))}
                      style={{
                        flex: 1, padding: '7px 12px', borderRadius: 9,
                        background: t.inputBg, border: `1px solid ${t.border}`,
                        color: t.text, fontSize: 12, fontFamily: 'DM Sans', outline: 'none',
                      }}
                    />
                    <button style={{ padding: '7px 14px', borderRadius: 8, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans' }}>Post</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
function ScreenAuditLog({ t, ws }) {
  const wsColor = ws.color;
  const [entityFilter, setEntityFilter] = React.useState('All types');
  const [actorFilter, setActorFilter] = React.useState('Anyone');

  const entityTypes = ['All types', 'Goal', 'Milestone', 'ActionItem', 'Announcement', 'Workspace'];
  const actors = ['Anyone', 'Demo User', 'Alice', 'user1'];

  const filtered = AUDIT_LOG.filter(e => {
    if (entityFilter !== 'All types' && e.entity !== entityFilter) return false;
    if (actorFilter !== 'Anyone' && e.actor !== actorFilter) return false;
    return true;
  });

  const selectStyle = {
    padding: '7px 12px', borderRadius: 8,
    background: t.card, border: `1px solid ${t.border}`,
    color: t.text, fontSize: 12, fontFamily: 'DM Sans',
    cursor: 'pointer', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none',
    paddingRight: 28, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238888a0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  };

  const inputStyle = {
    padding: '7px 12px', borderRadius: 8,
    background: t.card, border: `1px solid ${t.border}`,
    color: t.text, fontSize: 12, fontFamily: 'DM Sans', outline: 'none',
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* toolbar */}
      <div style={{ padding: '14px 28px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 13, color: t.muted }}>{filtered.length} entries</span>
          <span style={{ fontSize: 13, color: t.muted }}>·</span>
          <span style={{ fontSize: 13, color: t.muted }}>admin only</span>
        </div>
        <button style={{ padding: '7px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.border}`, color: t.text, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: 6 }}>
          ↓ Export CSV
        </button>
      </div>

      {/* filters */}
      <div style={{ padding: '12px 28px', borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Entity type</div>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={selectStyle}>
            {entityTypes.map(et => <option key={et}>{et}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Actor</div>
          <select value={actorFilter} onChange={e => setActorFilter(e.target.value)} style={selectStyle}>
            {actors.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>From</div>
          <input type="text" placeholder="mm/dd/yyyy" style={{ ...inputStyle, width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>To</div>
          <input type="text" placeholder="mm/dd/yyyy" style={{ ...inputStyle, width: 120 }} />
        </div>
        <div style={{ paddingTop: 18 }}>
          <button style={{ padding: '7px 12px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.border}`, color: t.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans' }}>Reset</button>
        </div>
      </div>

      {/* log entries */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 28px' }}>
        <Card t={t} hover={false} style={{ margin: '16px 0', overflow: 'hidden' }}>
          {filtered.map((entry, i) => (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none',
            }}>
              <Avatar name={entry.actor} size={30} color={entry.actorColor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: t.text }}>
                  <span style={{ fontWeight: 700 }}>{entry.actor}</span>
                  <span style={{ color: t.textSub }}> · {entry.action} </span>
                  <span style={{ fontSize: 14 }}>{entry.icon}</span>
                </div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
                  <span style={{ background: t.subtle, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'DM Mono', marginRight: 6 }}>{entry.entity}</span>
                  {entry.time}
                  {entry.detail && <span style={{ color: t.muted }}> · {entry.detail}</span>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: t.muted, fontSize: 13 }}>No entries match your filters</div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── ENHANCED SETTINGS ─────────────────────────────────────────────────────────
function ScreenSettings({ t, ws }) {
  const wsColor = ws.color;

  const inputStyle = {
    width: '100%', padding: '9px 14px', borderRadius: 9,
    background: t.inputBg, border: `1px solid ${t.border}`,
    color: t.text, fontSize: 13, fontFamily: 'DM Sans', outline: 'none',
  };

  const roleSelectStyle = {
    padding: '5px 10px', borderRadius: 7, fontSize: 12,
    background: t.inputBg, border: `1px solid ${t.border}`,
    color: t.text, fontFamily: 'DM Sans', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px' }}>
      <div style={{ maxWidth: 680 }}>
        {/* workspace details */}
        <Card t={t} style={{ padding: '22px 24px', marginBottom: 20 }} hover={false}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 18 }}>Details</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 }}>Name</label>
            <input defaultValue={ws.name} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 }}>Description</label>
            <textarea defaultValue={ws.desc} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textSub, marginBottom: 6 }}>Accent colour</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: wsColor, border: `2px solid ${t.border}`, cursor: 'pointer', flexShrink: 0 }} />
              <input defaultValue={wsColor} style={{ ...inputStyle, width: 140, fontFamily: 'DM Mono' }} />
            </div>
          </div>
          <button style={{ padding: '9px 20px', borderRadius: 9, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 10px ${wsColor}44` }}>
            Save changes
          </button>
        </Card>

        {/* members table */}
        <Card t={t} style={{ overflow: 'hidden' }} hover={false}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Members ({MEMBERS.length})</div>
            <button style={{ padding: '7px 16px', borderRadius: 8, background: wsColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans', boxShadow: `0 2px 8px ${wsColor}44` }}>+ Invite member</button>
          </div>

          {/* table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 120px 80px', gap: 12, padding: '10px 20px', borderBottom: `1px solid ${t.border}` }}>
            {['Name', 'Email', 'Role', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>

          {MEMBERS.map((m, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 2fr 120px 80px', gap: 12,
              padding: '13px 20px', borderBottom: i < MEMBERS.length - 1 ? `1px solid ${t.border}` : 'none',
              alignItems: 'center',
            }}>
              {/* name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={m.name} size={28} color={m.color} />
                  {m.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: GREEN, border: `1.5px solid ${t.card}` }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{m.name}</span>
              </div>
              {/* email */}
              <span style={{ fontSize: 12, color: t.muted, fontFamily: 'DM Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>
              {/* role */}
              {m.role === 'Admin'
                ? <span style={{ fontSize: 13, fontWeight: 700, color: wsColor }}>ADMIN</span>
                : <select defaultValue="MEMBER" style={roleSelectStyle}>
                    <option>MEMBER</option>
                    <option>ADMIN</option>
                  </select>
              }
              {/* action */}
              {m.role === 'Admin'
                ? <button style={{ fontSize: 12, color: ORANGE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>Leave</button>
                : <button style={{ fontSize: 12, color: RED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>Remove</button>
              }
            </div>
          ))}
        </Card>

        {/* danger zone */}
        <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, border: `1px solid ${RED}28`, background: RED + '08' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 8 }}>Danger zone</div>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>Permanently delete this workspace and all its data. This cannot be undone.</div>
          <button style={{ padding: '8px 16px', borderRadius: 8, background: RED + '14', color: RED, border: `1px solid ${RED}28`, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans', fontWeight: 600 }}>Delete workspace</button>
        </div>
      </div>
    </div>
  );
}

// Export
Object.assign(window, {
  ScreenPicker, ScreenDashboard, ScreenGoals,
  ScreenGoalDetail, ScreenAnnouncements, ScreenActions,
  ScreenAnalyticsDashboard, ScreenAnnouncementsV2,
  ScreenAuditLog, ScreenSettings,
  MEMBERS, WORKSPACES, GOALS, ACTION_ITEMS, ANNOUNCEMENTS, AUDIT_LOG,
});
