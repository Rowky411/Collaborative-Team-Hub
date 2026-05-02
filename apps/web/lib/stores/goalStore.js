"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../apiClient";
import { useOfflineQueueStore } from "./offlineQueueStore";

const enqueue = (op) => useOfflineQueueStore.getState().enqueue(op);
const isOffline = (err) => !err.response;

export const useGoalStore = create(
  persist(
    (set, get) => ({
      goals: [],
      currentGoal: null,
      loading: false,
      error: null,

      async fetchGoals(workspaceId, filters = {}) {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.status) params.set("status", filters.status);
          if (filters.ownerId) params.set("ownerId", filters.ownerId);
          const { data } = await apiClient.get(`/workspaces/${workspaceId}/goals?${params}`);
          set({ goals: data.data, loading: false });
        } catch (err) {
          set({ error: err?.response?.data?.error?.message || "Failed to load goals", loading: false });
        }
      },

      async createGoal(workspaceId, payload) {
        const { data } = await apiClient.post(`/workspaces/${workspaceId}/goals`, payload);
        const goal = data.data.goal;
        set((s) => ({
          goals: s.goals.find((g) => g.id === goal.id) ? s.goals : [goal, ...s.goals],
        }));
        return goal;
      },

      async updateGoal(workspaceId, goalId, patch) {
        const prev = get().goals.find((g) => g.id === goalId);
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)),
          currentGoal: s.currentGoal?.id === goalId ? { ...s.currentGoal, ...patch } : s.currentGoal,
        }));
        try {
          const { data } = await apiClient.patch(`/workspaces/${workspaceId}/goals/${goalId}`, patch);
          const updated = data.data.goal;
          set((s) => ({
            goals: s.goals.map((g) => (g.id === goalId ? updated : g)),
            currentGoal: s.currentGoal?.id === goalId ? { ...s.currentGoal, ...updated } : s.currentGoal,
          }));
          return updated;
        } catch (err) {
          if (isOffline(err)) {
            // Keep optimistic state — queue for later sync
            enqueue({ type: "goal.update", workspaceId, goalId, patch });
            return;
          }
          if (prev) {
            set((s) => ({
              goals: s.goals.map((g) => (g.id === goalId ? prev : g)),
              currentGoal: s.currentGoal?.id === goalId ? prev : s.currentGoal,
            }));
          }
          throw err;
        }
      },

      async deleteGoal(workspaceId, goalId) {
        const prev = get().goals.find((g) => g.id === goalId);
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== goalId),
          currentGoal: s.currentGoal?.id === goalId ? null : s.currentGoal,
        }));
        try {
          await apiClient.delete(`/workspaces/${workspaceId}/goals/${goalId}`);
        } catch (err) {
          if (isOffline(err)) {
            enqueue({ type: "goal.delete", workspaceId, goalId });
            return;
          }
          if (prev) set((s) => ({ goals: [prev, ...s.goals] }));
          throw err;
        }
      },

      async loadGoal(workspaceId, goalId) {
        set({ loading: true, error: null });
        try {
          const { data } = await apiClient.get(`/workspaces/${workspaceId}/goals/${goalId}`);
          set({ currentGoal: data.data.goal, loading: false });
          return data.data.goal;
        } catch (err) {
          set({ error: err?.response?.data?.error?.message || "Failed to load goal", loading: false });
          throw err;
        }
      },

      async createMilestone(workspaceId, goalId, payload) {
        const { data } = await apiClient.post(
          `/workspaces/${workspaceId}/goals/${goalId}/milestones`,
          payload
        );
        return data.data.milestone;
      },

      async updateMilestone(workspaceId, goalId, milestoneId, patch) {
        const prevGoal = get().currentGoal;
        if (prevGoal?.id === goalId) {
          set((s) => ({
            currentGoal: {
              ...s.currentGoal,
              milestones: s.currentGoal.milestones.map((m) =>
                m.id === milestoneId ? { ...m, ...patch } : m
              ),
            },
          }));
        }
        try {
          const { data } = await apiClient.patch(
            `/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`,
            patch
          );
          return data.data.milestone;
        } catch (err) {
          if (prevGoal?.id === goalId) set({ currentGoal: prevGoal });
          throw err;
        }
      },

      async deleteMilestone(workspaceId, goalId, milestoneId) {
        await apiClient.delete(
          `/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`
        );
        set((s) => ({
          currentGoal:
            s.currentGoal?.id === goalId
              ? { ...s.currentGoal, milestones: s.currentGoal.milestones.filter((m) => m.id !== milestoneId) }
              : s.currentGoal,
        }));
      },

      async postUpdate(workspaceId, goalId, body) {
        const { data } = await apiClient.post(
          `/workspaces/${workspaceId}/goals/${goalId}/updates`,
          { body }
        );
        const update = data.data.update;
        set((s) => ({
          currentGoal:
            s.currentGoal?.id === goalId
              ? { ...s.currentGoal, updates: [update, ...(s.currentGoal.updates || [])] }
              : s.currentGoal,
        }));
        return update;
      },

      async fetchUpdates(workspaceId, goalId) {
        const { data } = await apiClient.get(`/workspaces/${workspaceId}/goals/${goalId}/updates`);
        set((s) => ({
          currentGoal:
            s.currentGoal?.id === goalId
              ? { ...s.currentGoal, updates: data.data }
              : s.currentGoal,
        }));
        return data.data;
      },

      // ─── Socket handlers ──────────────────────────────────────────────────────

      applyGoalCreated(goal) {
        set((s) => ({
          goals: s.goals.find((g) => g.id === goal.id) ? s.goals : [goal, ...s.goals],
        }));
      },

      applyGoalUpdated(goal) {
        set((s) => ({
          goals: s.goals.map((g) => (g.id === goal.id ? { ...g, ...goal } : g)),
          currentGoal: s.currentGoal?.id === goal.id ? { ...s.currentGoal, ...goal } : s.currentGoal,
        }));
      },

      applyGoalDeleted(goalId) {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }));
      },

      applyUpdatePosted(update) {
        set((s) => ({
          currentGoal:
            s.currentGoal?.id === update.goalId
              ? { ...s.currentGoal, updates: [update, ...(s.currentGoal.updates || [])] }
              : s.currentGoal,
        }));
      },

      reset() {
        set({ goals: [], currentGoal: null, error: null });
      },
    }),
    {
      name: "collab-goals",
      partialize: (s) => ({ goals: s.goals }),
    }
  )
);
