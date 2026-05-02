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
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.avatarUrl} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  return (
    <span style={{
      display: "inline-flex", width: 32, height: 32, flexShrink: 0,
      alignItems: "center", justifyContent: "center",
      borderRadius: "50%", background: "var(--accent, #7c5cfc)",
      fontSize: 12, fontWeight: 700, color: "#fff",
    }}>
      {user.name?.[0]?.toUpperCase()}
    </span>
  );
}

export function AnnouncementCard({
  announcement, isAdmin, currentUserId, workspaceId,
  members, onPin, onEdit, onDelete, onPostComment, onExpand,
}) {
  const [expanded, setExpanded] = useState(false);
  const commentCount = announcement._count?.comments ?? 0;
  const accentColor = "var(--accent, #7c5cfc)";

  return (
    <article
      style={{
        borderRadius: 16,
        background: "var(--card)",
        border: announcement.isPinned
          ? `1px solid color-mix(in srgb, var(--accent) 35%, transparent)`
          : "1px solid var(--border)",
        outline: announcement.isPinned
          ? `1px solid color-mix(in srgb, var(--accent) 12%, transparent)`
          : "none",
        overflow: "hidden",
      }}
    >
      {/* Pin banner */}
      {announcement.isPinned && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 18px",
          background: "color-mix(in srgb, var(--accent) 8%, transparent)",
          fontSize: 11, fontWeight: 600, color: accentColor,
        }}>
          📌 Pinned announcement
        </div>
      )}

      <div style={{ padding: "18px 20px" }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar user={announcement.author} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{announcement.author?.name}</p>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>{timeAgo(announcement.createdAt)}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onPin?.(announcement)}
                title={announcement.isPinned ? "Unpin" : "Pin"}
                style={{
                  width: 28, height: 28, borderRadius: 7, border: "none",
                  background: announcement.isPinned ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                  color: announcement.isPinned ? accentColor : "var(--muted)",
                  cursor: "pointer", fontSize: 13,
                }}
                className="hover:bg-[color:var(--card-hover)]"
              >📌</button>
              <button
                onClick={() => onEdit?.(announcement)}
                style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}
                className="hover:bg-[color:var(--card-hover)]"
              >✏️</button>
              <button
                onClick={() => onDelete?.(announcement.id)}
                style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}
                className="hover:bg-[color:var(--card-hover)]"
              >🗑</button>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 style={{ marginBottom: 8, fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.015em" }}>
          {announcement.title}
        </h2>

        {/* Body */}
        {announcement.body && (
          <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-sub)" }}>
            <RichTextEditor content={announcement.body} editable={false} />
          </div>
        )}

        {/* Reactions */}
        <div style={{ marginBottom: 12 }}>
          <ReactionBar
            workspaceId={workspaceId}
            announcementId={announcement.id}
            reactions={announcement.reactions}
            reactionCounts={announcement._reactionCounts}
            currentUserId={currentUserId}
          />
        </div>

        {/* Comments toggle */}
        <button
          onClick={() => {
            const next = !expanded;
            setExpanded(next);
            if (next) onExpand?.(announcement.id);
          }}
          style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", transition: "color 0.12s" }}
          className="hover:text-[color:var(--accent)]"
        >
          💬 {commentCount} comment{commentCount !== 1 ? "s" : ""} {expanded ? "▲" : "▼"}
        </button>

        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
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
