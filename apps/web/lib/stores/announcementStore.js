"use client";

import { create } from "zustand";
import { apiClient, apiError } from "../apiClient";

const EMOJI_SET = ["👍", "❤️", "🎉", "😂", "😮", "😢"];

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  currentAnnouncement: null,
  loading: false,
  error: null,

  // ─── Fetch list ────────────────────────────────────────────────────────────
  async fetchAnnouncements(workspaceId) {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/announcements?limit=50`);
      set({ announcements: data.data, loading: false });
    } catch (err) {
      set({ error: apiError(err), loading: false });
    }
  },

  // ─── Fetch single (with comments) ─────────────────────────────────────────
  async fetchAnnouncement(workspaceId, announcementId) {
    try {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/announcements/${announcementId}`);
      const ann = data.data.announcement;
      set((s) => ({
        currentAnnouncement: ann,
        // Merge comments + reactions into the list item so the card gets them
        announcements: s.announcements.map((a) => (a.id === announcementId ? { ...a, ...ann } : a)),
      }));
      return ann;
    } catch (err) {
      set({ error: apiError(err) });
      throw err;
    }
  },

  // ─── Create ────────────────────────────────────────────────────────────────
  async createAnnouncement(workspaceId, payload) {
    const { data } = await apiClient.post(`/workspaces/${workspaceId}/announcements`, payload);
    const announcement = data.data.announcement;
    set((s) => ({
      announcements: s.announcements.find((a) => a.id === announcement.id)
        ? s.announcements
        : [announcement, ...s.announcements].sort((a, b) =>
            b.isPinned - a.isPinned || new Date(b.createdAt) - new Date(a.createdAt)
          ),
    }));
    return announcement;
  },

  // ─── Update / Pin ──────────────────────────────────────────────────────────
  async updateAnnouncement(workspaceId, announcementId, patch) {
    const { data } = await apiClient.patch(
      `/workspaces/${workspaceId}/announcements/${announcementId}`,
      patch
    );
    const updated = data.data.announcement;
    get()._applyUpdate(updated);
    return updated;
  },

  // ─── Delete ────────────────────────────────────────────────────────────────
  async deleteAnnouncement(workspaceId, announcementId) {
    await apiClient.delete(`/workspaces/${workspaceId}/announcements/${announcementId}`);
    set((s) => ({
      announcements: s.announcements.filter((a) => a.id !== announcementId),
      currentAnnouncement:
        s.currentAnnouncement?.id === announcementId ? null : s.currentAnnouncement,
    }));
  },

  // ─── React ─────────────────────────────────────────────────────────────────
  async toggleReaction(workspaceId, announcementId, emoji) {
    const { data } = await apiClient.post(
      `/workspaces/${workspaceId}/announcements/${announcementId}/reactions`,
      { emoji }
    );
    return data.data;
  },

  // ─── Comments ──────────────────────────────────────────────────────────────
  async postComment(workspaceId, announcementId, payload) {
    const { data } = await apiClient.post(
      `/workspaces/${workspaceId}/announcements/${announcementId}/comments`,
      payload
    );
    const comment = data.data.comment;
    // Optimistically append to list item + currentAnnouncement before socket fires
    set((s) => {
      const addComment = (a) => {
        if (a.id !== announcementId) return a;
        if ((a.comments || []).find((c) => c.id === comment.id)) return a;
        return {
          ...a,
          comments: [...(a.comments || []), comment],
          _count: { ...a._count, comments: (a._count?.comments || 0) + 1 },
        };
      };
      return {
        announcements: s.announcements.map(addComment),
        currentAnnouncement: s.currentAnnouncement?.id === announcementId
          ? addComment(s.currentAnnouncement)
          : s.currentAnnouncement,
      };
    });
    return comment;
  },

  async toggleCommentReaction(workspaceId, announcementId, commentId, emoji) {
    const { data } = await apiClient.post(
      `/workspaces/${workspaceId}/announcements/${announcementId}/comments/${commentId}/reactions`,
      { emoji }
    );
    return data.data;
  },

  // ─── Internal helpers ──────────────────────────────────────────────────────
  _applyUpdate(updated) {
    set((s) => {
      // If something became pinned, unpin all others in local state
      let list = s.announcements.map((a) => {
        if (a.id === updated.id) return { ...a, ...updated };
        if (updated.isPinned) return { ...a, isPinned: false };
        return a;
      });
      list = list.sort((a, b) =>
        b.isPinned - a.isPinned || new Date(b.createdAt) - new Date(a.createdAt)
      );
      return {
        announcements: list,
        currentAnnouncement:
          s.currentAnnouncement?.id === updated.id
            ? { ...s.currentAnnouncement, ...updated }
            : s.currentAnnouncement,
      };
    });
  },

  // ─── Socket handlers ───────────────────────────────────────────────────────
  applyCreated(announcement) {
    set((s) => {
      if (s.announcements.find((a) => a.id === announcement.id)) return {};
      const list = [announcement, ...s.announcements].sort(
        (a, b) => b.isPinned - a.isPinned || new Date(b.createdAt) - new Date(a.createdAt)
      );
      return { announcements: list };
    });
  },

  applyUpdated(announcement) {
    get()._applyUpdate(announcement);
  },

  applyDeleted(id) {
    set((s) => ({
      announcements: s.announcements.filter((a) => a.id !== id),
      currentAnnouncement: s.currentAnnouncement?.id === id ? null : s.currentAnnouncement,
    }));
  },

  applyReactionUpdated({ announcementId, counts, reactions }) {
    set((s) => {
      const patch = (a) => {
        if (a.id !== announcementId) return a;
        return { ...a, _reactionCounts: counts, ...(reactions && { reactions }) };
      };
      return {
        announcements: s.announcements.map(patch),
        currentAnnouncement: s.currentAnnouncement?.id === announcementId
          ? patch(s.currentAnnouncement)
          : s.currentAnnouncement,
      };
    });
  },

  applyCommentAdded(comment) {
    set((s) => {
      const addComment = (a) => {
        if (a.id !== comment.announcementId) return a;
        if ((a.comments || []).find((c) => c.id === comment.id)) return a;
        return {
          ...a,
          comments: [...(a.comments || []), comment],
          _count: { ...a._count, comments: (a._count?.comments || 0) + 1 },
        };
      };
      return {
        announcements: s.announcements.map(addComment),
        currentAnnouncement: s.currentAnnouncement
          ? addComment(s.currentAnnouncement)
          : null,
      };
    });
  },

  reset() {
    set({ announcements: [], currentAnnouncement: null, error: null });
  },
}));

export { EMOJI_SET };
