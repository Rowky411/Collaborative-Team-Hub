"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGoalStore } from "../../../../../lib/stores/goalStore";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { GoalCard } from "../../../../../components/goals/GoalCard";
import { GoalForm } from "../../../../../components/goals/GoalForm";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OVERDUE", label: "Overdue" },
];

export default function GoalsPage() {
  const { workspaceId } = useParams();
  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const goals = useGoalStore((s) => s.goals);
  const loading = useGoalStore((s) => s.loading);
  const createGoal = useGoalStore((s) => s.createGoal);
  const reset = useGoalStore((s) => s.reset);
  const members = useWorkspaceStore((s) => s.members);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const isAdmin = currentWorkspace?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGoals(workspaceId, { status: statusFilter || undefined, ownerId: ownerFilter || undefined });
  }, [workspaceId, statusFilter, ownerFilter, fetchGoals]);

  useEffect(() => {
    return () => reset();
  }, [workspaceId, reset]);

  async function handleCreate(payload) {
    await createGoal(workspaceId, payload);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + New Goal
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div>
          <label className="mr-1 text-xs text-[color:var(--muted)]">Status</label>
          <select
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-1 text-xs text-[color:var(--muted)]">Owner</label>
          <select
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1 text-sm"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="">All</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-[color:var(--muted)]">Loading…</p>}

      {!loading && goals.length === 0 && (
        <p className="text-sm text-[color:var(--muted)]">No goals yet. Create one to get started.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <GoalForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
