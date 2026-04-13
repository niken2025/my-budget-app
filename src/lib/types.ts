export type TransactionType = "income" | "expense";

export type ViewMode = "home" | "dashboard";
export type DashboardPeriod = "monthly" | "yearly";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
}

export const INCOME_CATEGORIES = [
  "급여",
  "부수입",
  "용돈",
  "투자",
  "기타수입",
];

export const EXPENSE_CATEGORIES = [
  "식비",
  "교통",
  "주거",
  "통신",
  "의료",
  "교육",
  "쇼핑",
  "문화",
  "경조사",
  "기타지출",
];
