"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { ReactionBar } from "./ReactionBar";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ user }) {
  if (!user) return null;
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">
      {user.name?.[0]?.toUpperCase()}
    </span>
  );
}

export function AnnouncementCard({
  announcement,
  isAdmin,
  currentUserId,
  workspaceId,
  members,
  onPin,
  onEdit,
  onDelete,
  onPostComment,
  onExpand,
}) {
  const [expanded, setExpanded] = useState(false);

  const commentCount = announcement._count?.comments ?? 0;

  return (
    <article
      className={`rounded-2xl border bg-[color:var(--background)] shadow-sm transition-shadow hover:shadow-md
        ${announcement.isPinned ? "border-[color:var(--accent)]/50 ring-1 ring-[color:var(--accent)]/20" : "border-[color:var(--border)]"}
      `}
    >
      {/* Pin banner */}
      {announcement.isPinned && (
        <div className="flex items-center gap-1.5 rounded-t-2xl bg-[color:var(--accent)]/10 px-4 py-1.5 text-xs font-semibold text-[color:var(--accent)]">
          📌 Pinned announcement
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar user={announcement.author} />
            <div>
              <p className="text-sm font-semibold">{announcement.author?.name}</p>
              <p className="text-xs text-[color:var(--muted)]">{timeAgo(announcement.createdAt)}</p>
            </div>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onPin?.(announcement)}
                title={announcement.isPinned ? "Unpin" : "Pin"}
                className={`rounded-lg p-1.5 text-sm transition
                  ${announcement.isPinned
                    ? "text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--border)]/30"
                  }`}
              >
                📌
              </button>
              <button
                onClick={() => onEdit?.(announcement)}
                className="rounded-lg p-1.5 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete?.(announcement.id)}
                className="rounded-lg p-1.5 text-sm text-[color:var(--muted)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition"
              >
                🗑
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="mb-2 text-base font-semibold text-[color:var(--foreground)]">
          {announcement.title}
        </h2>

        {/* Body (Tiptap read-only) */}
        {announcement.body && (
          <div className="mb-3 text-sm text-[color:var(--foreground)]">
            <RichTextEditor content={announcement.body} editable={false} />
          </div>
        )}

        {/* Reactions */}
        <div className="mb-3">
          <ReactionBar
            workspaceId={workspaceId}
            announcementId={announcement.id}
            reactions={announcement.reactions}
            reactionCounts={announcement._reactionCounts}
            currentUserId={currentUserId}
          />
        </div>

        {/* Expand/collapse comments */}
        <button
          onClick={() => {
            const next = !expanded;
            setExpanded(next);
            if (next) onExpand?.(announcement.id);
          }}
          className="text-xs font-medium text-[color:var(--muted)] hover:text-[color:var(--accent)] transition"
        >
          💬 {commentCount} comment{commentCount !== 1 ? "s" : ""} {expanded ? "▲" : "▼"}
        </button>

        {expanded && (
          <div className="mt-4 flex flex-col gap-4 border-t border-[color:var(--border)] pt-4">
            <CommentList
              comments={announcement.comments}
              workspaceId={workspaceId}
              announcementId={announcement.id}
              currentUserId={currentUserId}
            />
            <CommentInput
              members={members}
              onSubmit={(payload) => onPostComment?.(announcement.id, payload)}
            />
          </div>
        )}
      </div>
    </article>
  );
}
