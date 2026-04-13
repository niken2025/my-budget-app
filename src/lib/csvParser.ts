import { Transaction } from "./types";

// 카테고리 자동 매핑 키워드
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  식비: ["식당", "음식", "치킨", "피자", "카페", "커피", "스타벅스", "맥도날드", "배달", "요기요", "배민", "쿠팡이츠", "편의점", "CU", "GS25", "세븐일레븐", "이마트", "롯데마트", "홈플러스", "마트", "반찬", "베이커리", "빵", "롯데리아", "버거킹", "서브웨이"],
  교통: ["주유", "택시", "버스", "지하철", "교통", "주차", "톨게이트", "고속도로", "카카오T", "타다", "기차", "KTX", "SRT", "자동차", "하이패스"],
  쇼핑: ["쿠팡", "네이버", "옥션", "지마켓", "11번가", "SSG", "무신사", "올리브영", "다이소", "백화점", "아울렛", "의류", "신발", "쇼핑"],
  통신: ["SKT", "KT", "LG U+", "통신", "인터넷", "휴대폰", "알뜰폰"],
  의료: ["병원", "약국", "의원", "치과", "안과", "피부과", "한의원", "건강", "클리닉"],
  교육: ["학원", "교육", "강의", "도서", "책", "교재", "인강", "클래스", "학교", "등록금"],
  문화: ["영화", "CGV", "메가박스", "롯데시네마", "공연", "전시", "넷플릭스", "유튜브", "게임", "노래방", "헬스", "체육관", "스포츠"],
  주거: ["관리비", "전기", "가스", "수도", "월세", "보험", "아파트", "임대료"],
  경조사: ["축의금", "조의금", "선물", "화환", "돌잔치"],
};

const INCOME_KEYWORDS = ["급여", "월급", "상여", "보너스", "이자", "배당", "환급", "입금", "송금받", "용돈"];

