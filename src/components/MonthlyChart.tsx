"use client";

import { Transaction } from "@/lib/types";

interface MonthlyChartProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
}

export default function MonthlyChart({
  transactions,
  currentMonth,
}: MonthlyChartProps) {
  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyData: { day: number; income: number; expense: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonth}-${String(d).padStart(2, "0")}`;
    const dayTransactions = transactions.filter((t) => t.date === dateStr);
    dailyData.push({
      day: d,
      income: dayTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
      expense: dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    });
  }

  const maxAmount = Math.max(
    ...dailyData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  const format = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}천`;
    return n.toLocaleString();
  };

  const totalIncome = dailyData.reduce((s, d) => s + d.income, 0);
  const totalExpense = dailyData.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500">일별 수입/지출</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            수입 {totalIncome.toLocaleString("ko-KR")}원
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            지출 {totalExpense.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      <div className="flex items-end gap-px h-48 overflow-x-auto pb-6 relative">
        {dailyData.map((d) => {
          const incomeHeight = maxAmount > 0 ? (d.income / maxAmount) * 100 : 0;
          const expenseHeight =
            maxAmount > 0 ? (d.expense / maxAmount) * 100 : 0;
          const hasData = d.income > 0 || d.expense > 0;

          return (
            <div
              key={d.day}
              className="flex-1 min-w-[14px] flex flex-col items-center group relative"
            >
              <div className="flex gap-px items-end h-40 w-full justify-center">
                {d.income > 0 && (
                  <div
                    className="bg-blue-400 rounded-t-sm w-[40%] min-h-[3px] transition-all hover:bg-blue-500"
                    style={{ height: `${incomeHeight}%` }}
                  />
                )}
                {d.expense > 0 && (
                  <div
                    className="bg-red-400 rounded-t-sm w-[40%] min-h-[3px] transition-all hover:bg-red-500"
                    style={{ height: `${expenseHeight}%` }}
                  />
                )}
                {!hasData && (
                  <div className="bg-gray-100 rounded-t-sm w-[60%] min-h-[2px]" />
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 absolute -bottom-5">
                {d.day % 5 === 1 || d.day === daysInMonth ? d.day : ""}
              </span>

              {hasData && (
                <div className="absolute -top-12 bg-gray-800 text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div>{d.day}일</div>
                  {d.income > 0 && <div>수입: {format(d.income)}원</div>}
                  {d.expense > 0 && <div>지출: {format(d.expense)}원</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
