"use client";

import { useState } from "react";
import { useGoalStore } from "../../lib/stores/goalStore";

function MilestoneItem({ milestone, workspaceId, goalId, canEdit }) {
  const updateMilestone = useGoalStore((s) => s.updateMilestone);
  const deleteMilestone = useGoalStore((s) => s.deleteMilestone);
  const [progress, setProgress] = useState(milestone.progress);
  const [saving, setSaving] = useState(false);

  async function handleProgressChange(val) {
    const num = parseInt(val);
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
    <div className="flex items-center gap-3 rounded-md border border-[color:var(--border)] px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{milestone.title}</p>
        {milestone.dueDate && (
          <p className="text-xs text-[color:var(--muted)]">
            Due {new Date(milestone.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs w-8 text-right">{progress}%</span>
        {canEdit && (
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            onMouseUp={(e) => handleProgressChange(e.target.value)}
            onTouchEnd={(e) => handleProgressChange(e.target.value)}
            className="w-24 accent-[color:var(--accent)]"
            aria-label={`Progress for ${milestone.title}`}
            disabled={saving}
          />
        )}
        {canEdit && (
          <button
            onClick={handleDelete}
            className="text-xs text-[color:var(--muted)] hover:text-red-500"
            aria-label="Delete milestone"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function MilestoneList({ milestones, workspaceId, goalId, canEdit }) {
  const createMilestone = useGoalStore((s) => s.createMilestone);
  const applyGoalUpdated = useGoalStore((s) => s.applyGoalUpdated);
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
    } catch {
      // keep form open on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {milestones?.length === 0 && !adding && (
        <p className="text-sm text-[color:var(--muted)]">No milestones yet.</p>
      )}
      {milestones?.map((m) => (
        <MilestoneItem
          key={m.id}
          milestone={m}
          workspaceId={workspaceId}
          goalId={goalId}
          canEdit={canEdit}
        />
      ))}

      {canEdit && (
        adding ? (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              autoFocus
              className="flex-1 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1.5 text-sm"
              placeholder="Milestone title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit" disabled={saving} className="rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-sm text-white disabled:opacity-50">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm">
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="self-start text-sm text-[color:var(--accent)] hover:underline"
          >
            + Add milestone
          </button>
        )
      )}
    </div>
  );
}
