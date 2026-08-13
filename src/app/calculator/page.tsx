"use client";

import { getDailySales } from "@/lib/daily-sales-storage";
import {
  getSavedExpo,
  saveExpo,
  type ExpoCosts,
  type ExpoSales,
} from "@/lib/expo-storage";
import { getSchedules, type ScheduleRecord } from "@/lib/schedule-storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const salesFields = [
  { key: "card", label: "카드매출" },
  { key: "cash", label: "현금매출" },
  { key: "refund", label: "환불/취소" },
] as const;

const costFields = [
  { key: "participationFee", label: "참가비" },
  { key: "transportation", label: "교통비" },
  { key: "accommodation", label: "숙박비" },
  { key: "logistics", label: "주차/화물/주유비" },
  { key: "labor", label: "인건비" },
  { key: "paymentFee", label: "결제수수료" },
  { key: "booth", label: "부스/인쇄물/샘플 비용" },
  { key: "other", label: "기타 비용" },
] as const;

const initialSales: ExpoSales = { card: "", cash: "", refund: "" };
const initialCosts: ExpoCosts = {
  participationFee: "",
  transportation: "",
  accommodation: "",
  logistics: "",
  labor: "",
  paymentFee: "",
  booth: "",
  other: "",
};

const toNumber = (value: string) => Number(value) || 0;
const formatWon = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)} 원`;

function formatReadableWon(value: string) {
  const amount = toNumber(value);
  if (!value || amount <= 0) return "";

  const eok = Math.floor(amount / 100_000_000);
  const afterEok = amount % 100_000_000;
  const man = Math.floor(afterEok / 10_000);
  const won = afterEok % 10_000;
  const parts: string[] = [];

  if (eok) parts.push(`${eok}억`);
  if (man)
    parts.push(man >= 100 && man % 100 === 0 ? `${man / 100}백만` : `${man}만`);
  if (won) parts.push(new Intl.NumberFormat("ko-KR").format(won));

  return `${parts.join(" ")}원`;
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

type AmountFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

function AmountField({
  id,
  label,
  value,
  onChange,
  readOnly = false,
}: AmountFieldProps) {
  const readableValue = formatReadableWon(value);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div>
        <div className={styles.amountInput}>
          <input
            id={id}
            type="number"
            min="0"
            step="1000"
            inputMode="numeric"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="0"
            readOnly={readOnly}
          />
          <span>원</span>
        </div>
        {readableValue && (
          <p className={styles.amountReading}>{readableValue}</p>
        )}
      </div>
    </div>
  );
}

function CalculatedAmountField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const amount = toNumber(value);

  return (
    <div className={styles.field}>
      <label>{label}</label>
      <div>
        <p className={styles.calculatedAmount}>{formatWon(amount)}</p>
        {amount > 0 && (
          <p className={styles.amountReading}>{formatReadableWon(value)}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [expoId, setExpoId] = useState<string>();
  const [expoName, setExpoName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [sales, setSales] = useState(initialSales);
  const [costs, setCosts] = useState(initialCosts);
  const [notes, setNotes] = useState("");
  const [isSalesOpen, setIsSalesOpen] = useState(true);
  const [isCostsOpen, setIsCostsOpen] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [scheduleId, setScheduleId] = useState<string>();
  const [isScheduleSelected, setIsScheduleSelected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("expo");
    if (!id) return;

    const expo = getSavedExpo(id);
    if (!expo) return;

    const timer = window.setTimeout(() => {
      setExpoId(expo.id);
      setScheduleId(expo.scheduleId);
      setExpoName(expo.expoName);
      setStartDate(expo.startDate);
      setEndDate(expo.endDate);
      setLocation(expo.location);
      setSales(expo.sales);
      setCosts(expo.costs);
      setNotes(expo.notes);
      setIsScheduleSelected(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const totalSales =
    toNumber(sales.card) + toNumber(sales.cash) - toNumber(sales.refund);
  const costOfGoods = Math.round(totalSales * 0.1);
  const totalCost = costFields.reduce(
    (total, field) => total + toNumber(costs[field.key]),
    costOfGoods,
  );
  const profit = totalSales - totalCost;
  const participationDays =
    startDate && endDate
      ? Math.floor(
          (Date.parse(`${endDate}T00:00:00Z`) -
            Date.parse(`${startDate}T00:00:00Z`)) /
            86_400_000,
        ) + 1
      : null;

  function handleSave() {
    const savedExpo = saveExpo(
      {
        scheduleId,
        expoName,
        startDate,
        endDate,
        location,
        sales,
        costs,
        notes,
      },
      expoId,
    );
    setExpoId(savedExpo.id);
    router.push("/saved");
  }

  function openScheduleModal() {
    setSchedules(getSchedules());
    setIsScheduleModalOpen(true);
  }

  function selectSchedule(schedule: ScheduleRecord) {
    const dailySales = getDailySales(schedule.id)?.entries ?? [];
    const scheduleSales = dailySales.reduce(
      (total, entry) => ({
        card: total.card + toNumber(entry.card ?? entry.sales ?? ""),
        cash: total.cash + toNumber(entry.cash),
        refund: total.refund + toNumber(entry.refund),
      }),
      { card: 0, cash: 0, refund: 0 },
    );

    setExpoId(undefined);
    setScheduleId(schedule.id);
    setExpoName(schedule.expoName);
    setStartDate(schedule.startDate);
    setEndDate(schedule.endDate);
    setLocation(schedule.location);
    setSales({
      card: String(scheduleSales.card),
      cash: String(scheduleSales.cash),
      refund: String(scheduleSales.refund),
    });
    setIsScheduleSelected(true);
    setIsScheduleModalOpen(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <p className={styles.eyebrow}>EXPO PROFIT</p>
            <Link className={styles.homeLink} href="/">
              홈으로 돌아가기
            </Link>
          </div>
          <h1>박람회 수익 계산기</h1>
          <p>박람회 한 번의 매출, 비용, 순이익을 한곳에서 확인해 보세요.</p>
        </header>

        {!isScheduleSelected && (
          <div className={styles.schedulePicker}>
            <p className={styles.scheduleGuide}>
              비용을 입력하려면 박람회 일정을 선택해주세요.
            </p>
            <button
              className={styles.scheduleSelectButton}
              type="button"
              onClick={openScheduleModal}
            >
              박람회 일정 선택
            </button>
          </div>
        )}

        {isScheduleSelected && (
          <>
            <section className={styles.selectedSchedule}>
              <div className={styles.scheduleInfo}>
                <div>
                  <span>박람회명</span>
                  <strong>{expoName || "이름 없는 행사"}</strong>
                </div>
                <div>
                  <span>행사기간</span>
                  <strong>
                    {[startDate, endDate].filter(Boolean).join(" ~ ") ||
                      "기간 미입력"}
                    {participationDays !== null && participationDays > 0
                      ? ` · ${participationDays}일`
                      : ""}
                  </strong>
                </div>
                <div>
                  <span>장소</span>
                  <strong>{location || "장소 미입력"}</strong>
                </div>
              </div>
              <button
                className={styles.changeScheduleButton}
                type="button"
                onClick={openScheduleModal}
              >
                변경
              </button>
            </section>
            <div className={styles.card}>
              <section className={styles.formSection}>
                <h2>
                  <button
                    className={styles.sectionHeading}
                    type="button"
                    onClick={() => setIsSalesOpen((isOpen) => !isOpen)}
                    aria-expanded={isSalesOpen}
                    aria-controls="sales-details"
                  >
                    <span>매출</span>
                    <span
                      className={isSalesOpen ? styles.arrowOpen : styles.arrow}
                    >
                      ▾
                    </span>
                  </button>
                </h2>
                <div
                  id="sales-details"
                  className={`${styles.collapsible} ${isSalesOpen ? styles.collapsibleOpen : ""}`}
                  inert={!isSalesOpen}
                >
                  <div className={styles.collapsibleInner}>
                    {salesFields.map((field) => (
                      <CalculatedAmountField
                        key={field.key}
                        label={`${field.label}`}
                        value={sales[field.key]}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.sectionTotal}>
                  <span>총매출</span>
                  <strong>{formatWon(totalSales)}</strong>
                </div>
              </section>

              <section className={styles.formSection}>
                <h2>
                  <button
                    className={styles.sectionHeading}
                    type="button"
                    onClick={() => setIsCostsOpen((isOpen) => !isOpen)}
                    aria-expanded={isCostsOpen}
                    aria-controls="cost-details"
                  >
                    <span>비용</span>
                    <span
                      className={isCostsOpen ? styles.arrowOpen : styles.arrow}
                    >
                      ▾
                    </span>
                  </button>
                </h2>
                <div
                  id="cost-details"
                  className={`${styles.collapsible} ${isCostsOpen ? styles.collapsibleOpen : ""}`}
                  inert={!isCostsOpen}
                >
                  <div className={styles.collapsibleInner}>
                    <div className={styles.field}>
                      <label>원가 (매출 10%)</label>
                      <div>
                        <p
                          className={styles.calculatedAmount}
                          aria-live="polite"
                        >
                          {formatWon(costOfGoods)}
                        </p>
                        {costOfGoods > 0 && (
                          <p className={styles.amountReading}>
                            {formatReadableWon(String(costOfGoods))}
                          </p>
                        )}
                      </div>
                    </div>
                    {costFields.map((field) => (
                      <AmountField
                        key={field.key}
                        id={field.key}
                        label={field.label}
                        value={costs[field.key]}
                        onChange={(value) =>
                          setCosts((current) => ({
                            ...current,
                            [field.key]: value,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.sectionTotal}>
                  <span>총비용</span>
                  <strong>{formatWon(totalCost)}</strong>
                </div>
              </section>

              <section className={styles.formSection}>
                <h2>특이사항</h2>
                <div className={styles.field}>
                  <label htmlFor="notes">내용</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    onInput={(event) => resizeTextarea(event.currentTarget)}
                    placeholder="내용을 자유롭게 입력하세요."
                    rows={1}
                  />
                </div>
              </section>
            </div>

            <section className={styles.result} aria-live="polite">
              <h2 className={styles.resultTitle}>
                {expoName ? `${expoName} 계산 결과` : "계산 결과"}
              </h2>
              <div className={styles.resultRow}>
                <span>총매출</span>
                <strong>{formatWon(totalSales)}</strong>
              </div>
              <div className={styles.resultRow}>
                <span>총비용</span>
                <strong>{formatWon(totalCost)}</strong>
              </div>
              <div className={styles.profitRow}>
                <span>순이익</span>
                <strong className={profit < 0 ? styles.loss : undefined}>
                  {formatWon(profit)}
                </strong>
              </div>
            </section>

            <div className={styles.saveArea}>
              <button
                className={styles.saveButton}
                type="button"
                onClick={handleSave}
              >
                저장하기
              </button>
            </div>
          </>
        )}
        {isScheduleModalOpen && (
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={() => setIsScheduleModalOpen(false)}
          >
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2 id="schedule-modal-title">박람회 일정 선택</h2>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setIsScheduleModalOpen(false)}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
              {schedules.length ? (
                <div className={styles.scheduleList}>
                  {schedules.map((schedule) => (
                    <button
                      className={styles.scheduleOption}
                      type="button"
                      key={schedule.id}
                      onClick={() => selectSchedule(schedule)}
                    >
                      <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                      <span>
                        {[schedule.startDate, schedule.endDate]
                          .filter(Boolean)
                          .join(" ~ ") || "기간 미입력"}
                      </span>
                      <span>{schedule.location || "장소 미입력"}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.modalEmpty}>
                  저장된 일정이 없습니다. 일정 생성에서 먼저 행사를 등록해
                  주세요.
                </p>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
