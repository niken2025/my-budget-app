"use client";

import { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions: Transaction[];
  currentMonth: string;
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  currentMonth,
  onDelete,
}: TransactionListProps) {
  const monthlyTransactions = transactions
    .filter((t) => t.date.startsWith(currentMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (monthlyTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-3 opacity-50">///</p>
        <p className="text-lg text-gray-500 tracking-wider">NO DATA</p>
        <p className="text-sm mt-1 text-gray-600">데이터가 없습니다</p>
      </div>
    );
  }

  const grouped: Record<string, Transaction[]> = {};
  for (const t of monthlyTransactions) {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[d.getDay()];
    return `${month}월 ${day}일 (${weekday})`;
  };

  const format = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, items]) => {
        const dayTotal = items.reduce(
          (sum, t) => sum + (t.type === "expense" ? -t.amount : t.amount),
          0
        );
        return (
          <div key={date}>
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
                {formatDate(date)}
              </h3>
              <span
                className={`text-xs font-medium ${
                  dayTotal >= 0 ? "text-[#00f0ff]" : "text-[#ff00aa]"
                }`}
              >
                {dayTotal >= 0 ? "+" : ""}
                {format(dayTotal)}
              </span>
            </div>
            <div className="cyber-card rounded-xl divide-y divide-[rgba(0,240,255,0.08)] overflow-hidden relative">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3.5 group hover:bg-[rgba(0,240,255,0.03)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 w-1.5 h-6 rounded-full ${
                        t.type === "income"
                          ? "bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]"
                          : "bg-[#ff00aa] shadow-[0_0_6px_#ff00aa]"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#e0e0ff] truncate text-sm">
                        {t.category}
                      </p>
                      {t.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-semibold text-sm ${
                        t.type === "income" ? "text-[#00f0ff]" : "text-[#ff00aa]"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {format(t.amount)}
                    </span>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-[#ff00aa] transition-all text-lg cursor-pointer"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
