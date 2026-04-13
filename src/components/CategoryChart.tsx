"use client";

import { Transaction } from "@/lib/types";

interface CategoryChartProps {
  transactions: Transaction[];
  currentMonth: string;
}

const COLORS = [
  "#ff00aa",
  "#00f0ff",
  "#f0ff00",
  "#b400ff",
  "#ff4400",
  "#00ff88",
  "#ff6600",
  "#0088ff",
  "#ff0066",
  "#00ffcc",
];

export default function CategoryChart({
  transactions,
  currentMonth,
}: CategoryChartProps) {
  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(currentMonth)
  );

  if (expenses.length === 0) return null;

  const categoryTotals: Record<string, number> = {};
  for (const t of expenses) {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  }

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
  const format = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="cyber-card rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00aa] to-transparent" />
      <h3 className="text-xs font-semibold text-gray-500 mb-4 tracking-wider">
        EXPENSE BY CATEGORY
      </h3>

      <div className="h-3 rounded-full overflow-hidden flex mb-5 bg-[rgba(0,0,0,0.3)]">
        {sorted.map(([category, amount], i) => (
          <div
            key={category}
            style={{
              width: `${(amount / total) * 100}%`,
              backgroundColor: COLORS[i % COLORS.length],
              boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}66`,
            }}
            title={`${category}: ${format(amount)}원`}
          />
        ))}
      </div>

      <div className="space-y-2.5">
        {sorted.map(([category, amount], i) => {
          const percent = ((amount / total) * 100).toFixed(1);
          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                    boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}88`,
                  }}
                />
                <span className="text-sm text-[#c0c0e0]">{category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{percent}%</span>
                <span className="text-sm font-medium text-[#e0e0ff] w-24 text-right">
                  {format(amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
