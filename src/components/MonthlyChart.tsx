"use client";

import { Transaction } from "@/lib/types";

interface MonthlyChartProps {
  transactions: Transaction[];
  currentMonth: string;
}

export default function MonthlyChart({
  transactions,
  currentMonth,
}: MonthlyChartProps) {
  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const dateStr = `${currentMonth}-${String(d).padStart(2, "0")}`;
    const dayTx = transactions.filter((t) => t.date === dateStr);
    return {
      day: d,
      income: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const maxAmount = Math.max(...dailyData.map((d) => Math.max(d.income, d.expense)), 1);

  const format = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}천`;
    return n.toLocaleString();
  };

  const totalIncome = dailyData.reduce((s, d) => s + d.income, 0);
  const totalExpense = dailyData.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="cyber-card rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">DAILY FLOW</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]" />
            <span className="text-gray-400">{totalIncome.toLocaleString("ko-KR")}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff00aa] shadow-[0_0_4px_#ff00aa]" />
            <span className="text-gray-400">{totalExpense.toLocaleString("ko-KR")}</span>
          </span>
        </div>
      </div>

      <div className="flex items-end gap-px h-48 overflow-x-auto pb-6 relative">
        {dailyData.map((d) => {
          const incomeH = maxAmount > 0 ? (d.income / maxAmount) * 100 : 0;
          const expenseH = maxAmount > 0 ? (d.expense / maxAmount) * 100 : 0;
          const hasData = d.income > 0 || d.expense > 0;

          return (
            <div key={d.day} className="flex-1 min-w-[14px] flex flex-col items-center group relative">
              <div className="flex gap-px items-end h-40 w-full justify-center">
                {d.income > 0 && (
                  <div
                    className="bg-[#00f0ff] rounded-t-sm w-[40%] min-h-[3px] transition-all hover:shadow-[0_0_8px_#00f0ff]"
                    style={{ height: `${incomeH}%`, opacity: 0.8 }}
                  />
                )}
                {d.expense > 0 && (
                  <div
                    className="bg-[#ff00aa] rounded-t-sm w-[40%] min-h-[3px] transition-all hover:shadow-[0_0_8px_#ff00aa]"
                    style={{ height: `${expenseH}%`, opacity: 0.8 }}
                  />
                )}
                {!hasData && (
                  <div className="bg-[rgba(255,255,255,0.05)] rounded-t-sm w-[60%] min-h-[2px]" />
                )}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 absolute -bottom-5">
                {d.day % 5 === 1 || d.day === daysInMonth ? d.day : ""}
              </span>

              {hasData && (
                <div className="absolute -top-12 cyber-card rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-[10px] text-[#e0e0ff]">
                  <div>{d.day}일</div>
                  {d.income > 0 && <div className="text-[#00f0ff]">+{format(d.income)}</div>}
                  {d.expense > 0 && <div className="text-[#ff00aa]">-{format(d.expense)}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
