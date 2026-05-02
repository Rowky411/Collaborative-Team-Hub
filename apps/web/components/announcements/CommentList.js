"use client";

import { EMOJI_SET, useAnnouncementStore } from "../../lib/stores/announcementStore";

function groupReactions(reactions) {
  return (reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Avatar({ user }) {
  if (!user) return null;
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.avatarUrl} alt={user.name} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  return (
    <span style={{
      display: "inline-flex", width: 26, height: 26, flexShrink: 0,
      alignItems: "center", justifyContent: "center",
      borderRadius: "50%", background: "var(--accent, #7c5cfc)",
      fontSize: 11, fontWeight: 700, color: "#fff",
    }}>
      {user.name?.[0]?.toUpperCase()}
    </span>
  );
}

function CommentReaction({ workspaceId, announcementId, commentId, reactions, currentUserId }) {
  const toggleCommentReaction = useAnnouncementStore((s) => s.toggleCommentReaction);
  const counts = groupReactions(reactions);
  const userReacted = new Set(
    (reactions || []).filter((r) => r.userId === currentUserId).map((r) => r.emoji)
  );

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {EMOJI_SET.filter((e) => counts[e] > 0).map((emoji) => (
        <button
          key={emoji}
          onClick={() => toggleCommentReaction(workspaceId, announcementId, commentId, emoji)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "1px 7px", borderRadius: 999, fontSize: 11, cursor: "pointer",
            border: userReacted.has(emoji)
              ? "1px solid color-mix(in srgb, var(--accent) 40%, transparent)"
              : "1px solid var(--border)",
            background: userReacted.has(emoji)
              ? "color-mix(in srgb, var(--accent) 8%, transparent)"
              : "transparent",
            color: userReacted.has(emoji) ? "var(--accent)" : "var(--text)",
            transition: "all 0.12s",
          }}
        >
          {emoji} <span style={{ fontWeight: 600 }}>{counts[emoji]}</span>
        </button>
      ))}
    </div>
  );
}

export function CommentList({ comments = [], workspaceId, announcementId, currentUserId }) {
  if (comments.length === 0) {
    return <p style={{ fontSize: 12, color: "var(--muted)" }}>No comments yet. Be the first!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2.5">
          <Avatar user={comment.author} />
          <div style={{ flex: 1 }}>
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{comment.author?.name}</span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>{timeAgo(comment.createdAt)}</span>
            </div>
            <p style={{ marginTop: 2, fontSize: 13, color: "var(--text-sub)", whiteSpace: "pre-wrap" }}>{comment.body}</p>
            <CommentReaction
              workspaceId={workspaceId}
              announcementId={announcementId}
              commentId={comment.id}
              reactions={comment.reactions}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
