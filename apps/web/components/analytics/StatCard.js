"use client";

export function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {sub && (
          <span className="text-xs text-[color:var(--muted)]">{sub}</span>
        )}
      </div>
      <div>
        <p
          className="text-3xl font-bold"
          style={accent ? { color: "var(--accent)" } : undefined}
        >
          {value ?? "—"}
        </p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{label}</p>
      </div>
    </div>
  );
}
