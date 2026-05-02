"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { ActionItemList } from "../action-items/ActionItemList";
import { CreateActionItemModal } from "../action-items/CreateActionItemModal";

export function GoalActionItems({ workspaceId, goalId, goal, members, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/workspaces/${workspaceId}/action-items?goalId=${goalId}&assigneeId=all&limit=100`
      );
      setItems(data.data);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, goalId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleCreate(payload) {
    const { data } = await apiClient.post(
      `/workspaces/${workspaceId}/action-items`,
      { ...payload, goalId }
    );
    const item = data.data.actionItem;
    setItems((prev) => prev.find((i) => i.id === item.id) ? prev : [...prev, item]);
  }

  async function handleEdit(payload) {
    const { data } = await apiClient.patch(
      `/workspaces/${workspaceId}/action-items/${editingItem.id}`,
      payload
    );
    const updated = data.data.actionItem;
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  }

  async function handleDelete(itemId) {
    if (!confirm("Delete this action item?")) return;
    await apiClient.delete(`/workspaces/${workspaceId}/action-items/${itemId}`);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  const goals = goal ? [{ id: goal.id, title: goal.title }] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          {items.length} Action Item{items.length !== 1 ? "s" : ""}
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition"
        >
          + Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      ) : (
        <ActionItemList items={items} onRowClick={(item) => setEditingItem(item)} />
      )}

      <CreateActionItemModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        members={members}
        goals={goals}
        defaultGoalId={goalId}
      />

      <CreateActionItemModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
        onDelete={isAdmin ? handleDelete : undefined}
        members={members}
        goals={goals}
        initialItem={editingItem}
      />
    </div>
  );
}
