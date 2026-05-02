"use client";

import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { RichTextEditor } from "./RichTextEditor";

const EMPTY = { title: "", body: "", isPinned: false };

export function CreateAnnouncementModal({ open, onClose, onSubmit, initialAnnouncement = null }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialAnnouncement) {
      setForm({
        title: initialAnnouncement.title || "",
        body: initialAnnouncement.body || "",
        isPinned: initialAnnouncement.isPinned ?? false,
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [initialAnnouncement, open]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.body || form.body === '{"type":"doc","content":[]}') {
      setError("Body cannot be empty."); return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit({ title: form.title.trim(), body: form.body, isPinned: form.isPinned });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Failed to save announcement.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40 transition";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialAnnouncement ? "Edit Announcement" : "New Announcement"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[color:var(--muted)]">Title *</label>
          <input
            className={inputCls}
            placeholder="Announcement title…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[color:var(--muted)]">Body *</label>
          <RichTextEditor
            key={open ? "open" : "closed"}
            content={form.body || null}
            onChange={(json) => set("body", json)}
            placeholder="Write your announcement…"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPinned}
            onChange={(e) => set("isPinned", e.target.checked)}
            className="h-4 w-4 rounded accent-[color:var(--accent)]"
          />
          <span className="text-[color:var(--foreground)]">Pin this announcement</span>
          <span className="text-xs text-[color:var(--muted)]">(replaces any current pin)</span>
        </label>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[color:var(--accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition"
          >
            {busy ? "Saving…" : initialAnnouncement ? "Save Changes" : "Publish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
