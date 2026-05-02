"use client";

import { EMOJI_SET } from "../../lib/stores/announcementStore";
import { useAnnouncementStore } from "../../lib/stores/announcementStore";

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
      <img src={user.avatarUrl} alt={user.name}
        className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shrink-0" />
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
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
          className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-xs transition
            ${userReacted.has(emoji)
              ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
              : "border-[color:var(--border)] hover:border-[color:var(--accent)]/40"
            }`}
        >
          {emoji} <span className="font-medium">{counts[emoji]}</span>
        </button>
      ))}
    </div>
  );
}

export function CommentList({ comments = [], workspaceId, announcementId, currentUserId }) {
  if (comments.length === 0) {
    return <p className="text-sm text-[color:var(--muted)]">No comments yet. Be the first!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar user={comment.author} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">{comment.author?.name}</span>
              <span className="text-xs text-[color:var(--muted)]">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="mt-0.5 text-sm text-[color:var(--foreground)] whitespace-pre-wrap">{comment.body}</p>
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
