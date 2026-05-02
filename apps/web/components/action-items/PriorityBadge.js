const CONFIG = {
  LOW:    { label: "Low",    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  MEDIUM: { label: "Medium", cls: "bg-blue-100  text-blue-700  dark:bg-blue-900/40 dark:text-blue-300" },
  HIGH:   { label: "High",   cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  URGENT: { label: "Urgent", cls: "bg-red-100   text-red-700   dark:bg-red-900/40   dark:text-red-300" },
};

export function PriorityBadge({ priority }) {
  const cfg = CONFIG[priority] ?? CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
