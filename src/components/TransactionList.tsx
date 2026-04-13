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
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📒</p>
        <p className="text-lg">이번 달 내역이 없습니다</p>
        <p className="text-sm mt-1">위의 버튼을 눌러 내역을 추가해보세요</p>
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
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => {
        const dayTotal = items.reduce(
          (sum, t) => sum + (t.type === "expense" ? -t.amount : t.amount),
          0
        );
        return (
          <div key={date}>
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-sm font-semibold text-gray-500">
                {formatDate(date)}
              </h3>
              <span
                className={`text-sm font-medium ${
                  dayTotal >= 0 ? "text-blue-500" : "text-red-500"
                }`}
              >
                {dayTotal >= 0 ? "+" : ""}
                {format(dayTotal)}원
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3.5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 w-2 h-2 rounded-full ${
                        t.type === "income" ? "bg-blue-400" : "bg-red-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {t.category}
                      </p>
                      {t.description && (
                        <p className="text-sm text-gray-400 truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-semibold ${
                        t.type === "income" ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {format(t.amount)}원
                    </span>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-lg cursor-pointer"
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
