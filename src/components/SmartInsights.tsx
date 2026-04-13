"use client";

import { Transaction } from "@/lib/types";
import { analyze, Insight } from "@/lib/analyzer";

interface SmartInsightsProps {
  transactions: Transaction[];
  currentMonth: string;
}

function InsightIcon({ type }: { type: Insight["type"] }) {
  if (type === "warning") {
    return (
      <div className="w-8 h-8 rounded-lg bg-[rgba(255,68,0,0.15)] flex items-center justify-center shrink-0">
        <span className="text-[#ff4400] text-sm">!</span>
      </div>
    );
  }
  if (type === "good") {
    return (
      <div className="w-8 h-8 rounded-lg bg-[rgba(0,255,136,0.15)] flex items-center justify-center shrink-0">
        <span className="text-[#00ff88] text-sm">✓</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-[rgba(0,240,255,0.15)] flex items-center justify-center shrink-0">
      <span className="text-[#00f0ff] text-sm">i</span>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const borderColor =
    insight.type === "warning"
      ? "rgba(255,68,0,0.3)"
      : insight.type === "good"
        ? "rgba(0,255,136,0.3)"
        : "rgba(0,240,255,0.3)";

  const glowColor =
    insight.type === "warning"
      ? "rgba(255,68,0,0.08)"
      : insight.type === "good"
        ? "rgba(0,255,136,0.08)"
        : "rgba(0,240,255,0.08)";

  const titleColor =
    insight.type === "warning"
      ? "text-[#ff4400]"
      : insight.type === "good"
        ? "text-[#00ff88]"
        : "text-[#00f0ff]";

  return (
    <div
      className="cyber-card rounded-xl p-4 flex gap-3"
      style={{
        borderColor,
        boxShadow: `0 0 12px ${glowColor}`,
      }}
    >
      <InsightIcon type={insight.type} />
      <div className="min-w-0">
        <h4 className={`text-sm font-semibold ${titleColor} mb-1`}>
          {insight.title}
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          {insight.message}
        </p>
      </div>
    </div>
  );
}

export default function SmartInsights({
  transactions,
  currentMonth,
}: SmartInsightsProps) {
  const result = analyze(transactions, currentMonth);

  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // 저축률 게이지 색상
  const gaugeColor =
    result.savingsRate >= 20
      ? "#00ff88"
      : result.savingsRate >= 0
        ? "#f0ff00"
        : "#ff4400";

  const gaugePercent = Math.min(Math.max(result.savingsRate, 0), 100);

  return (
    <div className="space-y-4">
      {/* Savings Rate Gauge */}
      {income > 0 && (
        <div className="cyber-card rounded-xl p-5 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent"
            style={{
              background: `linear-gradient(to right, transparent, ${gaugeColor}, transparent)`,
            }}
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
              SAVINGS RATE
            </h3>
            <span
              className="text-2xl font-bold"
              style={{
                color: gaugeColor,
                textShadow: `0 0 10px ${gaugeColor}66`,
              }}
            >
              {result.savingsRate.toFixed(0)}%
            </span>
          </div>

          {/* Gauge Bar */}
          <div className="h-2.5 rounded-full bg-[rgba(0,0,0,0.4)] overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${gaugePercent}%`,
                backgroundColor: gaugeColor,
                boxShadow: `0 0 10px ${gaugeColor}88`,
              }}
            />
          </div>

          {/* Income vs Expense Bar */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-[#00f0ff]">수입</span>
                <span className="text-[#00f0ff]">
                  {income.toLocaleString("ko-KR")}원
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(0,0,0,0.4)]">
                <div
                  className="h-full rounded-full bg-[#00f0ff]"
                  style={{ width: "100%", boxShadow: "0 0 6px #00f0ff66" }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-[#ff00aa]">지출</span>
                <span className="text-[#ff00aa]">
                  {expense.toLocaleString("ko-KR")}원
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgba(0,0,0,0.4)]">
                <div
                  className="h-full rounded-full bg-[#ff00aa]"
                  style={{
                    width: `${income > 0 ? Math.min((expense / income) * 100, 100) : 0}%`,
                    boxShadow: "0 0 6px #ff00aa66",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#b400ff] shadow-[0_0_6px_#b400ff]" />
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
          SMART INSIGHTS
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[rgba(180,0,255,0.3)] to-transparent" />
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {result.insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>

      {/* Top Categories Breakdown */}
      {result.topCategories.length > 0 && (
        <div className="cyber-card rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00aa] to-transparent" />
          <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-4">
            EXPENSE RANKING
          </h3>
          <div className="space-y-3">
            {result.topCategories.slice(0, 5).map((cat, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-6 text-center">
                        {i < 3 ? medals[i] : `${i + 1}`}
                      </span>
                      <span className="text-sm text-[#c0c0e0]">
                        {cat.category}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#e0e0ff]">
                      {cat.amount.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(0,0,0,0.4)] ml-8">
                    <div
                      className="h-full rounded-full bg-[#ff00aa] transition-all duration-500"
                      style={{
                        width: `${cat.percent}%`,
                        opacity: 1 - i * 0.15,
                        boxShadow: "0 0 6px #ff00aa44",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
