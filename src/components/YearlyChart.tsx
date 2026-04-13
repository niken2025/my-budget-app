"use client";

import { Transaction } from "@/lib/types";

interface YearlyChartProps {
  transactions: Transaction[];
  currentYear: number;
}

export default function YearlyChart({
  transactions,
  currentYear,
}: YearlyChartProps) {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
    const monthTx = transactions.filter((t) => t.date.startsWith(monthStr));
    return {
      month: i + 1,
      income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const maxAmount = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)), 1);

  const format = (n: number) => {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}천`;
    return n.toLocaleString();
  };

  const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      {/* Yearly Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
          <p className="text-[10px] text-[#00f0ff] font-medium mb-1 tracking-wider">ANNUAL IN</p>
          <p className="text-base font-bold text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            {format(totalIncome)}
          </p>
        </div>
        <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00aa] to-transparent" />
          <p className="text-[10px] text-[#ff00aa] font-medium mb-1 tracking-wider">ANNUAL OUT</p>
          <p className="text-base font-bold text-[#ff00aa] drop-shadow-[0_0_8px_rgba(255,0,170,0.4)]">
            {format(totalExpense)}
          </p>
        </div>
        <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
              totalBalance >= 0 ? "via-[#f0ff00]" : "via-[#ff4400]"
            } to-transparent`}
          />
          <p
            className={`text-[10px] font-medium mb-1 tracking-wider ${
              totalBalance >= 0 ? "text-[#f0ff00]" : "text-[#ff4400]"
            }`}
          >
            NET
          </p>
          <p
            className={`text-base font-bold ${
              totalBalance >= 0
                ? "text-[#f0ff00] drop-shadow-[0_0_8px_rgba(240,255,0,0.4)]"
                : "text-[#ff4400] drop-shadow-[0_0_8px_rgba(255,68,0,0.4)]"
            }`}
          >
            {totalBalance >= 0 ? "+" : ""}{format(totalBalance)}
          </p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="cyber-card rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#b400ff] to-transparent" />
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider">MONTHLY FLOW</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]" />
              <span className="text-gray-500">IN</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ff00aa] shadow-[0_0_4px_#ff00aa]" />
              <span className="text-gray-500">OUT</span>
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2 h-52 pb-7 relative">
          {monthlyData.map((d) => {
            const incomeH = maxAmount > 0 ? (d.income / maxAmount) * 100 : 0;
            const expenseH = maxAmount > 0 ? (d.expense / maxAmount) * 100 : 0;
            const hasData = d.income > 0 || d.expense > 0;

            return (
              <div key={d.month} className="flex-1 flex flex-col items-center group relative">
                <div className="flex gap-0.5 items-end h-44 w-full justify-center">
                  <div
                    className="bg-[#00f0ff] rounded-t-sm w-[38%] transition-all hover:shadow-[0_0_10px_#00f0ff]"
                    style={{
                      height: `${incomeH}%`,
                      minHeight: d.income > 0 ? "4px" : "0",
                      opacity: 0.8,
                    }}
                  />
                  <div
                    className="bg-[#ff00aa] rounded-t-sm w-[38%] transition-all hover:shadow-[0_0_10px_#ff00aa]"
                    style={{
                      height: `${expenseH}%`,
                      minHeight: d.expense > 0 ? "4px" : "0",
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 mt-1 absolute -bottom-6">
                  {d.month}
                </span>

                {hasData && (
                  <div className="absolute -top-14 cyber-card rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-[10px]">
                    <div className="text-[#e0e0ff] font-medium">{d.month}월</div>
                    {d.income > 0 && <div className="text-[#00f0ff]">+{format(d.income)}</div>}
                    {d.expense > 0 && <div className="text-[#ff00aa]">-{format(d.expense)}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Table */}
      <div className="cyber-card rounded-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,240,255,0.1)]">
              <th className="py-3 px-4 text-left text-gray-500 font-medium text-xs tracking-wider">MON</th>
              <th className="py-3 px-4 text-right text-[#00f0ff] font-medium text-xs tracking-wider">IN</th>
              <th className="py-3 px-4 text-right text-[#ff00aa] font-medium text-xs tracking-wider">OUT</th>
              <th className="py-3 px-4 text-right text-gray-500 font-medium text-xs tracking-wider">NET</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((d) => {
              const balance = d.income - d.expense;
              const hasData = d.income > 0 || d.expense > 0;
              return (
                <tr
                  key={d.month}
                  className={`border-b border-[rgba(0,240,255,0.05)] hover:bg-[rgba(0,240,255,0.03)] transition-colors ${
                    hasData ? "" : "opacity-30"
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium text-[#c0c0e0]">{d.month}월</td>
                  <td className="py-2.5 px-4 text-right text-[#00f0ff]">
                    {d.income > 0 ? `+${d.income.toLocaleString("ko-KR")}` : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#ff00aa]">
                    {d.expense > 0 ? `-${d.expense.toLocaleString("ko-KR")}` : "-"}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-medium ${
                      hasData
                        ? balance >= 0 ? "text-[#f0ff00]" : "text-[#ff4400]"
                        : ""
                    }`}
                  >
                    {hasData
                      ? `${balance >= 0 ? "+" : ""}${balance.toLocaleString("ko-KR")}`
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
