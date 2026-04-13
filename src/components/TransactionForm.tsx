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

    onAdd({
      type,
      amount: Number(amount),
      category,
      description,
      date,
    });

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
        className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-lg font-medium cursor-pointer"
      >
        + 새 내역 추가
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategory("");
          }}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            type === "expense"
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          지출
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategory("");
          }}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            type === "income"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          수입
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          금액
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="0"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                category === cat
                  ? type === "expense"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메모 (선택)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="내용을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          날짜
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors cursor-pointer"
        >
          취소
        </button>
        <button
          type="submit"
          className={`flex-1 py-3 rounded-xl text-white font-medium transition-colors cursor-pointer ${
            type === "expense"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          추가하기
        </button>
      </div>
    </form>
  );
}
