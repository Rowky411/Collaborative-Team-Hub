"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusBadge, STATUS_OPTIONS } from "./StatusBadge";
import { ProgressRing } from "./ProgressRing";
import { useGoalStore } from "../../lib/stores/goalStore";
import { useState } from "react";

function avgProgress(milestones) {
  if (!milestones?.length) return 0;
  return Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);
}

export function GoalCard({ goal, onDeleted }) {
  const { workspaceId } = useParams();
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const [statusOpen, setStatusOpen] = useState(false);
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

  return (
    <div className="relative rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-4 shadow-sm">
      {toast && (
        <div className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-xs text-white z-10">{toast}</div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/workspaces/${workspaceId}/goals/${goal.id}`}
            className="font-medium hover:underline truncate block"
          >
            {goal.title}
          </Link>
          {goal.description && (
            <p className="mt-1 text-xs text-[color:var(--muted)] line-clamp-2">{goal.description}</p>
          )}
        </div>
        <ProgressRing progress={progress} size={40} stroke={4} />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <div className="relative">
          <StatusBadge status={goal.status} onClick={() => setStatusOpen((o) => !o)} />
          {statusOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] shadow-md">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[color:var(--border)]/30"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {goal.owner && (
          <span className="text-xs text-[color:var(--muted)]">
            {goal.owner.avatarUrl
              ? <img src={goal.owner.avatarUrl} alt={goal.owner.name} className="inline-block w-4 h-4 rounded-full mr-1" />
              : null}
            {goal.owner.name}
          </span>
        )}

        {goal.dueDate && (
          <span className="text-xs text-[color:var(--muted)] ml-auto">
            Due {new Date(goal.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {(goal._count?.milestones > 0 || goal.milestones?.length > 0) && (
        <div className="mt-2 text-xs text-[color:var(--muted)]">
          {progress}% · {goal._count?.milestones ?? goal.milestones?.length} milestone{(goal._count?.milestones ?? goal.milestones?.length) !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
