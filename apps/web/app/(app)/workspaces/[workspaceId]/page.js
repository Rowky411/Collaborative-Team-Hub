"use client";

import Link from "next/link";
import { useWorkspaceStore } from "../../../../lib/stores/workspaceStore";
import { usePresenceStore } from "../../../../lib/stores/presenceStore";
import { useGoalStore } from "../../../../lib/stores/goalStore";
import { useActionItemStore } from "../../../../lib/stores/actionItemStore";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, ProgressRing, ProgressBar, OnlineDot, StatusBadge } from "../../../../components/ui/flux";

export default function WorkspaceOverviewPage() {
  const { workspaceId } = useParams();
  const workspace = useWorkspaceStore((s) => s.currentWorkspace);
  const members = useWorkspaceStore((s) => s.members);
  const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
  const goals = useGoalStore((s) => s.goals);
  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const items = useActionItemStore((s) => s.items);
  const fetchItems = useActionItemStore((s) => s.fetchItems);

  useEffect(() => {
    if (workspaceId) {
      fetchGoals(workspaceId);
      fetchItems(workspaceId);
    }
  }, [workspaceId, fetchGoals, fetchItems]);

  if (!workspace) return null;

  const accentColor = workspace.accentColor || "#7c5cfc";
  const activeGoals = goals.filter((g) => g.status === "IN_PROGRESS");
  const recentItems = items.slice(0, 4);

  const stats = [
    { label: "Goals", value: goals.length, sub: `${activeGoals.length} active`, icon: "◎" },
    { label: "Action Items", value: items.length, sub: `${items.filter((i) => i.status === "DONE").length} done`, icon: "◻" },
    { label: "Members", value: members.length, sub: `${onlineUserIds.size} online`, icon: "◉" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Stat strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              padding: "18px 22px",
              borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ProgressRing
                pct={i === 0 ? (goals.length ? Math.round((activeGoals.length / goals.length) * 100) : 0) : 0}
                size={48}
                stroke={4}
                color={accentColor}
                trackOpacity={0.08}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {s.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-5" style={{ minHeight: 0 }}>
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Active goals */}
          {goals.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Active Goals</span>
                <Link href={`/workspaces/${workspaceId}/goals`} style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>
                  View all →
                </Link>
              </div>
              {goals.slice(0, 5).map((g, i) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3"
                  style={{ padding: "12px 18px", borderBottom: i < Math.min(goals.length, 5) - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <ProgressRing
                    pct={g.milestones?.length
                      ? Math.round(g.milestones.reduce((s, m) => s + m.progress, 0) / g.milestones.length)
                      : 0}
                    size={34}
                    stroke={3}
                    color={accentColor}
                    trackOpacity={0.1}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/workspaces/${workspaceId}/goals/${g.id}`}
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      className="hover:underline"
                    >
                      {g.title}
                    </Link>
                    <ProgressBar
                      pct={g.milestones?.length ? Math.round(g.milestones.reduce((s, m) => s + m.progress, 0) / g.milestones.length) : 0}
                      height={3}
                      color={accentColor}
                      animated
                    />
                  </div>
                  <StatusBadge status={g.status === "IN_PROGRESS" ? "In Progress" : g.status === "COMPLETED" ? "Completed" : g.status === "OVERDUE" ? "Overdue" : "Not Started"} />
                </div>
              ))}
            </div>
          )}

          {/* Recent action items */}
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
                  {item.assignee && <Avatar name={item.assignee.name || "?"} size={22} />}
                </div>
              ))}
            </div>
          )}

          {goals.length === 0 && items.length === 0 && (
            <div style={{ background: "var(--card)", border: "1.5px dashed var(--subtle)", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No goals or action items yet. Start by creating a goal.</p>
              <Link
                href={`/workspaces/${workspaceId}/goals`}
                style={{ marginTop: 12, display: "inline-block", fontSize: 13, fontWeight: 600, color: accentColor }}
              >
                Create first goal →
              </Link>
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
              Members
            </div>
            {members.map((m, i) => {
              const online = onlineUserIds.has(m.userId);
              return (
                <div
                  key={m.userId}
                  className="flex items-center gap-2.5"
                  style={{ padding: "6px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}
                >
                  <div style={{ position: "relative" }}>
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.name} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <Avatar name={m.name || "?"} size={26} />
                    )}
                    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
                      <OnlineDot online={online} size={7} ring="var(--card)" />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
