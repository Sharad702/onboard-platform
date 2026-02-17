"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Point = { name: string; value: number };

export default function ChartSection({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <p className="text-[var(--fg-dim)] text-sm py-8 text-center">
        Add projects with value to see revenue by month.
      </p>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--fg-dim)" fontSize={12} />
          <YAxis stroke="var(--fg-dim)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            formatter={(v: number) => [`₹${Number(v).toLocaleString("en-IN")}`, "Value"]}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
