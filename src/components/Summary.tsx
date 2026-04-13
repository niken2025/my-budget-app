"use client";

import { Transaction } from "@/lib/types";

interface SummaryProps {
  transactions: Transaction[];
  currentMonth: string;
}

export default function Summary({ transactions, currentMonth }: SummaryProps) {
  const monthlyTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  );

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const format = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden scanlines">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
        <p className="text-xs text-[#00f0ff] font-medium mb-1 tracking-wider">INCOME</p>
        <p className="text-xl font-bold text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
          +{format(totalIncome)}
        </p>
      </div>
      <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden scanlines">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00aa] to-transparent" />
        <p className="text-xs text-[#ff00aa] font-medium mb-1 tracking-wider">EXPENSE</p>
        <p className="text-xl font-bold text-[#ff00aa] drop-shadow-[0_0_10px_rgba(255,0,170,0.4)]">
          -{format(totalExpense)}
        </p>
      </div>
      <div className="cyber-card rounded-xl p-4 text-center relative overflow-hidden scanlines">
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
            balance >= 0 ? "via-[#f0ff00]" : "via-[#ff4400]"
          } to-transparent`}
        />
        <p
          className={`text-xs font-medium mb-1 tracking-wider ${
            balance >= 0 ? "text-[#f0ff00]" : "text-[#ff4400]"
          }`}
        >
          BALANCE
        </p>
        <p
          className={`text-xl font-bold ${
            balance >= 0
              ? "text-[#f0ff00] drop-shadow-[0_0_10px_rgba(240,255,0,0.4)]"
              : "text-[#ff4400] drop-shadow-[0_0_10px_rgba(255,68,0,0.4)]"
          }`}
        >
          {balance >= 0 ? "+" : ""}{format(balance)}
        </p>
      </div>
    </div>
  );
}
