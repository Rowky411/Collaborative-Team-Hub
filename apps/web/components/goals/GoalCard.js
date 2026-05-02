"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useGoalStore } from "../../lib/stores/goalStore";
import { StatusBadge, STATUS_OPTIONS } from "./StatusBadge";
import { ProgressRing } from "./ProgressRing";

function avgProgress(milestones) {
  if (!milestones?.length) return 0;
  return Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);
}

export function GoalCard({ goal, onDeleted }) {
  const { workspaceId } = useParams();
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const [statusOpen, setStatusOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [toast, setToast] = useState(null);

  const progress = avgProgress(goal.milestones);

  async function handleStatusChange(newStatus) {
    setStatusOpen(false);
    try {
      await updateGoal(workspaceId, goal.id, { status: newStatus });
    } catch {
      setToast("Failed to update status");
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete goal "${goal.title}"?`)) return;
    try {
      await deleteGoal(workspaceId, goal.id);
      onDeleted?.();
    } catch (err) {
      setToast(err?.response?.data?.error?.message || "Failed to delete goal");
      setTimeout(() => setToast(null), 3000);
    }
  }

  const accentColor = "var(--accent, #7c5cfc)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "var(--card)",
        border: `1px solid ${hovered ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border)"}`,
        borderRadius: 14,
        overflow: "visible",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 18px rgba(0,0,0,0.06), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          height: 3,
          background: accentColor,
          borderRadius: "14px 14px 0 0",
          opacity: progress > 0 ? 1 : 0.25,
          width: `${Math.max(4, progress)}%`,
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {toast && (
        <div style={{ position: "absolute", top: 8, right: 8, borderRadius: 6, background: "var(--red)", padding: "2px 8px", fontSize: 11, color: "#fff", zIndex: 10 }}>
          {toast}
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/workspaces/${workspaceId}/goals/${goal.id}`}
              style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}
              className="hover:underline block truncate"
            >
              {goal.title}
            </Link>
            {goal.description && (
              <p style={{ marginTop: 4, fontSize: 12, color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {goal.description}
              </p>
            )}
          </div>
          <ProgressRing progress={progress} size={40} stroke={3} />
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div style={{ position: "relative" }}>
            <StatusBadge status={goal.status} onClick={() => setStatusOpen((o) => !o)} />
            {statusOpen && (
              <div style={{
                position: "absolute", left: 0, top: "calc(100% + 4px)", zIndex: 20,
                background: "var(--surface)", border: "1px solid var(--border-strong)",
                borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 130,
              }}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    style={{
                      display: "block", width: "100%", padding: "8px 12px", textAlign: "left",
                      fontSize: 12, color: "var(--text)", background: "none", border: 0, cursor: "pointer",
                    }}
                    className="hover:bg-[color:var(--card-hover)]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {goal.dueDate && (
            <span className="ml-auto font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>
              Due {new Date(goal.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {goal.owner && (
            <div className="flex items-center gap-1.5">
              {goal.owner.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={goal.owner.avatarUrl} alt={goal.owner.name} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span
                  style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: accentColor,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "#fff",
                  }}
                >
                  {goal.owner.name?.[0]?.toUpperCase()}
                </span>
              )}
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{goal.owner.name}</span>
            </div>
          )}
          {(goal._count?.milestones > 0 || goal.milestones?.length > 0) && (
            <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
              {goal._count?.milestones ?? goal.milestones?.length} milestone{(goal._count?.milestones ?? goal.milestones?.length) !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
