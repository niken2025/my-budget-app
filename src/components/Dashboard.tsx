"use client";

import { useState } from "react";
import { Transaction, DashboardPeriod } from "@/lib/types";
import MonthlyChart from "./MonthlyChart";
import YearlyChart from "./YearlyChart";
import CategoryChart from "./CategoryChart";

interface DashboardProps {
  transactions: Transaction[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  const now = new Date();
  const [period, setPeriod] = useState<DashboardPeriod>("monthly");
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const changeMonth = (delta: number) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const monthLabel = (() => {
    const [y, m] = currentMonth.split("-").map(Number);
    return `${y}년 ${m}월`;
  })();

  return (
    <div className="space-y-5">
      {/* Period Toggle */}
      <div className="flex cyber-card rounded-xl p-1">
        <button
          onClick={() => setPeriod("monthly")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer tracking-wider ${
            period === "monthly"
              ? "bg-[rgba(0,240,255,0.15)] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          MONTHLY
        </button>
        <button
          onClick={() => setPeriod("yearly")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer tracking-wider ${
            period === "yearly"
              ? "bg-[rgba(255,0,170,0.15)] text-[#ff00aa] shadow-[0_0_10px_rgba(255,0,170,0.1)]"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          YEARLY
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() =>
            period === "monthly" ? changeMonth(-1) : setCurrentYear((y) => y - 1)
          }
          className="w-10 h-10 rounded-lg cyber-card flex items-center justify-center text-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer text-lg"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold text-[#e0e0ff] w-32 text-center tracking-wide">
          {period === "monthly" ? monthLabel : `${currentYear}년`}
        </h2>
        <button
          onClick={() =>
            period === "monthly" ? changeMonth(1) : setCurrentYear((y) => y + 1)
          }
          className="w-10 h-10 rounded-lg cyber-card flex items-center justify-center text-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer text-lg"
        >
          ›
        </button>
      </div>

      {/* Charts */}
      {period === "monthly" ? (
        <>
          <MonthlyChart transactions={transactions} currentMonth={currentMonth} />
          <CategoryChart transactions={transactions} currentMonth={currentMonth} />
        </>
      ) : (
        <YearlyChart transactions={transactions} currentYear={currentYear} />
      )}
    </div>
  );
}
