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
import { GoalActionItems } from "../../../../../../components/goals/GoalActionItems";

function avgProgress(milestones) {
  if (!milestones?.length) return 0;
  return Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length);
}

const TABS = ["Overview", "Activity", "Action Items"];

// ─── Details sidebar card ─────────────────────────────────────────────────────

function DetailRow({ label, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
      <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{children}</div>
    </div>
  );
}

function OwnerChip({ owner, accentColor }) {
  if (!owner) return <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {owner.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={owner.avatarUrl} alt={owner.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <span style={{
          width: 20, height: 20, borderRadius: "50%", background: accentColor,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {owner.name?.[0]?.toUpperCase()}
        </span>
      )}
      <span style={{ fontSize: 12, fontWeight: 600 }}>{owner.name}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  const members = useWorkspaceStore((s) => s.members);
  const isAdmin = currentWorkspace?.role === "ADMIN";
  const accentColor = currentWorkspace?.accentColor || "#7c5cfc";

  const [tab, setTab] = useState("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadGoal(workspaceId, goalId).catch(() =>
      router.replace(`/workspaces/${workspaceId}/goals`)
    );
  }, [workspaceId, goalId, loadGoal, router]);

  useEffect(() => {
    if (tab === "Activity" && goal) fetchUpdates(workspaceId, goalId);
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

  if (loading && !goal) return (
    <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading…</p>
  );
  if (error && !goal) return (
    <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
  );
  if (!goal) return null;

  const progress = avgProgress(goal.milestones);
  const milestoneCount = goal.milestones?.length ?? goal._count?.milestones ?? 0;
  const actionItemCount = goal._count?.actionItems ?? 0;
  const dueDate = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 24, zIndex: 50,
          background: "#ef4444", borderRadius: 8, padding: "6px 14px",
          fontSize: 13, color: "#fff", fontWeight: 500,
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        {/* Back link */}
        <button
          onClick={() => router.push(`/workspaces/${workspaceId}/goals`)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--muted)", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 4, padding: 0,
          }}
          className="hover:text-[color:var(--text)]"
        >
          ← Goals
        </button>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title + status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{
                fontSize: 26, fontWeight: 800, color: "var(--text)",
                letterSpacing: "-0.03em", margin: 0,
              }}>
                {goal.title}
              </h1>
              {/* Inline status badge — click to open change dropdown */}
              <div style={{ position: "relative" }}>
                <StatusBadge
                  status={goal.status}
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Description */}
            {goal.description && (
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                {goal.description}
              </p>
            )}

            {/* Meta row: Owner · Due · Milestones */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
              {goal.owner && (
                <span>
                  Owner{" "}
                  <strong style={{ color: "var(--text)", fontWeight: 700 }}>{goal.owner.name}</strong>
                </span>
              )}
              {dueDate && (
                <span>
                  Due{" "}
                  <strong style={{ color: "var(--text)", fontWeight: 700 }}>{dueDate}</strong>
                </span>
              )}
              {milestoneCount > 0 && (
                <span>
                  Milestones{" "}
                  <strong style={{ color: "var(--text)", fontWeight: 700 }}>{milestoneCount}</strong>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => setEditOpen(true)}
                style={{
                  padding: "7px 18px", borderRadius: 10,
                  background: accentColor, color: "#fff",
                  fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                  transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Edit Goal
              </button>
              <button
                onClick={() => {}}
                style={{
                  padding: "7px 18px", borderRadius: 10,
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: 13, cursor: "pointer",
                  transition: "background 0.12s",
                }}
                className="hover:bg-[color:var(--border)]"
              >
                Post update
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "7px 18px", borderRadius: 10,
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#ef4444", fontSize: 13, cursor: "pointer",
                  transition: "background 0.12s",
                }}
                className="hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Big progress ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 88, height: 88 }}>
              <ProgressRing progress={progress} size={88} stroke={7} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>
                  {progress}%
                </span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>complete</span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                fontSize: 13, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? accentColor : "var(--muted)",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: tab === t ? `2px solid ${accentColor}` : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.12s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────── */}
      {tab === "Overview" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* Milestones main area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--muted)",
              letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12,
            }}>
              Milestones
            </div>
            <MilestoneList
              milestones={goal.milestones}
              workspaceId={workspaceId}
              goalId={goalId}
              canEdit={isAdmin}
              accentColor={accentColor}
            />
          </div>

          {/* Details sidebar */}
          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "var(--muted)",
                letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4,
              }}>
                Details
              </div>

              <DetailRow label="Status">
                <StatusBadge status={goal.status} />
              </DetailRow>

              <DetailRow label="Owner">
                <OwnerChip owner={goal.owner} accentColor={accentColor} />
              </DetailRow>

              <DetailRow label="Due date">
                <span style={{ fontWeight: 600 }}>{dueDate || "—"}</span>
              </DetailRow>

              <DetailRow label="Milestones">
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{milestoneCount}</span>
              </DetailRow>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 9 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Action items</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{actionItemCount}</span>
              </div>
            </div>
          </div>
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
        <GoalActionItems
          workspaceId={workspaceId}
          goalId={goalId}
          goal={goal}
          members={members}
          isAdmin={isAdmin}
        />
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
