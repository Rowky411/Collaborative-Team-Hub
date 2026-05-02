"use client";

import { useState } from "react";
import { useGoalStore } from "../../lib/stores/goalStore";

export function GoalUpdateFeed({ updates, workspaceId, goalId }) {
  const postUpdate = useGoalStore((s) => s.postUpdate);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await postUpdate(workspaceId, goalId, body.trim());
      setBody("");
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Failed to post update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          rows={3}
          placeholder="Post a progress update…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving || !body.trim()}
          className="self-end rounded-md bg-[color:var(--accent)] px-4 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Posting…" : "Post update"}
        </button>
      </form>

      {updates?.length === 0 && (
        <p className="text-sm text-[color:var(--muted)]">No updates yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {updates?.map((u) => (
          <div key={u.id} className="flex gap-3">
            {u.author?.avatarUrl ? (
              <img src={u.author.avatarUrl} alt={u.author.name} className="h-7 w-7 shrink-0 rounded-full" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/20 text-xs font-medium text-[color:var(--accent)]">
                {u.author?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{u.author?.name}</span>
                <span className="text-xs text-[color:var(--muted)]">
                  {new Date(u.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-0.5 text-sm whitespace-pre-wrap">{u.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
