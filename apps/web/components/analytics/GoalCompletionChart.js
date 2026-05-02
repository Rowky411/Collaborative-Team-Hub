"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function GoalCompletionChart({ data = [], accentColor = "#6366f1" }) {
  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-[color:var(--muted)]">
        No chart data yet.
      </p>
    );
  }

  // Short labels: strip year → "W18"
  const formatted = data.map((d) => ({
    ...d,
    weekLabel: d.week.split("-")[1] ?? d.week,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => v[0].toUpperCase() + v.slice(1)}
        />
        <Bar dataKey="total" name="created" fill="var(--border)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" name="completed" fill={accentColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
