"use client";

import { AmountField, CalculatedAmountField } from "@/components/calculator-fields";
import { CollapsibleSection } from "@/components/collapsible-section";
import { SchedulePickerModal } from "@/components/schedule-picker-modal";
import { ProfitAnalysisSection } from "@/components/profit-analysis-section";
import {
  getSavedExpo,
  saveExpo,
} from "@/lib/expo-storage";
import {
  calculateCosts,
  calculateSales,
  getParticipationDays,
} from "@/lib/calculations";
import { formatWon } from "@/lib/format";
import { defaultCostItems, getCostItems } from "@/lib/cost-item-storage";
import { useHydratedState } from "@/hooks/use-hydrated-state";
import { getProfitSource } from "@/lib/profit-source";
import { createProfitAnalysis } from "@/lib/profit-analysis";
import { emptyCosts, emptySales, type CostBreakdown, type CostItem, type SalesBreakdown, type ScheduleRecord } from "@/lib/models";
import { getSchedules } from "@/lib/schedule-storage";
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
  const [schedule, setSchedule] = useState<ScheduleRecord>();
  const [sales, setSales] = useState<SalesBreakdown>(initialSales);
  const [costs, setCosts] = useState<CostBreakdown>(initialCosts);
  const { value: costItems } = useHydratedState<CostItem[]>(defaultCostItems, getCostItems);
  const [notes, setNotes] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveError, setSaveError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const id = new URLSearchParams(window.location.search).get("expo");
      const expo = id ? getSavedExpo(id) : undefined;
      const source = expo ? getProfitSource(expo.scheduleId) : undefined;

      if (expo && source?.schedule) {
        setExpoId(expo.id);
        setSchedule(source.schedule);
        setSales(source.sales);
        setCosts(expo.costs);
        setNotes(expo.notes);
      }

      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const totalSales = calculateSales(sales);
  const { costOfGoods, totalCost } = calculateCosts(costs, totalSales);
  const targetSales = Number(schedule?.estimatedSales) || 0;
  const expectedCost = calculateCosts(schedule?.estimatedCosts ?? emptyCosts, targetSales).totalCost;
  const profit = totalSales - totalCost;
  const profitAnalysis = createProfitAnalysis({
    targetSales,
    expectedCosts: expectedCost,
    actualSales: totalSales,
    actualCosts: totalCost,
  });
  const participationDays = getParticipationDays(schedule?.startDate ?? "", schedule?.endDate ?? "");

  function handleSave() {
    if (!schedule) return;

    const savedExpo = saveExpo(
      {
        scheduleId: schedule.id,
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
    const source = getProfitSource(schedule.id);

    setExpoId(undefined);
    setSchedule(schedule);
    setSales(source.sales);
    setCosts(initialCosts);
    setNotes("");
    setIsScheduleModalOpen(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO PROFIT</p>
          <h1>박람회 수익 계산기</h1>
          <p>박람회 한 번의 매출, 비용, 순이익을 한곳에서 확인해 보세요.</p>
        </header>

        {isHydrated && !schedule && (
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

        {isHydrated && schedule && (
          <>
            <section className={styles.selectedSchedule}>
              <div className={styles.scheduleInfo}>
                <div>
                  <span>박람회명</span>
                  <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                </div>
                <div>
                  <span>행사기간</span>
                  <strong>
                    {[schedule.startDate, schedule.endDate].filter(Boolean).join(" ~ ") ||
                      "기간 미입력"}
                    {participationDays !== null && participationDays > 0
                      ? ` · ${participationDays}일`
                      : ""}
                  </strong>
                </div>
                <div>
                  <span>장소</span>
                  <strong>{schedule.location || "장소 미입력"}</strong>
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
                <CollapsibleSection
                  id="sales-details"
                  title="매출"
                  heading="h2"
                >
                  {salesFields.map((field) => (
                    <CalculatedAmountField
                      key={field.key}
                      label={field.label}
                      value={sales[field.key]}
                    />
                  ))}
                </CollapsibleSection>
                <div className={styles.sectionTotal}>
                  <span>총매출</span>
                  <strong>{formatWon(totalSales)}</strong>
                </div>
              </section>

              <section className={styles.formSection}>
                <CollapsibleSection
                  id="cost-details"
                  title="비용"
                  heading="h2"
                  defaultOpen
                >
                  <CalculatedAmountField label="원가 (매출 10%)" value={String(costOfGoods)} />
                  {costItems.map((item) => (
                    <AmountField
                      key={item.id}
                      id={item.id}
                      label={item.name}
                      value={costs[item.id] ?? ""}
                      expectedValue={schedule.estimatedCosts?.[item.id]}
                      onChange={(value) =>
                        setCosts((current) => ({
                          ...current,
                          [item.id]: value,
                        }))
                      }
                    />
                  ))}
                </CollapsibleSection>
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
                {schedule.expoName ? `${schedule.expoName} 계산 결과` : "계산 결과"}
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

            <ProfitAnalysisSection analysis={profitAnalysis} />

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
