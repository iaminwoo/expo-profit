"use client";

import { getDailySales } from "@/lib/daily-sales-storage";
import { AmountField, CalculatedAmountField } from "@/components/calculator-fields";
import { SchedulePickerModal } from "@/components/schedule-picker-modal";
import {
  getSavedExpo,
  saveExpo,
} from "@/lib/expo-storage";
import {
  calculateCosts,
  calculateProfitRate,
  calculateSales,
  getParticipationDays,
  toNumber,
} from "@/lib/calculations";
import { formatPercentage, formatWon } from "@/lib/format";
import { defaultCostItems, getCostItems } from "@/lib/cost-item-storage";
import { emptyCosts, emptySales, type CostBreakdown, type CostItem, type SalesBreakdown, type ScheduleRecord } from "@/lib/models";
import { getSchedules } from "@/lib/schedule-storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const salesFields = [
  { key: "cash", label: "현금매출 (계좌이체 + 현금)" },
  { key: "card", label: "카드매출" },
  { key: "refund", label: "환불/취소" },
] as const;

const initialSales = emptySales;
const initialCosts = emptyCosts;

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export default function Home() {
  const [expoId, setExpoId] = useState<string>();
  const [expoName, setExpoName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [sales, setSales] = useState<SalesBreakdown>(initialSales);
  const [costs, setCosts] = useState<CostBreakdown>(initialCosts);
  const [costItems, setCostItems] = useState<CostItem[]>(defaultCostItems);
  const [notes, setNotes] = useState("");
  const [isSalesOpen, setIsSalesOpen] = useState(true);
  const [isCostsOpen, setIsCostsOpen] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [scheduleId, setScheduleId] = useState<string>();
  const [isScheduleSelected, setIsScheduleSelected] = useState(false);
  const [saveError, setSaveError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCostItems(getCostItems());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

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

  const totalSales = calculateSales(sales);
  const { costOfGoods, totalCost } = calculateCosts(costs, totalSales);
  const profit = totalSales - totalCost;
  const profitMargin = calculateProfitRate(profit, totalSales);
  const returnOnCost = calculateProfitRate(profit, totalCost);
  const participationDays = getParticipationDays(startDate, endDate);

  function handleSave() {
    if (!scheduleId) return;

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
    if (!savedExpo) {
      setSaveError("저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해주세요.");
      return;
    }

    setSaveError("");
    setExpoId(savedExpo.id);
    router.push("/saved");
  }

  function openScheduleModal() {
    setSchedules(getSchedules());
    setIsScheduleModalOpen(true);
  }

  function selectSchedule(schedule: ScheduleRecord) {
    const dailySales = getDailySales(schedule.id)?.entries ?? [];
    const scheduleSales = dailySales.reduce((total, entry) => ({
      card: total.card + toNumber(entry.card),
      cash: total.cash + toNumber(entry.cash),
      refund: total.refund + toNumber(entry.refund),
    }), { card: 0, cash: 0, refund: 0 });

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
                        label={field.label}
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
                    <CalculatedAmountField label="원가 (매출 10%)" value={String(costOfGoods)} />
                    {costItems.map((item) => (
                      <AmountField
                        key={item.id}
                        id={item.id}
                        label={item.name}
                        value={costs[item.id] ?? ""}
                        onChange={(value) =>
                          setCosts((current) => ({
                            ...current,
                            [item.id]: value,
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
              <div className={styles.resultRow}>
                <span>매출이익률</span>
                <strong>{formatPercentage(profitMargin)}</strong>
              </div>
              <p className={styles.rateDescription}>
                매출 중 실제로 남은 비율입니다.
              </p>
              <div className={styles.resultRow}>
                <span>비용 대비 수익률</span>
                <strong>{formatPercentage(returnOnCost)}</strong>
              </div>
              <p className={styles.rateDescription}>
                쓴 돈에 비해 번 이익의 비율입니다.
              </p>
            </section>

            <div className={styles.saveArea}>
              <button
                className={styles.saveButton}
                type="button"
                onClick={handleSave}
              >
                저장하기
              </button>
              {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
            </div>
          </>
        )}
        {isScheduleModalOpen && <SchedulePickerModal schedules={schedules} onClose={() => setIsScheduleModalOpen(false)} onSelect={selectSchedule} />}
      </section>
    </main>
  );
}
