"use client";

import { useState, useRef } from "react";
import { Transaction } from "@/lib/types";
import { parseCSV } from "@/lib/csvParser";

interface CsvUploadProps {
  onImport: (transactions: Omit<Transaction, "id">[]) => void;
}

export default function CsvUpload({ onImport }: CsvUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<Omit<Transaction, "id">[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [detectedFormat, setDetectedFormat] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    // UTF-8과 EUC-KR 두 가지로 파싱 시도 후 더 나은 결과 사용
    const tryParse = (encoding: string) =>
      new Promise<ReturnType<typeof parseCSV>>((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve(parseCSV(e.target?.result as string));
        r.readAsText(file, encoding);
      });

    Promise.all([tryParse("utf-8"), tryParse("euc-kr")]).then(([utf8, euckr]) => {
      const best = utf8.transactions.length >= euckr.transactions.length ? utf8 : euckr;
      setPreview(best.transactions);
      setErrors(best.errors);
      setDetectedFormat(best.detectedFormat);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
      setIsOpen(false);
      setPreview(null);
      setErrors([]);
      setFileName("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreview(null);
    setErrors([]);
    setFileName("");
    setDetectedFormat("");
  };

  const format = (n: number) => n.toLocaleString("ko-KR");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl border border-[rgba(180,0,255,0.3)] text-[#b400ff] hover:border-[#b400ff] hover:shadow-[0_0_20px_rgba(180,0,255,0.15)] transition-all font-medium cursor-pointer tracking-wider text-sm bg-transparent"
      >
        ↑ CSV UPLOAD
      </button>
    );
  }

  return (
    <div className="cyber-card rounded-xl p-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#b400ff] via-[#00f0ff] to-[#b400ff]" />

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-[#b400ff] tracking-wider">
          CSV IMPORT
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-[#ff00aa] cursor-pointer text-lg"
        >
          ×
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#00f0ff] bg-[rgba(0,240,255,0.05)] shadow-[0_0_20px_rgba(0,240,255,0.1)]"
            : "border-[rgba(255,255,255,0.15)] hover:border-[rgba(0,240,255,0.4)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        {fileName ? (
          <div>
            <p className="text-[#00f0ff] font-medium">{fileName}</p>
            <p className="text-xs text-gray-500 mt-1">다른 파일을 선택하려면 클릭</p>
          </div>
        ) : (
          <div>
            <p className="text-2xl mb-2 opacity-50">📂</p>
            <p className="text-sm text-gray-400">
              CSV 파일을 드래그하거나 클릭하여 선택
            </p>
            <p className="text-xs text-gray-600 mt-2">
              하나은행, 하나카드, 국민은행, 신한카드 등 지원
            </p>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-[rgba(255,68,0,0.1)] border border-[rgba(255,68,0,0.3)] rounded-lg p-3">
          <p className="text-xs text-[#ff4400] font-medium mb-1 tracking-wider">WARNINGS</p>
          {errors.slice(0, 3).map((err, i) => (
            <p key={i} className="text-xs text-[#ff8866]">{err}</p>
          ))}
          {errors.length > 3 && (
            <p className="text-xs text-gray-500 mt-1">
              외 {errors.length - 3}건
            </p>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 tracking-wider">
              PREVIEW — {preview.length}건 감지됨
            </p>
            {detectedFormat && (
              <span className="text-[10px] text-[#b400ff] px-2 py-0.5 rounded-full border border-[rgba(180,0,255,0.3)] bg-[rgba(180,0,255,0.1)]">
                {detectedFormat}
              </span>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {preview.slice(0, 20).map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(0,0,0,0.3)] text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-1.5 h-4 rounded-full shrink-0 ${
                      t.type === "income"
                        ? "bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]"
                        : "bg-[#ff00aa] shadow-[0_0_4px_#ff00aa]"
                    }`}
                  />
                  <span className="text-xs text-gray-500 shrink-0">{t.date}</span>
                  <span className="text-[#c0c0e0] truncate text-xs">{t.description}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)]">
                    {t.category}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      t.type === "income" ? "text-[#00f0ff]" : "text-[#ff00aa]"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}{format(t.amount)}
                  </span>
                </div>
              </div>
            ))}
            {preview.length > 20 && (
              <p className="text-xs text-gray-600 text-center py-1">
                외 {preview.length - 20}건...
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            className="w-full mt-4 py-3 rounded-lg bg-[#b400ff] text-white font-medium hover:shadow-[0_0_20px_rgba(180,0,255,0.4)] transition-all cursor-pointer tracking-wider text-sm"
          >
            {preview.length}건 가져오기
          </button>
        </div>
      )}

      {preview && preview.length === 0 && fileName && (
        <div className="text-center py-4">
          <p className="text-[#ff4400] text-sm">인식된 거래내역이 없습니다</p>
          <p className="text-xs text-gray-500 mt-1">
            CSV 파일에 날짜, 내용, 금액 컬럼이 있는지 확인해주세요
          </p>
        </div>
      )}
    </div>
  );
}
