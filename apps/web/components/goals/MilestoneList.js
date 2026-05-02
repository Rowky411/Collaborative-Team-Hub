"use client";

import { useState } from "react";
import { useGoalStore } from "../../lib/stores/goalStore";

// ─── Milestone progress bar row ──────────────────────────────────────────────

function MilestoneRow({ milestone, workspaceId, goalId, canEdit, accentColor }) {
  const updateMilestone = useGoalStore((s) => s.updateMilestone);
  const deleteMilestone = useGoalStore((s) => s.deleteMilestone);
  const [progress, setProgress] = useState(milestone.progress);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isComplete = progress === 100;
  const barColor = isComplete ? "#22c55e" : accentColor;

  async function commit(val) {
    const num = parseInt(val, 10);
    setProgress(num);
    setSaving(true);
    try {
      await updateMilestone(workspaceId, goalId, milestone.id, { progress: num });
    } catch {
      setProgress(milestone.progress);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete milestone "${milestone.title}"?`)) return;
    await deleteMilestone(workspaceId, goalId, milestone.id);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        transition: "border-color 0.15s",
        borderColor: hovered ? `color-mix(in srgb, ${accentColor} 30%, transparent)` : "var(--border)",
      }}
    >
      {/* Status circle icon */}
      <div style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: isComplete ? "#22c55e" : "transparent",
        border: `2px solid ${isComplete ? "#22c55e" : "var(--border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, color: "#fff",
        transition: "all 0.2s",
      }}>
        {isComplete ? "✓" : ""}
      </div>

      {/* Title + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: "var(--text)",
          marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {milestone.title}
        </p>
        <div style={{ position: "relative" }}>
          {canEdit ? (
            <input
              type="range"
              min={0} max={100} step={5}
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value, 10))}
              onMouseUp={(e) => commit(e.target.value)}
              onTouchEnd={(e) => commit(e.target.value)}
              disabled={saving}
              style={{ width: "100%", accentColor: barColor, cursor: "pointer", height: 6 }}
              aria-label={`Progress for ${milestone.title}`}
            />
          ) : (
            /* Read-only progress bar */
            <div style={{ height: 6, borderRadius: 999, background: "color-mix(in srgb, var(--muted) 15%, transparent)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: barColor, borderRadius: 999,
                transition: "width 0.4s",
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Percentage */}
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: isComplete ? "#22c55e" : "var(--muted)",
        width: 38, textAlign: "right", flexShrink: 0,
      }}>
        {progress}%
      </span>

      {/* Delete */}
      {canEdit && hovered && (
        <button
          onClick={handleDelete}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 14, padding: "0 2px", lineHeight: 1,
          }}
          className="hover:text-red-500"
          aria-label="Delete milestone"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Add milestone inline form ───────────────────────────────────────────────

function AddMilestoneRow({ workspaceId, goalId }) {
  const createMilestone = useGoalStore((s) => s.createMilestone);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createMilestone(workspaceId, goalId, { title: title.trim(), progress: 0 });
      setTitle("");
      setAdding(false);
    } catch { /* keep form open */ }
    finally { setSaving(false); }
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "12px 16px",
          background: "transparent", border: "1px dashed var(--border)",
          borderRadius: 12, cursor: "pointer",
          fontSize: 13, color: "var(--muted)",
          transition: "all 0.15s",
        }}
        className="hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        + Add milestone
      </button>
    );
  }

  return (
    <form
      onSubmit={handleAdd}
      style={{
        display: "flex", gap: 8, alignItems: "center",
        padding: "10px 14px",
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 12,
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Milestone title…"
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          fontSize: 13, color: "var(--text)",
        }}
      />
      <button
        type="submit" disabled={saving || !title.trim()}
        style={{
          padding: "4px 12px", borderRadius: 8,
          background: "var(--accent, #7c5cfc)", color: "#fff",
          fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
          opacity: saving || !title.trim() ? 0.6 : 1,
        }}
      >
        Add
      </button>
      <button
        type="button" onClick={() => setAdding(false)}
        style={{
          padding: "4px 10px", borderRadius: 8,
          background: "transparent", border: "1px solid var(--border)",
          fontSize: 12, color: "var(--muted)", cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </form>
  );
}

// ─── Exported list ────────────────────────────────────────────────────────────

export function MilestoneList({ milestones, workspaceId, goalId, canEdit, accentColor = "#7c5cfc" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(!milestones || milestones.length === 0) && !canEdit && (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>No milestones yet.</p>
      )}
      {milestones?.map((m) => (
        <MilestoneRow
          key={m.id}
          milestone={m}
          workspaceId={workspaceId}
          goalId={goalId}
          canEdit={canEdit}
          accentColor={accentColor}
        />
      ))}
      {canEdit && (
        <AddMilestoneRow workspaceId={workspaceId} goalId={goalId} />
      )}
    </div>
  );
}
