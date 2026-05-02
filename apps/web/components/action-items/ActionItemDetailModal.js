"use client";

import { Modal } from "../Modal";
import { PriorityBadge } from "./PriorityBadge";

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_COLORS = {
  TODO: "#8888a0",
  IN_PROGRESS: "#7c5cfc",
  IN_REVIEW: "#f59e0b",
  DONE: "#22c55e",
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(iso, status) {
  if (!iso || status === "DONE") return false;
  return new Date(iso) < new Date();
}

function FileIcon({ type }) {
  if (!type) return <>📄</>;
  if (type.startsWith("image/")) return <>🖼</>;
  if (type.includes("pdf")) return <>📕</>;
  if (type.includes("word") || type.includes("document")) return <>📝</>;
  if (type.includes("sheet") || type.includes("excel")) return <>📊</>;
  return <>📎</>;
}

export function ActionItemDetailModal({ item, open, onClose, onEdit }) {
  if (!item) return null;

  const overdue = isOverdue(item.dueDate, item.status);
  const attachments = item.attachments || [];

  return (
    <Modal open={open} onClose={onClose} title="Action Item">
      <div className="flex flex-col gap-5">

        {/* Title + status */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.4, marginBottom: 10 }}>
            {item.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: `${STATUS_COLORS[item.status]}20`,
              color: STATUS_COLORS[item.status],
              border: `1px solid ${STATUS_COLORS[item.status]}40`,
            }}>
              {STATUS_LABELS[item.status]}
            </span>
            <PriorityBadge priority={item.priority} />
          </div>
        </div>

        {/* Description */}
        {item.description ? (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Description
            </p>
            <p style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {item.description}
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No description.</p>
        )}

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-4">
          {item.assignee && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Assignee</p>
              <div className="flex items-center gap-2">
                {item.assignee.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.assignee.avatarUrl} alt={item.assignee.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span style={{
                    display: "inline-flex", width: 20, height: 20, borderRadius: "50%",
                    background: "var(--accent, #7c5cfc)", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontWeight: 700, color: "#fff",
                  }}>
                    {item.assignee.name?.[0]?.toUpperCase()}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "var(--text)" }}>{item.assignee.name}</span>
              </div>
            </div>
          )}

          {item.dueDate && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Due Date</p>
              <p style={{ fontSize: 13, color: overdue ? "var(--red, #ef4444)" : "var(--text)", fontWeight: overdue ? 600 : 400 }}>
                {overdue ? "⚠ " : ""}{formatDate(item.dueDate)}
              </p>
            </div>
          )}

          {item.goal && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Goal</p>
              <p style={{ fontSize: 13, color: "var(--text)" }}>⟶ {item.goal.title}</p>
            </div>
          )}

          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Created</p>
            <p style={{ fontSize: 13, color: "var(--text)" }}>{formatDate(item.createdAt)}</p>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Attachments ({attachments.length})
            </p>
            <div className="flex flex-col gap-2">
              {attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg hover:bg-[color:var(--border)]/30 transition"
                  style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none" }}
                >
                  <span style={{ fontSize: 15 }}><FileIcon type={att.type} /></span>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {att.name}
                  </span>
                  {att.size && (
                    <span style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                      {att.size < 1024 * 1024
                        ? `${Math.round(att.size / 1024)}KB`
                        : `${(att.size / (1024 * 1024)).toFixed(1)}MB`}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-1" style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <button
            onClick={onClose}
            className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit?.(item); }}
            className="rounded-lg bg-[color:var(--accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Edit
          </button>
        </div>

      </div>
    </Modal>
  );
}
