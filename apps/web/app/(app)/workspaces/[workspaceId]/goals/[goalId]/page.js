"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGoalStore } from "../../../../../../lib/stores/goalStore";
import { useWorkspaceStore } from "../../../../../../lib/stores/workspaceStore";
import { StatusBadge, STATUS_OPTIONS } from "../../../../../../components/goals/StatusBadge";
import { ProgressRing } from "../../../../../../components/goals/ProgressRing";
import { MilestoneList } from "../../../../../../components/goals/MilestoneList";
import { GoalUpdateFeed } from "../../../../../../components/goals/GoalUpdateFeed";
import { GoalForm } from "../../../../../../components/goals/GoalForm";

function avgProgress(milestones) {
  if (!milestones?.length) return 0;
  return Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);
}

const TABS = ["Overview", "Activity", "Action Items"];

export default function GoalDetailPage() {
  const { workspaceId, goalId } = useParams();
  const router = useRouter();
  const loadGoal = useGoalStore((s) => s.loadGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const fetchUpdates = useGoalStore((s) => s.fetchUpdates);
  const goal = useGoalStore((s) => s.currentGoal);
  const loading = useGoalStore((s) => s.loading);
  const error = useGoalStore((s) => s.error);

  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const isAdmin = currentWorkspace?.role === "ADMIN";

  const [tab, setTab] = useState("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadGoal(workspaceId, goalId).catch(() => router.replace(`/workspaces/${workspaceId}/goals`));
  }, [workspaceId, goalId, loadGoal, router]);

  useEffect(() => {
    if (tab === "Activity" && goal) {
      fetchUpdates(workspaceId, goalId);
    }
  }, [tab, goal, workspaceId, goalId, fetchUpdates]);

  async function handleStatusChange(newStatus) {
    try {
      await updateGoal(workspaceId, goalId, { status: newStatus });
    } catch {
      setToast("Failed to update status");
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete goal "${goal?.title}"?`)) return;
    try {
      await deleteGoal(workspaceId, goalId);
      router.replace(`/workspaces/${workspaceId}/goals`);
    } catch (err) {
      setToast(err?.response?.data?.error?.message || "Failed to delete");
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleEdit(payload) {
    await updateGoal(workspaceId, goalId, payload);
  }

  if (loading && !goal) {
    return <p className="text-sm text-[color:var(--muted)]">Loading…</p>;
  }
  if (error && !goal) {
    return <p className="text-sm text-red-500">{error}</p>;
  }
  if (!goal) return null;

  const progress = avgProgress(goal.milestones);

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="rounded bg-red-500 px-3 py-2 text-sm text-white">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(`/workspaces/${workspaceId}/goals`)}
              className="text-sm text-[color:var(--muted)] hover:underline"
            >
              ← Goals
            </button>
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-[color:var(--muted)]">{goal.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <div className="relative group">
              <StatusBadge status={goal.status} onClick={null} />
              <div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block rounded-md border border-[color:var(--border)] bg-[color:var(--background)] shadow-md">
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
            </div>
            {goal.owner && (
              <span className="text-sm text-[color:var(--muted)]">Owner: {goal.owner.name}</span>
            )}
            {goal.dueDate && (
              <span className="text-sm text-[color:var(--muted)]">
                Due {new Date(goal.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <ProgressRing progress={progress} size={56} stroke={5} />
          <span className="text-xs text-[color:var(--muted)]">{progress}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--border)]/30"
        >
          Edit
        </button>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[color:var(--border)]">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === t
                  ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "Overview" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">Milestones</h2>
          <MilestoneList
            milestones={goal.milestones}
            workspaceId={workspaceId}
            goalId={goalId}
            canEdit
          />
        </div>
      )}

      {tab === "Activity" && (
        <GoalUpdateFeed
          updates={goal.updates || []}
          workspaceId={workspaceId}
          goalId={goalId}
        />
      )}

      {tab === "Action Items" && (
        <p className="text-sm text-[color:var(--muted)]">Action items coming in Phase 4.</p>
      )}

      <GoalForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        initial={goal}
      />
    </div>
  );
}
