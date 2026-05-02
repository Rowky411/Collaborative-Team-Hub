"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, apiError } from "../apiClient";
import { useOfflineQueueStore } from "./offlineQueueStore";

const enqueue = (op) => useOfflineQueueStore.getState().enqueue(op);
const isOffline = (err) => !err.response;

export const useActionItemStore = create(
  persist(
    (set, get) => ({
      items: [],
      view: "kanban",
      filters: {
        assigneeId: null,
        priority: null,
        goalId: null,
        status: null,
      },
      loading: false,
      error: null,

      // ─── Fetch ─────────────────────────────────────────────────────────────────

      async fetchItems(workspaceId) {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const params = new URLSearchParams();
          if (filters.assigneeId === "all") params.set("assigneeId", "all");
          if (filters.status) params.set("status", filters.status);
          if (filters.priority) params.set("priority", filters.priority);
          if (filters.goalId) params.set("goalId", filters.goalId);
          params.set("limit", "100");
          const { data } = await apiClient.get(`/workspaces/${workspaceId}/action-items?${params}`);
          set({ items: data.data, loading: false });
        } catch (err) {
          set({ error: apiError(err), loading: false });
        }
      },

      // ─── Create ────────────────────────────────────────────────────────────────

      async createItem(workspaceId, payload) {
        const { data } = await apiClient.post(`/workspaces/${workspaceId}/action-items`, payload);
        const item = data.data.actionItem;
        set((s) => ({
          items: s.items.find((i) => i.id === item.id) ? s.items : [...s.items, item],
        }));
        return item;
      },

      // ─── Update (optimistic + offline queue) ──────────────────────────────────

      async updateItem(workspaceId, itemId, patch) {
        const prev = get().items.find((i) => i.id === itemId);
        set((s) => ({
          items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
        }));
        try {
          const { data } = await apiClient.patch(
            `/workspaces/${workspaceId}/action-items/${itemId}`,
            patch
          );
          const updated = data.data.actionItem;
          set((s) => ({
            items: s.items.map((i) => (i.id === itemId ? updated : i)),
          }));
          return updated;
        } catch (err) {
          if (isOffline(err)) {
            enqueue({ type: "actionItem.update", workspaceId, itemId, patch });
            return;
          }
          if (prev) {
            set((s) => ({
              items: s.items.map((i) => (i.id === itemId ? prev : i)),
            }));
          }
          throw err;
        }
      },

      // ─── Delete (optimistic + offline queue) ──────────────────────────────────

      async deleteItem(workspaceId, itemId) {
        const prev = get().items.find((i) => i.id === itemId);
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
        try {
          await apiClient.delete(`/workspaces/${workspaceId}/action-items/${itemId}`);
        } catch (err) {
          if (isOffline(err)) {
            enqueue({ type: "actionItem.delete", workspaceId, itemId });
            return;
          }
          if (prev) set((s) => ({ items: [...s.items, prev] }));
          throw err;
        }
      },

      // ─── Reorder (optimistic + offline queue) ─────────────────────────────────

      async reorderItems(workspaceId, updates, snapshot) {
        set((s) => {
          const map = Object.fromEntries(updates.map((u) => [u.id, u]));
          return {
            items: s.items.map((i) =>
              map[i.id] ? { ...i, status: map[i.id].status, position: map[i.id].position } : i
            ),
          };
        });
        try {
          await apiClient.patch(`/workspaces/${workspaceId}/action-items/reorder`, { items: updates });
        } catch (err) {
          if (isOffline(err)) {
            enqueue({ type: "actionItem.reorder", workspaceId, updates });
            return;
          }
          set({ items: snapshot });
          throw err;
        }
      },

      // ─── UI state ──────────────────────────────────────────────────────────────

      setView(view) { set({ view }); },

      setFilter(key, value) {
        set((s) => ({ filters: { ...s.filters, [key]: value } }));
      },

      // ─── Socket handlers ───────────────────────────────────────────────────────

      applyItemCreated(item) {
        set((s) => ({
          items: s.items.find((i) => i.id === item.id) ? s.items : [...s.items, item],
        }));
      },

      applyStatusChanged({ id, status, position }) {
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, status, position } : i)),
        }));
      },

      applyItemUpdated(item) {
        set((s) => ({
          items: s.items.map((i) => (i.id === item.id ? { ...i, ...item } : i)),
        }));
      },

      applyItemDeleted(id) {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      reset() {
        set({ items: [], error: null, filters: { assigneeId: null, priority: null, goalId: null, status: null } });
      },
    }),
    {
      name: "collab-action-items",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