function guessCategory(description: string, type: "income" | "expense"): string {
  if (type === "income") {
    const desc = description.toLowerCase();
    if (["급여", "월급", "상여", "보너스"].some((k) => desc.includes(k))) return "급여";
    if (["이자", "배당"].some((k) => desc.includes(k))) return "투자";
    if (["용돈"].some((k) => desc.includes(k))) return "용돈";
    return "기타수입";
  }

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
  const cleaned = raw.replace(/[,\s원₩"]/g, "").replace(/−/g, "-");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

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
      } else if (ch === "," || ch === "\t") {
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

// ─── 헤더 키워드 ───────────────────────────────────

// 날짜
const DATE_KEYWORDS = [
  "거래일시", "거래일자", "거래일", "이용일시", "이용일자", "이용일",
  "날짜", "일자", "결제일", "승인일", "처리일",
];

// 설명/적요
const DESC_KEYWORDS = [
  "적요", "거래내용", "내용", "상세내용", "이용가맹점", "가맹점",
  "가맹점명", "거래처", "메모", "비고", "거래기록", "통장메모",
  "기재내용", "거래점",
];

// 출금 (지출)
const WITHDRAW_KEYWORDS = [
  "출금", "출금액", "출금금액", "지출", "지출액", "지출금액",
  "찾으신금액", "이용금액", "결제금액", "거래금액", "금액",
];

// 입금 (수입)
const DEPOSIT_KEYWORDS = [
  "입금", "입금액", "입금금액", "맡기신금액", "수입",
];

interface ColumnMap {
  date: number;
  description: number;
  withdraw: number;       // 출금(지출) 컬럼
  deposit: number | null; // 입금(수입) 컬럼 (분리형일 때)
}

function detectColumns(headers: string[]): ColumnMap | null {
  let date = -1;
  let description = -1;
  let withdraw = -1;
  let deposit: number | null = null;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].trim().replace(/\s+/g, "");

    // 날짜 컬럼
    if (date === -1 && DATE_KEYWORDS.some((k) => h.includes(k))) {
      date = i;
    }

    // 설명 컬럼
    if (description === -1 && DESC_KEYWORDS.some((k) => h.includes(k))) {
      description = i;
    }

    // 입금 컬럼 (출금보다 먼저 체크 — "입금"이 "금"을 포함하므로)
    if (deposit === null && DEPOSIT_KEYWORDS.some((k) => h.includes(k))) {
      deposit = i;
      continue;
    }

    // 출금 컬럼
    if (withdraw === -1 && WITHDRAW_KEYWORDS.some((k) => h.includes(k))) {
      withdraw = i;
    }
  }

  // 출금 컬럼이 없으면 입금 컬럼을 메인으로 사용
  if (withdraw === -1 && deposit !== null) {
    withdraw = deposit;
    deposit = null;
  }

  if (date === -1 || withdraw === -1) return null;

  // 설명 컬럼이 없으면 날짜 다음 컬럼
  if (description === -1) {
    description = date + 1 < headers.length ? date + 1 : date;
  }

  return { date, description, withdraw, deposit };
}

export function parseCSV(content: string): {
  transactions: Omit<Transaction, "id">[];
  errors: string[];
  detectedFormat: string;
} {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { transactions: [], errors: ["파일에 데이터가 부족합니다."], detectedFormat: "" };
  }

  // 헤더 찾기 (처음 10줄 안에서 검색 — 하나은행은 상단에 계좌정보 등 메타가 있음)
  let headerIndex = -1;
  let columns: ColumnMap | null = null;
  let headerCells: string[] = [];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const cells = parseCSVLine(lines[i]);
    const detected = detectColumns(cells);
    if (detected) {
      headerIndex = i;
      columns = detected;
      headerCells = cells;
      break;
    }
  }

  if (headerIndex === -1 || !columns) {
    return {
      transactions: [],
      errors: [
        "CSV 헤더를 인식할 수 없습니다. 날짜, 내용(적요), 금액(출금/입금) 컬럼이 필요합니다.",
      ],
      detectedFormat: "",
    };
  }

  // 포맷 감지
  const headerJoined = headerCells.join(" ");
  let detectedFormat = "일반";
  if (headerJoined.includes("맡기신") || headerJoined.includes("찾으신")) {
    detectedFormat = "하나은행";
  } else if (headerJoined.includes("이용가맹점") || headerJoined.includes("이용일")) {
    detectedFormat = "카드사 (하나카드 등)";
  } else if (columns.deposit !== null) {
    detectedFormat = "은행 (출금/입금 분리형)";
  }

  const transactions: Omit<Transaction, "id">[] = [];
  const errors: string[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length <= columns.date) continue;

    const dateRaw = cells[columns.date];
    const date = normalizeDate(dateRaw);
    if (!date) {
      // 빈 줄이나 합계 줄은 무시
      if (dateRaw && !dateRaw.includes("합계") && !dateRaw.includes("총")) {
        errors.push(`${i + 1}행: 날짜 인식 불가 (${dateRaw})`);
      }
      continue;
    }

    const desc = cells[columns.description] || "";

    // 출금/입금 분리형 (하나은행 등)
    if (columns.deposit !== null) {
      const withdrawAmt = parseAmount(cells[columns.withdraw] || "0");
      const depositAmt = parseAmount(cells[columns.deposit] || "0");

      if (withdrawAmt === 0 && depositAmt === 0) continue;

      if (depositAmt > 0) {
        transactions.push({
          type: "income",
          amount: depositAmt,
          category: guessCategory(desc, "income"),
          description: desc,
          date,
        });
      }

      if (withdrawAmt > 0) {
        transactions.push({
          type: "expense",
          amount: withdrawAmt,
          category: guessCategory(desc, "expense"),
          description: desc,
          date,
        });
      }
    } else {
      // 단일 금액 컬럼
      const amountRaw = cells[columns.withdraw] || "0";
      const amount = parseAmount(amountRaw);
      if (amount === 0) continue;

      // 음수면 지출
      const rawCleaned = amountRaw.replace(/[,\s원₩"]/g, "");
      const isNegative = rawCleaned.startsWith("-") || rawCleaned.startsWith("−");
      const isIncome = !isNegative && INCOME_KEYWORDS.some((k) => desc.includes(k));
      const type = isIncome ? "income" as const : "expense" as const;

      transactions.push({
        type,
        amount,
        category: guessCategory(desc, type),
        description: desc,
        date,
      });
    }
  }

  return { transactions, errors, detectedFormat };
}
