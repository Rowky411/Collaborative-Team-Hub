"use client";

import { useRef, useState } from "react";

export function CommentInput({ onSubmit, members = [], disabled }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null); // { query, triggerIndex }
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionedIds, setMentionedIds] = useState([]);
  const textareaRef = useRef(null);

  const filtered = mentionQuery
    ? members.filter((m) =>
        m.name.toLowerCase().startsWith(mentionQuery.query.toLowerCase())
      )
    : [];

  function handleChange(e) {
    const val = e.target.value;
    setText(val);

    // Detect @mention trigger
    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    const match = before.match(/@([\w.]*)$/);
    if (match) {
      setMentionQuery({ query: match[1], triggerIndex: before.lastIndexOf("@") });
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function handleKeyDown(e) {
    if (!mentionQuery || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filtered[mentionIndex]);
    } else if (e.key === "Escape") {
      setMentionQuery(null);
    }
  }

  function insertMention(member) {
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    const before = text.slice(0, mentionQuery.triggerIndex);
    const after = text.slice(cursor);
    const newText = `${before}@${member.name} ${after}`;
    setText(newText);
    setMentionQuery(null);
    setMentionedIds((ids) => ids.includes(member.userId) ? ids : [...ids, member.userId]);

    // Move cursor after inserted mention
    setTimeout(() => {
      const pos = before.length + member.name.length + 2;
      textareaRef.current?.setSelectionRange(pos, pos);
      textareaRef.current?.focus();
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await onSubmit({ body: trimmed, mentionedUserIds: mentionedIds });
      setText("");
      setMentionQuery(null);
      setMentionedIds([]);
    } catch (_err) { /* parent handles toast */ }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
      {/* @mention dropdown */}
      {mentionQuery && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 z-30 mb-1 w-56 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-xl overflow-hidden">
          {filtered.map((m, i) => (
            <button
              key={m.userId}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition
                ${i === mentionIndex ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]" : "hover:bg-[color:var(--border)]/30"}`}
            >
              {m.avatarUrl
                ? <img src={m.avatarUrl} alt={m.name} className="h-5 w-5 rounded-full object-cover" />
                : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-[9px] font-bold text-white">{m.name[0]?.toUpperCase()}</span>
              }
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… use @ to mention teammates"
          disabled={disabled || busy}
          className="flex-1 resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40 transition"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy || disabled}
          className="self-end rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
        >
          {busy ? "…" : "Post"}
        </button>
      </div>
    </form>
  );
}
