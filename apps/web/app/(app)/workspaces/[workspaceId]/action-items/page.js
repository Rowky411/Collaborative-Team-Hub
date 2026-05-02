"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useActionItemStore } from "../../../../../lib/stores/actionItemStore";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { useGoalStore } from "../../../../../lib/stores/goalStore";
import { KanbanBoard } from "../../../../../components/action-items/KanbanBoard";
import { ActionItemList } from "../../../../../components/action-items/ActionItemList";
import { CreateActionItemModal } from "../../../../../components/action-items/CreateActionItemModal";

const PRIORITY_FILTERS = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function ActionItemsPage() {
  const { workspaceId } = useParams();

  // Store hooks
  const items        = useActionItemStore((s) => s.items);
  const view         = useActionItemStore((s) => s.view);
  const filters      = useActionItemStore((s) => s.filters);
  const loading      = useActionItemStore((s) => s.loading);
  const fetchItems   = useActionItemStore((s) => s.fetchItems);
  const createItem   = useActionItemStore((s) => s.createItem);
  const updateItem   = useActionItemStore((s) => s.updateItem);
  const reorderItems = useActionItemStore((s) => s.reorderItems);
  const setView      = useActionItemStore((s) => s.setView);
  const setFilter    = useActionItemStore((s) => s.setFilter);
  const reset        = useActionItemStore((s) => s.reset);

  const members          = useWorkspaceStore((s) => s.members);
  const goals            = useGoalStore((s) => s.goals);
  const fetchGoals       = useGoalStore((s) => s.fetchGoals);

  // Modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function showToast(msg, type = "error") {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // Initial load
  useEffect(() => {
    fetchItems(workspaceId);
    fetchGoals(workspaceId);
    return () => reset();
  }, [workspaceId, fetchItems, fetchGoals, reset]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchItems(workspaceId);
  }, [filters, workspaceId, fetchItems]);

  // ─── Drag end handler (Step 4.5 + 4.6) ──────────────────────────────────────
  const handleDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a column or in same place — do nothing
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId;

      // Build the updated item list for the destination column to recalculate positions
      const destinationItems = items
        .filter((i) => i.status === newStatus && i.id !== draggableId)
        .sort((a, b) => a.position - b.position);

      destinationItems.splice(destination.index, 0, { id: draggableId });

      const updates = destinationItems.map((i, idx) => ({
        id: i.id,
        status: newStatus,
        position: idx,
      }));

      // Take a snapshot for rollback BEFORE applying optimistic update
      const snapshot = [...items];

      try {
        await reorderItems(workspaceId, updates, snapshot);
      } catch (_err) {
        showToast("Reorder failed — changes rolled back.");
      }
    },
    [items, workspaceId, reorderItems],
  );

  // ─── Create ──────────────────────────────────────────────────────────────────
  async function handleCreate(payload) {
    await createItem(workspaceId, payload);
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────
  async function handleEdit(payload) {
    try {
      await updateItem(workspaceId, editingItem.id, payload);
    } catch (err) {
      showToast(err?.response?.data?.error?.message || "Failed to update item.");
      throw err; // re-throw so modal keeps open
    }
  }

  function openEdit(item) {
    setEditingItem(item);
  }

  // ─── Scope toggle ────────────────────────────────────────────────────────────
  function toggleScope(isAll) {
    setFilter("assigneeId", isAll ? "all" : null);
  }

  const isAll = filters.assigneeId === "all";

  const selectCls =
    "rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40";

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Action Items</h1>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-[color:var(--border)] overflow-hidden text-sm">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 transition ${
                view === "kanban"
                  ? "bg-[color:var(--accent)] text-white font-medium"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 transition ${
                view === "list"
                  ? "bg-[color:var(--accent)] text-white font-medium"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[color:var(--accent)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            + New Item
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Scope toggle */}
        <div className="flex rounded-lg border border-[color:var(--border)] overflow-hidden text-sm">
          <button
            onClick={() => toggleScope(false)}
            className={`px-3 py-1.5 transition ${
              !isAll
                ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-medium"
                : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
            }`}
          >
            My Items
          </button>
          <button
            onClick={() => toggleScope(true)}
            className={`px-3 py-1.5 transition ${
              isAll
                ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-medium"
                : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
            }`}
          >
            All Items
          </button>
        </div>

        {/* Priority filter */}
        <select
          className={selectCls}
          value={filters.priority ?? ""}
          onChange={(e) => setFilter("priority", e.target.value || null)}
        >
          {PRIORITY_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Goal filter */}
        {goals.length > 0 && (
          <select
            className={selectCls}
            value={filters.goalId ?? ""}
            onChange={(e) => setFilter("goalId", e.target.value || null)}
          >
            <option value="">All goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        )}

        {/* Item count */}
        <span className="ml-auto text-xs text-[color:var(--muted)]">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-[color:var(--muted)]">Loading…</p>
      )}

      {/* Board / List */}
      {!loading && (
        <>
          {view === "kanban" && (
            <KanbanBoard
              items={items}
              onDragEnd={handleDragEnd}
              onCardClick={openEdit}
            />
          )}
          {view === "list" && (
            <ActionItemList items={items} onRowClick={openEdit} />
          )}
        </>
      )}

      {/* Create modal */}
      <CreateActionItemModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        members={members}
        goals={goals}
      />

      {/* Edit modal */}
      <CreateActionItemModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
        members={members}
        goals={goals}
        initialItem={editingItem}
      />
    </div>
  );
}
