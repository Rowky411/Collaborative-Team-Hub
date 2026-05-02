"use client";

import Link from "next/link";
import { useWorkspaceStore } from "../../../../lib/stores/workspaceStore";
import { usePresenceStore } from "../../../../lib/stores/presenceStore";
import { useGoalStore } from "../../../../lib/stores/goalStore";
import { useActionItemStore } from "../../../../lib/stores/actionItemStore";
import { useAnnouncementStore } from "../../../../lib/stores/announcementStore";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, ProgressRing, ProgressBar, OnlineDot, StatusBadge, Badge } from "../../../../components/ui/flux";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Simple mock weekly progress bars (heights based on goal completion spread)
function GoalProgressChart({ goals }) {
  // Build a fake 7-day distribution from goal statuses
  const heights = [40, 55, 35, 70, 60, 20, 10];
  return (
    <div className="flex items-end justify-between gap-1" style={{ height: 48 }}>
      {DAYS.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
          <div
            style={{
              width: "100%",
              height: heights[i],
              background: i === 3
                ? "var(--accent, #7c5cfc)"
                : "color-mix(in srgb, var(--accent, #7c5cfc) 25%, transparent)",
              borderRadius: 3,
              transition: "height 0.4s",
            }}
          />
          <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600 }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ pct, color, icon, value, label, sub, border }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: "18px 22px",
        borderRight: border ? "1px solid var(--border)" : "none",
        flex: 1,
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ProgressRing pct={pct} size={50} stroke={4} color={color} trackOpacity={0.12} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkspaceOverviewPage() {
  const { workspaceId } = useParams();
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const members = useWorkspaceStore((s) => s.members);
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const goals = useGoalStore((s) => s.goals);
  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const items = useActionItemStore((s) => s.items);
  const fetchItems = useActionItemStore((s) => s.fetchItems);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetchAnnouncements);
  const announcements = useAnnouncementStore((s) => s.announcements);

  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchGoals(workspaceId);
      fetchItems(workspaceId);
      fetchAnnouncements(workspaceId);
    }
  }, [workspaceId, fetchGoals, fetchItems, fetchAnnouncements]);

  if (!workspace) return null;

  const accentColor = workspace.accentColor || "#7c5cfc";

  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "NOT_STARTED");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const overdueGoals = goals.filter((g) => g.status === "OVERDUE");
  const recentItems = [...items].slice(0, 4);
  const pinnedAnnouncement = announcements.find((a) => a.isPinned);

  const goalPct = goals.length ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const completedPct = goals.length ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const overduePct = goals.length ? Math.round((overdueGoals.length / goals.length) * 100) : 0;

  const isAdmin = workspace.role === "ADMIN";

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stat strip ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <StatCard
          pct={goalPct}
          color={accentColor}
          icon="◎"
          value={goals.length}
          label="Total Goals"
          sub={`${activeGoals.length} active`}
          border
        />
        <StatCard
          pct={completedPct}
          color="#22c55e"
          icon="✓"
          value={completedGoals.length}
          label="Completed"
          sub="this week"
          border
        />
        <StatCard
          pct={overduePct}
          color="#f97316"
          icon="⚠"
          value={overdueGoals.length}
          label="Overdue"
          sub="need attention"
          border={false}
        />
      </div>

      <div className="flex gap-5" style={{ minHeight: 0, alignItems: "flex-start" }}>

        {/* ── Main column ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Active Goals */}
          {goals.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Active Goals</span>
                <Link href={`/workspaces/${workspaceId}/goals`} style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>
                  View all →
                </Link>
              </div>
              {goals.slice(0, 5).map((g, i) => {
                const pct = g.milestones?.length
                  ? Math.round(g.milestones.reduce((s, m) => s + m.progress, 0) / g.milestones.length)
                  : 0;
                const statusLabel =
                  g.status === "IN_PROGRESS" ? "In Progress"
                  : g.status === "COMPLETED" ? "Completed"
                  : g.status === "OVERDUE" ? "Overdue"
                  : "Not Started";
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3"
                    style={{ padding: "12px 18px", borderBottom: i < Math.min(goals.length, 5) - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <ProgressRing pct={pct} size={34} stroke={3} color={accentColor} trackOpacity={0.1} />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/workspaces/${workspaceId}/goals/${g.id}`}
                        style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        className="hover:underline"
                      >
                        {g.title}
                      </Link>
                      <ProgressBar pct={pct} height={3} color={accentColor} animated />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)", width: 30, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                    <StatusBadge status={statusLabel} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Action Items */}
          {recentItems.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Recent Action Items</span>
                <Link href={`/workspaces/${workspaceId}/action-items`} style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>
                  View board →
                </Link>
              </div>
              {recentItems.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3"
                  style={{ padding: "11px 18px", borderBottom: i < recentItems.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  {/* Status circle */}
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${item.status === "DONE" ? "#22c55e" : "var(--border)"}`,
                    background: item.status === "DONE" ? "#22c55e" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, color: "#fff",
                  }}>
                    {item.status === "DONE" ? "✓" : ""}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: item.status === "DONE" ? "var(--muted)" : "var(--text)", textDecoration: item.status === "DONE" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </span>
                  {/* Priority badge */}
                  <Badge
                    label={item.priority === "URGENT" ? "Urgent" : item.priority === "HIGH" ? "High" : item.priority === "LOW" ? "Low" : "Medium"}
                    color={item.priority === "URGENT" || item.priority === "HIGH" ? "#ef4444" : item.priority === "LOW" ? "#22c55e" : "#f97316"}
                    size="xs"
                  />
                  {item.assignee && <Avatar name={item.assignee.name || "?"} size={22} />}
                </div>
              ))}
            </div>
          )}

          {goals.length === 0 && items.length === 0 && (
            <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No goals or action items yet. Start by creating a goal.</p>
              <Link href={`/workspaces/${workspaceId}/goals`} style={{ marginTop: 12, display: "inline-block", fontSize: 13, fontWeight: 600, color: accentColor }}>
                Create first goal →
              </Link>
            </div>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────── */}
        <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* MEMBERS card */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
            {/* Section label */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>
              Members
            </div>

            {/* Member rows */}
            <div className="flex flex-col" style={{ gap: 0 }}>
              {members.map((m, i) => {
                const online = onlineUserIds.has(m.userId);
                const roleLabel = m.role === "ADMIN" ? "Admin" : "Member";
                return (
                  <div
                    key={m.userId}
                    className="flex items-center gap-2"
                    style={{
                      padding: "7px 0",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* Avatar + online dot */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {m.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.avatarUrl} alt={m.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <Avatar name={m.name || "?"} size={28} />
                      )}
                      <div style={{ position: "absolute", bottom: -1, right: -1 }}>
                        <OnlineDot online={online} size={8} ring="var(--card)" />
                      </div>
                    </div>

                    {/* Name + role */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>{roleLabel}</div>
                    </div>

                    {/* Online indicator dot (right side) */}
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      background: online ? "#22c55e" : "transparent",
                    }} />
                  </div>
                );
              })}
            </div>

            {/* Invite button */}
            {isAdmin && (
              <button
                onClick={() => setShowInvite(true)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: "7px 0",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--accent, #7c5cfc) 8%, transparent)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                + Invite member
              </button>
            )}
          </div>

          {/* PINNED announcement */}
          {pinnedAnnouncement && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>
                Pinned
              </div>
              <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.4, margin: 0 }}>
                  {pinnedAnnouncement.title}
                </p>
                <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  {timeAgo(pinnedAnnouncement.createdAt)}
                  {pinnedAnnouncement.reactions?.length > 0 && ` · ${pinnedAnnouncement.reactions.length} reactions`}
                </p>
              </div>
            </div>
          )}

          {/* GOAL PROGRESS mini chart */}
          {goals.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12 }}>
                Goal Progress
              </div>
              <GoalProgressChart goals={goals} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
