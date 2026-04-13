import { Transaction } from "./types";

export interface Insight {
  type: "warning" | "tip" | "good";
  title: string;
  message: string;
}

export interface AnalysisResult {
  savingsRate: number;           // 저축률 (%)
  topCategories: { category: string; amount: number; percent: number }[];
  monthOverMonth: { increased: string[]; decreased: string[] };
  insights: Insight[];
}

function getMonthTransactions(transactions: Transaction[], yearMonth: string) {
  return transactions.filter((t) => t.date.startsWith(yearMonth));
}

function getPrevMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sum(txs: Transaction[], type: "income" | "expense") {
  return txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

function categoryTotals(txs: Transaction[], type: "income" | "expense") {
  const map: Record<string, number> = {};
  for (const t of txs.filter((t) => t.type === type)) {
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return map;
}

const format = (n: number) => n.toLocaleString("ko-KR");

export function analyze(
  transactions: Transaction[],
  currentMonth: string
): AnalysisResult {
  const current = getMonthTransactions(transactions, currentMonth);
  const prevMonthStr = getPrevMonth(currentMonth);
  const prev = getMonthTransactions(transactions, prevMonthStr);

  const income = sum(current, "income");
  const expense = sum(current, "expense");
  const prevIncome = sum(prev, "income");
  const prevExpense = sum(prev, "expense");

  // 저축률
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // 카테고리별 지출
  const expByCat = categoryTotals(current, "expense");
  const totalExpense = Object.values(expByCat).reduce((a, b) => a + b, 0) || 1;
  const topCategories = Object.entries(expByCat)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percent: (amount / totalExpense) * 100,
    }));

  // 전월 대비 카테고리 변화
  const prevByCat = categoryTotals(prev, "expense");
  const increased: string[] = [];
  const decreased: string[] = [];

  for (const [cat, amt] of Object.entries(expByCat)) {
    const prevAmt = prevByCat[cat] || 0;
    if (prevAmt > 0) {
      const changeRate = ((amt - prevAmt) / prevAmt) * 100;
      if (changeRate >= 30) increased.push(cat);
      if (changeRate <= -20) decreased.push(cat);
    }
  }

  // 인사이트 생성
  const insights: Insight[] = [];

  // 1. 저축률 분석
  if (income > 0) {
    if (savingsRate >= 50) {
      insights.push({
        type: "good",
        title: "훌륭한 저축률!",
        message: `이번 달 저축률이 ${savingsRate.toFixed(0)}%입니다. 수입의 절반 이상을 저축하고 있어요. 이 습관을 유지하세요!`,
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: "good",
        title: "건전한 저축률",
        message: `저축률 ${savingsRate.toFixed(0)}%로 안정적입니다. 전문가들이 권장하는 20% 이상을 달성하고 있어요.`,
      });
    } else if (savingsRate >= 0) {
      insights.push({
        type: "tip",
        title: "저축률 개선이 필요해요",
        message: `이번 달 저축률이 ${savingsRate.toFixed(0)}%입니다. 권장 저축률 20%를 목표로 월 ${format(Math.ceil((income * 0.2 - (income - expense)) / 1000) * 1000)}원을 추가 절약해보세요.`,
      });
    } else {
      insights.push({
        type: "warning",
        title: "지출이 수입을 초과했습니다",
        message: `이번 달 ${format(expense - income)}원이 초과 지출되었습니다. 불필요한 지출 항목을 점검해보세요.`,
      });
    }
  }

  // 2. 최대 지출 카테고리 분석
  if (topCategories.length > 0) {
    const top = topCategories[0];
    if (top.percent >= 50) {
      insights.push({
        type: "warning",
        title: `${top.category}에 지출이 집중됩니다`,
        message: `전체 지출의 ${top.percent.toFixed(0)}%가 ${top.category}입니다. 지출이 한 곳에 집중되면 예산 관리가 어려워져요. 분산을 고려해보세요.`,
      });
    } else if (top.percent >= 35) {
      insights.push({
        type: "tip",
        title: `${top.category} 지출 비중이 높아요`,
        message: `${top.category}가 전체 지출의 ${top.percent.toFixed(0)}%를 차지합니다. ${format(top.amount)}원 중 줄일 수 있는 부분이 있는지 살펴보세요.`,
      });
    }
  }

  // 3. 전월 대비 증가 카테고리
  for (const cat of increased) {
    const curAmt = expByCat[cat];
    const prevAmt = prevByCat[cat] || 0;
    const change = ((curAmt - prevAmt) / prevAmt) * 100;
    insights.push({
      type: "warning",
      title: `${cat} 지출이 전월 대비 ${change.toFixed(0)}% 증가`,
      message: `${cat} 지출이 ${format(prevAmt)}원 → ${format(curAmt)}원으로 ${format(curAmt - prevAmt)}원 증가했습니다. 일시적 지출인지 확인해보세요.`,
    });
  }

  // 4. 전월 대비 감소 카테고리 (칭찬)
  for (const cat of decreased) {
    const curAmt = expByCat[cat];
    const prevAmt = prevByCat[cat] || 0;
    const change = ((prevAmt - curAmt) / prevAmt) * 100;
    insights.push({
      type: "good",
      title: `${cat} 절약 성공!`,
      message: `${cat} 지출을 전월 대비 ${change.toFixed(0)}% 줄였습니다. ${format(prevAmt - curAmt)}원을 절약했어요!`,
    });
  }

  // 5. 전체 지출 전월 대비
  if (prevExpense > 0 && expense > 0) {
    const totalChange = ((expense - prevExpense) / prevExpense) * 100;
    if (totalChange >= 20) {
      insights.push({
        type: "warning",
        title: `총 지출이 전월 대비 ${totalChange.toFixed(0)}% 증가`,
        message: `지난달 ${format(prevExpense)}원에서 이번달 ${format(expense)}원으로 늘었습니다. 예산을 다시 점검해보세요.`,
      });
    } else if (totalChange <= -10) {
      insights.push({
        type: "good",
        title: `총 지출이 전월 대비 ${Math.abs(totalChange).toFixed(0)}% 감소`,
        message: `지난달 ${format(prevExpense)}원에서 이번달 ${format(expense)}원으로 줄었습니다. 좋은 흐름이에요!`,
      });
    }
  }

  // 6. 식비 비율 분석 (일반적으로 가장 큰 변동 가능 지출)
  const foodExpense = expByCat["식비"] || 0;
  if (income > 0 && foodExpense > 0) {
    const foodRatio = (foodExpense / income) * 100;
    if (foodRatio >= 30) {
      insights.push({
        type: "tip",
        title: "식비 비율이 높습니다",
        message: `식비가 수입의 ${foodRatio.toFixed(0)}%입니다. 도시락, 장보기, 식사 계획을 통해 줄여보세요. 외식 횟수를 주 1-2회로 제한하면 효과적이에요.`,
      });
    }
  }

  // 7. 쇼핑 패턴
  const shoppingExpense = expByCat["쇼핑"] || 0;
  if (income > 0 && shoppingExpense > 0) {
    const shopRatio = (shoppingExpense / income) * 100;
    if (shopRatio >= 15) {
      insights.push({
        type: "tip",
        title: "쇼핑 지출을 점검해보세요",
        message: `쇼핑에 ${format(shoppingExpense)}원(수입의 ${shopRatio.toFixed(0)}%)을 사용했습니다. 구매 전 24시간 대기 규칙을 적용해보세요. 충동구매를 줄이는 데 효과적입니다.`,
      });
    }
  }

  // 8. 데이터 부족 시
  if (current.length === 0) {
    insights.push({
      type: "tip",
      title: "데이터가 없습니다",
      message: "이번 달 거래 내역을 입력하면 맞춤 소비 분석과 절약 제안을 받을 수 있어요.",
    });
  } else if (income === 0 && expense > 0) {
    insights.push({
      type: "tip",
      title: "수입 내역을 등록해주세요",
      message: "수입을 등록하면 저축률, 지출 비율 등 더 정확한 분석이 가능합니다.",
    });
  }

  return {
    savingsRate,
    topCategories,
    monthOverMonth: { increased, decreased },
    insights,
  };
}
