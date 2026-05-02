"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGoalStore } from "../../../../../lib/stores/goalStore";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { GoalCard } from "../../../../../components/goals/GoalCard";
import { GoalForm } from "../../../../../components/goals/GoalForm";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "NOT_STARTED", label: "On Track" },
  { value: "OVERDUE", label: "At Risk" },
  { value: "COMPLETED", label: "Completed" },
];

const STATUS_DOT_COLORS = {
  "": "#7c5cfc",
  IN_PROGRESS: "#7c5cfc",
  NOT_STARTED: "#22c55e",
  OVERDUE: "#f97316",
  COMPLETED: "#22c55e",
};

export default function GoalsPage() {
  const { workspaceId } = useParams();
  const fetchGoals = useGoalStore((s) => s.fetchGoals);
  const goals = useGoalStore((s) => s.goals);
  const loading = useGoalStore((s) => s.loading);
  const createGoal = useGoalStore((s) => s.createGoal);
  const reset = useGoalStore((s) => s.reset);
  const members = useWorkspaceStore((s) => s.members);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const accentColor = currentWorkspace?.accentColor || "#7c5cfc";

  useEffect(() => {
    fetchGoals(workspaceId, { status: statusFilter || undefined });
  }, [workspaceId, statusFilter, fetchGoals]);

  useEffect(() => {
    return () => reset();
  }, [workspaceId, reset]);

  async function handleCreate(payload) {
    await createGoal(workspaceId, payload);
  }

  // Summary counts
  const inProgress = goals.filter((g) => g.status === "IN_PROGRESS").length;
  const onTrack = goals.filter((g) => g.status === "NOT_STARTED").length;
  const atRisk = goals.filter((g) => g.status === "OVERDUE").length;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Top bar: tabs + new goal button ── */}
      <div className="flex items-center justify-between gap-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: active
                    ? "color-mix(in srgb, var(--accent, #7c5cfc) 18%, transparent)"
                    : "transparent",
                  color: active ? "var(--accent, #7c5cfc)" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.12s",
                  borderBottom: active ? `2px solid var(--accent, #7c5cfc)` : "2px solid transparent",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* New Goal button */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "7px 18px",
            borderRadius: 10,
            background: accentColor,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            transition: "opacity 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + New Goal
        </button>
      </div>

      {/* ── Summary pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <SummaryPill label={`${goals.length} total`} color="#8888a0" />
        {inProgress > 0 && <SummaryPill label={`${inProgress} in progress`} color={accentColor} />}
        {onTrack > 0 && <SummaryPill label={`${onTrack} on track`} color="#22c55e" />}
        {atRisk > 0 && <SummaryPill label={`${atRisk} at risk`} color="#f97316" />}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{ height: 160, borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)", opacity: 0.5 }}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && goals.length === 0 && (
        <div style={{
          background: "var(--card)", border: "1.5px dashed var(--border)",
          borderRadius: 14, padding: "48px 24px", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No goals yet. Create one to get started.</p>
        </div>
      )}

      {/* ── 2-column goal grid ── */}
      {!loading && goals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} accentColor={accentColor} />
          ))}
        </div>
      )}

      <GoalForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function SummaryPill({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${color}33`,
      background: `${color}12`,
      fontSize: 11, fontWeight: 500, color: "var(--muted)",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}
