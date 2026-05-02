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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {EMOJI_SET.filter((e) => counts[e] > 0).map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 9px", borderRadius: 999, fontSize: 13, cursor: "pointer",
            border: userReactions.has(emoji)
              ? "1px solid color-mix(in srgb, var(--accent) 40%, transparent)"
              : "1px solid var(--border)",
            background: userReactions.has(emoji)
              ? "color-mix(in srgb, var(--accent) 10%, transparent)"
              : "var(--input-bg)",
            color: userReactions.has(emoji) ? "var(--accent)" : "var(--text)",
            transition: "all 0.12s",
          }}
        >
          <span>{emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{counts[emoji]}</span>
        </button>
      ))}

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowPicker((p) => !p)}
          style={{
            width: 28, height: 28, borderRadius: 999,
            border: "1px solid var(--border)", background: "var(--input-bg)",
            fontSize: 14, color: "var(--muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.12s",
          }}
          title="Add reaction"
        >+</button>
        {showPicker && (
          <div style={{
            position: "absolute", bottom: 36, left: 0, zIndex: 20,
            display: "flex", gap: 4, padding: 8, borderRadius: 14,
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            {EMOJI_SET.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleToggle(emoji)}
                style={{ padding: 6, borderRadius: 8, fontSize: 18, cursor: "pointer", border: "none", background: "transparent" }}
                className="hover:bg-[color:var(--card-hover)]"
              >{emoji}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
