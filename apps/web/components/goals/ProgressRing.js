"use client";

export function ProgressRing({ progress = 0, size = 48, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-label={`${progress}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-gray-200" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        stroke="var(--accent, #6366f1)"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
    </svg>
  );
}
