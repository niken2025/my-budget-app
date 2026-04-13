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
    const monthTransactions = transactions.filter((t) =>
      t.date.startsWith(monthStr)
    );
    return {
      month: i + 1,
      income: monthTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
      expense: monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    };
  });

  const maxAmount = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    1
  );

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
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-blue-600 font-medium mb-1">연간 수입</p>
          <p className="text-lg font-bold text-blue-700">
            {totalIncome.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-red-600 font-medium mb-1">연간 지출</p>
          <p className="text-lg font-bold text-red-700">
            {totalExpense.toLocaleString("ko-KR")}원
          </p>
        </div>
        <div
          className={`rounded-2xl p-4 text-center border ${
            totalBalance >= 0
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
        >
          <p
            className={`text-xs font-medium mb-1 ${
              totalBalance >= 0 ? "text-green-600" : "text-orange-600"
            }`}
          >
            연간 잔액
          </p>
          <p
            className={`text-lg font-bold ${
              totalBalance >= 0 ? "text-green-700" : "text-orange-700"
            }`}
          >
            {totalBalance >= 0 ? "+" : ""}
            {totalBalance.toLocaleString("ko-KR")}원
          </p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-500">월별 수입/지출</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              수입
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              지출
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2 h-52 pb-7 relative">
          {monthlyData.map((d) => {
            const incomeHeight =
              maxAmount > 0 ? (d.income / maxAmount) * 100 : 0;
            const expenseHeight =
              maxAmount > 0 ? (d.expense / maxAmount) * 100 : 0;
            const hasData = d.income > 0 || d.expense > 0;

            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div className="flex gap-0.5 items-end h-44 w-full justify-center">
                  <div
                    className="bg-blue-400 rounded-t-sm w-[38%] transition-all hover:bg-blue-500"
                    style={{
                      height: `${incomeHeight}%`,
                      minHeight: d.income > 0 ? "4px" : "0",
                    }}
                  />
                  <div
                    className="bg-red-400 rounded-t-sm w-[38%] transition-all hover:bg-red-500"
                    style={{
                      height: `${expenseHeight}%`,
                      minHeight: d.expense > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1 absolute -bottom-6">
                  {d.month}월
                </span>

                {hasData && (
                  <div className="absolute -top-14 bg-gray-800 text-white text-[10px] rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{d.month}월</div>
                    {d.income > 0 && <div>수입: {format(d.income)}원</div>}
                    {d.expense > 0 && <div>지출: {format(d.expense)}원</div>}
                    <div>
                      잔액: {d.income - d.expense >= 0 ? "+" : ""}
                      {format(d.income - d.expense)}원
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-gray-500 font-medium">월</th>
              <th className="py-3 px-4 text-right text-blue-500 font-medium">수입</th>
              <th className="py-3 px-4 text-right text-red-500 font-medium">지출</th>
              <th className="py-3 px-4 text-right text-gray-500 font-medium">잔액</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((d) => {
              const balance = d.income - d.expense;
              const hasData = d.income > 0 || d.expense > 0;
              return (
                <tr
                  key={d.month}
                  className={`border-b border-gray-50 ${
                    hasData ? "" : "text-gray-300"
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium">{d.month}월</td>
                  <td className="py-2.5 px-4 text-right text-blue-600">
                    {d.income > 0 ? `+${d.income.toLocaleString("ko-KR")}` : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-right text-red-600">
                    {d.expense > 0
                      ? `-${d.expense.toLocaleString("ko-KR")}`
                      : "-"}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-medium ${
                      hasData
                        ? balance >= 0
                          ? "text-green-600"
                          : "text-orange-600"
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
