"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { getTransactions, addTransaction, deleteTransaction } from "@/lib/storage";
import Summary from "@/components/Summary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import CategoryChart from "@/components/CategoryChart";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTransactions(getTransactions());
    setMounted(true);
  }, []);

  const handleAdd = (data: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = addTransaction(transaction);
    setTransactions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const monthLabel = (() => {
    const [year, month] = currentMonth.split("-").map(Number);
    return `${year}년 ${month}월`;
  })();

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 w-full">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
        💰 나의 가계부
      </h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-lg"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold text-gray-700 w-32 text-center">
          {monthLabel}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-lg"
        >
          ›
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <Summary transactions={transactions} currentMonth={currentMonth} />
      </div>

      {/* Add Transaction */}
      <div className="mb-6">
        <TransactionForm onAdd={handleAdd} />
      </div>

      {/* Category Chart */}
      <div className="mb-6">
        <CategoryChart
          transactions={transactions}
          currentMonth={currentMonth}
        />
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        currentMonth={currentMonth}
        onDelete={handleDelete}
      />
    </main>
  );
}
