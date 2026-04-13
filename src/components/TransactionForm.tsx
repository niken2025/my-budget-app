"use client";

import { useState } from "react";
import {
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/lib/types";

interface TransactionFormProps {
  onAdd: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => void;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [isOpen, setIsOpen] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    onAdd({ type, amount: Number(amount), category, description, date });
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(today);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-xl border border-dashed border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all text-lg font-medium cursor-pointer tracking-wider bg-transparent"
      >
        + NEW RECORD
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="cyber-card rounded-xl p-6 space-y-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#00f0ff] via-[#ff00aa] to-[#b400ff]" />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setType("expense"); setCategory(""); }}
          className={`flex-1 py-2.5 rounded-lg font-medium transition-all cursor-pointer tracking-wider text-sm ${
            type === "expense"
              ? "bg-[#ff00aa] text-white shadow-[0_0_15px_rgba(255,0,170,0.3)]"
              : "bg-[rgba(255,255,255,0.05)] text-gray-500 hover:text-gray-300 border border-[rgba(255,255,255,0.1)]"
          }`}
        >
          EXPENSE
        </button>
        <button
          type="button"
          onClick={() => { setType("income"); setCategory(""); }}
          className={`flex-1 py-2.5 rounded-lg font-medium transition-all cursor-pointer tracking-wider text-sm ${
            type === "income"
              ? "bg-[#00f0ff] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "bg-[rgba(255,255,255,0.05)] text-gray-500 hover:text-gray-300 border border-[rgba(255,255,255,0.1)]"
          }`}
        >
          INCOME
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wider">AMOUNT</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          required
          className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,240,255,0.2)] rounded-lg text-lg text-[#e0e0ff] focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wider">CATEGORY</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                category === cat
                  ? type === "expense"
                    ? "bg-[#ff00aa] text-white shadow-[0_0_10px_rgba(255,0,170,0.3)]"
                    : "bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "bg-[rgba(255,255,255,0.05)] text-gray-400 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wider">MEMO</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="내용을 입력하세요"
          className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,240,255,0.2)] rounded-lg text-[#e0e0ff] focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wider">DATE</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,240,255,0.2)] rounded-lg text-[#e0e0ff] focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all [color-scheme:dark]"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] text-gray-400 font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all cursor-pointer border border-[rgba(255,255,255,0.1)] tracking-wider text-sm"
        >
          CANCEL
        </button>
        <button
          type="submit"
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer tracking-wider ${
            type === "expense"
              ? "bg-[#ff00aa] text-white hover:shadow-[0_0_20px_rgba(255,0,170,0.4)]"
              : "bg-[#00f0ff] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          }`}
        >
          CONFIRM
        </button>
      </div>
    </form>
  );
}
