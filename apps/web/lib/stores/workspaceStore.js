"use client";

import { create } from "zustand";
import { apiClient } from "../apiClient";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  currentWorkspace: null,
  members: [],
  loading: false,
  error: null,

  async fetchWorkspaces() {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.get("/workspaces");
      set({ workspaces: data.data, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.error?.message || "Failed to load workspaces",
        loading: false,
      });
    }
  },

  async createWorkspace(payload) {
    const { data } = await apiClient.post("/workspaces", payload);
    const ws = data.data.workspace;
    set({ workspaces: [...get().workspaces, ws] });
    return ws;
  },

  async loadWorkspace(workspaceId) {
    set({ loading: true, error: null, currentWorkspaceId: workspaceId });
    try {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}`);
      const ws = data.data.workspace;
      set({
        currentWorkspace: ws,
        members: ws.members,
        loading: false,
      });
      return ws;
    } catch (err) {
      const message = err?.response?.data?.error?.message || "Failed to load workspace";
      set({ error: message, loading: false, currentWorkspace: null, members: [] });
      throw err;
    }
  },

  async updateWorkspace(workspaceId, patch) {
    const { data } = await apiClient.patch(`/workspaces/${workspaceId}`, patch);
    const updated = data.data.workspace;
    set((state) => ({
      currentWorkspace: state.currentWorkspace
        ? { ...state.currentWorkspace, ...updated }
        : state.currentWorkspace,
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, ...updated } : w,
      ),
    }));
    return updated;
  },

  async inviteMember(workspaceId, { email, role = "MEMBER" }) {
    const { data } = await apiClient.post(`/workspaces/${workspaceId}/invite`, {
      email,
      role,
    });
    const member = data.data.member;
    if (member) {
      set((state) => ({
        members: state.members.find((m) => m.userId === member.userId)
          ? state.members
          : [...state.members, member],
      }));
    }
    return data.data;
  },

  async updateMemberRole(workspaceId, userId, role) {
    const { data } = await apiClient.patch(
      `/workspaces/${workspaceId}/members/${userId}`,
      { role },
    );
    const member = data.data.member;
    set((state) => ({
      members: state.members.map((m) => (m.userId === userId ? member : m)),
    }));
    return member;
  },

  async removeMember(workspaceId, userId) {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    }));
  },

  applyMemberAdded(member) {
    set((state) => ({
      members: state.members.find((m) => m.userId === member.userId)
        ? state.members
        : [...state.members, member],
    }));
  },

  applyMemberRemoved(userId) {
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    }));
  },

  applyWorkspaceUpdated(updated) {
    set((state) => ({
      currentWorkspace: state.currentWorkspace
        ? { ...state.currentWorkspace, ...updated }
        : state.currentWorkspace,
      workspaces: state.workspaces.map((w) =>
        w.id === updated.id ? { ...w, ...updated } : w,
      ),
    }));
  },

  reset() {
    set({
      currentWorkspaceId: null,
      currentWorkspace: null,
      members: [],
      error: null,
    });
  },
}));
