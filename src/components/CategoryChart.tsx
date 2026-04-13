"use client";

import { Transaction } from "@/lib/types";

interface CategoryChartProps {
  transactions: Transaction[];
  currentMonth: string;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#14b8a6",
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
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        카테고리별 지출
      </h3>

      <div className="h-4 rounded-full overflow-hidden flex mb-5">
        {sorted.map(([category, amount], i) => (
          <div
            key={category}
            style={{
              width: `${(amount / total) * 100}%`,
              backgroundColor: COLORS[i % COLORS.length],
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
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-gray-700">{category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{percent}%</span>
                <span className="text-sm font-medium text-gray-700 w-24 text-right">
                  {format(amount)}원
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
