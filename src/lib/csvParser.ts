import { Transaction, EXPENSE_CATEGORIES } from "./types";

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
}

// 카테고리 자동 매핑 키워드
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  식비: ["식당", "음식", "치킨", "피자", "카페", "커피", "스타벅스", "맥도날드", "배달", "요기요", "배민", "쿠팡이츠", "편의점", "CU", "GS25", "세븐일레븐", "이마트", "롯데마트", "홈플러스", "마트", "반찬", "베이커리", "빵"],
  교통: ["주유", "택시", "버스", "지하철", "교통", "주차", "톨게이트", "고속도로", "카카오T", "타다", "기차", "KTX", "SRT"],
  쇼핑: ["쿠팡", "네이버", "옥션", "지마켓", "11번가", "SSG", "무신사", "올리브영", "다이소", "백화점", "아울렛", "의류", "신발"],
  통신: ["SKT", "KT", "LG U+", "통신", "인터넷", "휴대폰"],
  의료: ["병원", "약국", "의원", "치과", "안과", "피부과", "한의원", "건강"],
  교육: ["학원", "교육", "강의", "도서", "책", "교재", "인강", "클래스"],
  문화: ["영화", "CGV", "메가박스", "롯데시네마", "공연", "전시", "넷플릭스", "유튜브", "게임", "노래방"],
  주거: ["관리비", "전기", "가스", "수도", "월세", "보험"],
  경조사: ["축의금", "조의금", "선물", "화환", "돌잔치"],
};

function guessCategory(description: string): string {
  const desc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => desc.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return "기타지출";
}

// 날짜 포맷 정규화 -> YYYY-MM-DD
function normalizeDate(raw: string): string | null {
  const cleaned = raw.trim().replace(/\./g, "-").replace(/\//g, "-");

  // YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  const match1 = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match1) {
    return `${match1[1]}-${match1[2].padStart(2, "0")}-${match1[3].padStart(2, "0")}`;
  }

  // YYYYMMDD
  const match2 = cleaned.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match2) {
    return `${match2[1]}-${match2[2]}-${match2[3]}`;
  }

  return null;
}

// 금액 파싱 (콤마, 원, 공백 제거)
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[,\s원₩]/g, "").replace(/−/g, "-");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

// 하나카드 CSV 헤더 패턴
const HANA_HEADERS = ["이용일", "이용가맹점", "이용금액"];
const GENERIC_DATE_HEADERS = ["날짜", "일자", "거래일", "거래일자", "이용일", "이용일자", "결제일", "승인일"];
const GENERIC_DESC_HEADERS = ["내용", "적요", "가맹점", "이용가맹점", "거래처", "메모", "비고", "상세내용", "거래내용"];
const GENERIC_AMOUNT_HEADERS = ["금액", "이용금액", "거래금액", "결제금액", "출금", "출금액", "지출", "입금", "입금액", "수입"];
const GENERIC_INCOME_HEADERS = ["입금", "입금액", "수입"];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

interface ColumnMap {
  date: number;
  description: number;
  amount: number;
  incomeAmount: number | null; // 입금/출금 별도 컬럼이 있을 때
}

function detectColumns(headers: string[]): ColumnMap | null {
  let date = -1;
  let description = -1;
  let amount = -1;
  let incomeAmount: number | null = null;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].trim();

    if (date === -1 && GENERIC_DATE_HEADERS.some((dh) => h.includes(dh))) {
      date = i;
    }
    if (description === -1 && GENERIC_DESC_HEADERS.some((dh) => h.includes(dh))) {
      description = i;
    }
    if (amount === -1 && GENERIC_AMOUNT_HEADERS.some((ah) => h.includes(ah))) {
      // 입금 컬럼인지 확인
      if (GENERIC_INCOME_HEADERS.some((ih) => h.includes(ih))) {
        incomeAmount = i;
      } else {
        amount = i;
      }
    }
  }

  // 입금만 있고 출금이 없으면 입금을 메인으로
  if (amount === -1 && incomeAmount !== null) {
    amount = incomeAmount;
    incomeAmount = null;
  }

  if (date === -1 || amount === -1) return null;
  if (description === -1) {
    // 설명 컬럼이 없으면 날짜 다음 컬럼 사용
    description = date + 1 < headers.length ? date + 1 : date;
  }

  return { date, description, amount, incomeAmount };
}

export function parseCSV(content: string): {
  transactions: Omit<Transaction, "id">[];
  errors: string[];
} {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { transactions: [], errors: ["파일에 데이터가 부족합니다."] };
  }

  // 헤더 찾기 (처음 5줄 안에서 검색 - 일부 CSV는 상단에 메타 정보가 있음)
  let headerIndex = -1;
  let columns: ColumnMap | null = null;

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cells = parseCSVLine(lines[i]);
    const detected = detectColumns(cells);
    if (detected) {
      headerIndex = i;
      columns = detected;
      break;
    }
  }

  if (headerIndex === -1 || !columns) {
    return {
      transactions: [],
      errors: [
        "CSV 헤더를 인식할 수 없습니다. 날짜, 내용(가맹점), 금액 컬럼이 필요합니다.",
      ],
    };
  }

  const transactions: Omit<Transaction, "id">[] = [];
  const errors: string[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length <= Math.max(columns.date, columns.amount)) continue;

    const dateRaw = cells[columns.date];
    const date = normalizeDate(dateRaw);
    if (!date) {
      errors.push(`${i + 1}행: 날짜를 인식할 수 없습니다 (${dateRaw})`);
      continue;
    }

    const amountRaw = cells[columns.amount];
    const amount = parseAmount(amountRaw);
    if (amount === 0) continue; // 0원 거래 무시

    const desc = cells[columns.description] || "";

    // 입금/출금 판별
    let type: "income" | "expense" = "expense";
    if (columns.incomeAmount !== null) {
      const incomeVal = parseAmount(cells[columns.incomeAmount] || "0");
      if (incomeVal > 0 && amount === 0) {
        type = "income";
      }
    } else {
      // 음수면 지출, 양수인데 입금 키워드가 있으면 수입
      const rawCleaned = amountRaw.replace(/[,\s원₩]/g, "");
      if (rawCleaned.startsWith("-") || rawCleaned.startsWith("−")) {
        type = "expense";
      }
    }

    const category = type === "expense" ? guessCategory(desc) : "기타수입";

    transactions.push({
      type,
      amount: columns.incomeAmount !== null && type === "income"
        ? parseAmount(cells[columns.incomeAmount] || "0")
        : amount,
      category,
      description: desc,
      date,
    });
  }

  return { transactions, errors };
}
