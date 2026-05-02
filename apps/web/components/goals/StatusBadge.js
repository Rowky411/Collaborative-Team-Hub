"use client";

const CONFIG = {
  NOT_STARTED: { label: "Not Started", cls: "bg-gray-100 text-gray-600" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  COMPLETED:   { label: "Completed",   cls: "bg-green-100 text-green-700" },
  OVERDUE:     { label: "Overdue",     cls: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status, onClick, className = "" }) {
  const cfg = CONFIG[status] || CONFIG.NOT_STARTED;
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls} ${onClick ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
      aria-label={onClick ? `Change status, current: ${cfg.label}` : cfg.label}
    >
      {cfg.label}
    </Tag>
  );
}

export const STATUS_OPTIONS = Object.entries(CONFIG).map(([value, { label }]) => ({ value, label }));
