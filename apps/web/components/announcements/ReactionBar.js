"use client";

import { useState } from "react";
import { useAnnouncementStore, EMOJI_SET } from "../../lib/stores/announcementStore";

function groupReactions(reactions) {
  if (!reactions) return {};
  return reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
}

export function ReactionBar({ workspaceId, announcementId, reactions = [], reactionCounts, currentUserId }) {
  const toggleReaction = useAnnouncementStore((s) => s.toggleReaction);
  const [localCounts, setLocalCounts] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // Use server-pushed counts if available, else compute from reactions array
  const counts = localCounts ?? reactionCounts ?? groupReactions(reactions);

  const userReactions = new Set(
    reactions.filter((r) => r.userId === currentUserId).map((r) => r.emoji)
  );

  async function handleToggle(emoji) {
    setShowPicker(false);
    try {
      const result = await toggleReaction(workspaceId, announcementId, emoji);
      setLocalCounts(result.counts);
    } catch (_err) { /* silent */ }
  }

  const hasAny = Object.values(counts).some((c) => c > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Existing reactions */}
      {EMOJI_SET.filter((e) => counts[e] > 0).map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition
            ${userReactions.has(emoji)
              ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
              : "border-[color:var(--border)] bg-[color:var(--background)] hover:border-[color:var(--accent)]/40"
            }`}
        >
          <span>{emoji}</span>
          <span className="text-xs font-medium">{counts[emoji]}</span>
        </button>
      ))}

      {/* Add reaction picker */}
      <div className="relative">
        <button
          onClick={() => setShowPicker((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--border)] text-sm text-[color:var(--muted)] hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)] transition"
          title="Add reaction"
        >
          +
        </button>
        {showPicker && (
          <div className="absolute bottom-9 left-0 z-20 flex gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-2 shadow-xl">
            {EMOJI_SET.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleToggle(emoji)}
                className="rounded-lg p-1.5 text-lg hover:bg-[color:var(--border)]/40 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
