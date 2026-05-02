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

  const accentColor = currentWorkspace?.accentColor || "#7c5cfc";

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
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>Goals</div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "7px 16px",
            borderRadius: 10,
            background: accentColor,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + New Goal
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: active ? accentColor + "1a" : "transparent",
                border: `1px solid ${active ? accentColor + "44" : "var(--border)"}`,
                color: active ? accentColor : "var(--muted)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {f.label}
            </button>
          );
        })}

        {/* Owner filter */}
        {members.length > 0 && (
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: ownerFilter ? accentColor + "1a" : "var(--input-bg)",
              color: ownerFilter ? accentColor : "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">All owners</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>
        )}

        <span className="font-mono ml-auto" style={{ fontSize: 11, color: "var(--muted)" }}>
          {goals.length} goal{goals.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ height: 140, borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)", opacity: 0.5 }}
              className="animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && goals.length === 0 && (
        <div style={{ background: "var(--card)", border: "1.5px dashed var(--subtle)", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No goals yet. Create one to get started.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
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
