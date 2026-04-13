"use client";

import { Transaction } from "@/lib/types";

interface SummaryProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
        <p className="text-sm text-blue-600 font-medium mb-1">수입</p>
        <p className="text-2xl font-bold text-blue-700">
          +{format(totalIncome)}원
        </p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <p className="text-sm text-red-600 font-medium mb-1">지출</p>
        <p className="text-2xl font-bold text-red-700">
          -{format(totalExpense)}원
        </p>
      </div>
      <div
        className={`rounded-2xl p-5 text-center border ${
          balance >= 0
            ? "bg-green-50 border-green-200"
            : "bg-orange-50 border-orange-200"
        }`}
      >
        <p
          className={`text-sm font-medium mb-1 ${
            balance >= 0 ? "text-green-600" : "text-orange-600"
          }`}
        >
          잔액
        </p>
        <p
          className={`text-2xl font-bold ${
            balance >= 0 ? "text-green-700" : "text-orange-700"
          }`}
        >
          {balance >= 0 ? "+" : ""}
          {format(balance)}원
        </p>
      </div>
    </div>
  );
}
