"use client";

import { useState, useEffect } from "react";
import { Transaction, ViewMode } from "@/lib/types";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
} from "@/lib/storage";
import Summary from "@/components/Summary";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<ViewMode>("home");
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
    const transaction: Transaction = { ...data, id: crypto.randomUUID() };
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
        <div className="neon-text-cyan text-lg animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 cyber-card border-t-0 border-x-0">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          <h1 className="text-xl font-bold tracking-wider neon-text-cyan">
            BUDGET PUNK
          </h1>
          <div className="w-2 h-2 rounded-full bg-[#ff00aa] shadow-[0_0_8px_#ff00aa]" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 w-full pb-24">
        {view === "home" ? (
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => changeMonth(-1)}
                className="w-10 h-10 rounded-lg cyber-card flex items-center justify-center text-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer text-lg"
              >
                ‹
              </button>
              <h2 className="text-lg font-semibold text-[#e0e0ff] w-32 text-center tracking-wide">
                {monthLabel}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className="w-10 h-10 rounded-lg cyber-card flex items-center justify-center text-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer text-lg"
              >
                ›
              </button>
            </div>

            <Summary transactions={transactions} currentMonth={currentMonth} />
            <TransactionForm onAdd={handleAdd} />
            <TransactionList
              transactions={transactions}
              currentMonth={currentMonth}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <Dashboard transactions={transactions} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 cyber-card border-b-0 border-x-0">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setView("home")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 cursor-pointer transition-all ${
              view === "home"
                ? "text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
            </svg>
            <span className="text-xs font-medium tracking-wider">HOME</span>
          </button>
          <button
            onClick={() => setView("dashboard")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 cursor-pointer transition-all ${
              view === "dashboard"
                ? "text-[#ff00aa] drop-shadow-[0_0_8px_rgba(255,0,170,0.5)]"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium tracking-wider">DASH</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
