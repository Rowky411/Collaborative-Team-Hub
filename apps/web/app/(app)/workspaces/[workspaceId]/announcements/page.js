"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAnnouncementStore } from "../../../../../lib/stores/announcementStore";
import { useWorkspaceStore } from "../../../../../lib/stores/workspaceStore";
import { useAuthStore } from "../../../../../lib/stores/authStore";
import { AnnouncementCard } from "../../../../../components/announcements/AnnouncementCard";
import { CreateAnnouncementModal } from "../../../../../components/announcements/CreateAnnouncementModal";

export default function AnnouncementsPage() {
  const { workspaceId } = useParams();

  const announcements        = useAnnouncementStore((s) => s.announcements);
  const loading              = useAnnouncementStore((s) => s.loading);
  const fetchAnnouncements   = useAnnouncementStore((s) => s.fetchAnnouncements);
  const createAnnouncement   = useAnnouncementStore((s) => s.createAnnouncement);
  const updateAnnouncement   = useAnnouncementStore((s) => s.updateAnnouncement);
  const deleteAnnouncement   = useAnnouncementStore((s) => s.deleteAnnouncement);
  const fetchAnnouncement    = useAnnouncementStore((s) => s.fetchAnnouncement);
  const postComment          = useAnnouncementStore((s) => s.postComment);
  const reset                = useAnnouncementStore((s) => s.reset);

  const members          = useWorkspaceStore((s) => s.members);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const isAdmin          = currentWorkspace?.role === "ADMIN";

  const user = useAuthStore((s) => s.user);

  const [showCreate, setShowCreate]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  function showToast(msg, type = "error") {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetchAnnouncements(workspaceId);
    return () => reset();
  }, [workspaceId, fetchAnnouncements, reset]);

  // Lazily load comments for a card when it expands (card itself triggers this)
  async function handleExpandComments(announcementId) {
    const existing = announcements.find((a) => a.id === announcementId);
    if (!existing?.comments) {
      await fetchAnnouncement(workspaceId, announcementId);
    }
  }

  async function handleCreate(payload) {
    await createAnnouncement(workspaceId, payload);
  }

  async function handleEdit(payload) {
    try {
      await updateAnnouncement(workspaceId, editingItem.id, payload);
    } catch (err) {
      showToast(err?.response?.data?.error?.message || "Failed to update.");
      throw err;
    }
  }

  async function handlePin(announcement) {
    try {
      const wasPin = !announcement.isPinned;
      await updateAnnouncement(workspaceId, announcement.id, { isPinned: wasPin });
      if (wasPin) showToast("Announcement pinned.", "success");
    } catch (err) {
      showToast("Failed to update pin.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(workspaceId, id);
    } catch (err) {
      showToast("Failed to delete announcement.");
    }
  }

  async function handlePostComment(announcementId, payload) {
    try {
      const existing = announcements.find((a) => a.id === announcementId);
      if (!existing?.comments) {
        await fetchAnnouncement(workspaceId, announcementId);
      }
      await postComment(workspaceId, announcementId, payload);
    } catch (err) {
      showToast(err?.response?.data?.error?.message || "Failed to post comment.");
      throw err;
    }
  }

  const pinned    = announcements.filter((a) => a.isPinned);
  const unpinned  = announcements.filter((a) => !a.isPinned);

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[color:var(--accent)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            + New Announcement
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-[color:var(--muted)]">Loading…</p>}

      {!loading && announcements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] py-16 text-center">
          <p className="text-sm text-[color:var(--muted)]">
            No announcements yet.{isAdmin ? " Publish the first one!" : ""}
          </p>
        </div>
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section className="flex flex-col gap-4">
          {pinned.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              workspaceId={workspaceId}
              members={members}
              onPin={handlePin}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              onPostComment={handlePostComment}
              onExpand={handleExpandComments}
            />
          ))}
        </section>
      )}

      {/* Divider if both sections exist */}
      {pinned.length > 0 && unpinned.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--border)]" />
          <span className="text-xs text-[color:var(--muted)]">Earlier</span>
          <div className="h-px flex-1 bg-[color:var(--border)]" />
        </div>
      )}

      {/* Regular feed */}
      {unpinned.length > 0 && (
        <section className="flex flex-col gap-4">
          {unpinned.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              workspaceId={workspaceId}
              members={members}
              onPin={handlePin}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              onPostComment={handlePostComment}
              onExpand={handleExpandComments}
            />
          ))}
        </section>
      )}

      {/* Create modal */}
      <CreateAnnouncementModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      <CreateAnnouncementModal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEdit}
        initialAnnouncement={editingItem}
      />
    </div>
  );
}
