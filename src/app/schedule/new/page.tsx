"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CollapsibleSection } from "@/components/collapsible-section";
import { MoneyInput } from "@/components/money-input";
import { calculateCosts, getParticipationDays } from "@/lib/calculations";
import { defaultCostItems, getCostItems } from "@/lib/cost-item-storage";
import { useHydratedState } from "@/hooks/use-hydrated-state";
import { formatReadableWon, formatWon } from "@/lib/format";
import { emptyCosts, type CostBreakdown, type CostItem } from "@/lib/models";
import { getSchedule, saveSchedule } from "@/lib/schedule-storage";
import styles from "./page.module.css";

export default function ScheduleFormPage() {
  const router = useRouter();
  const [scheduleId, setScheduleId] = useState<string>();
  const [expoName, setExpoName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedSales, setEstimatedSales] = useState("");
  const [estimatedCosts, setEstimatedCosts] = useState<CostBreakdown>(emptyCosts);
  const { value: costItems } = useHydratedState<CostItem[]>(defaultCostItems, getCostItems);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveError, setSaveError] = useState("");
  const participationDays = getParticipationDays(startDate, endDate);
  const { costOfGoods, totalCost } = calculateCosts(estimatedCosts, Number(estimatedSales) || 0);
  const estimatedProfit = (Number(estimatedSales) || 0) - totalCost;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const id = new URLSearchParams(window.location.search).get("schedule");
      const schedule = id ? getSchedule(id) : undefined;

      if (schedule) {
        setScheduleId(schedule.id);
        setExpoName(schedule.expoName);
        setStartDate(schedule.startDate);
        setEndDate(schedule.endDate);
        setLocation(schedule.location);
        setEstimatedSales(schedule.estimatedSales ?? "");
        setEstimatedCosts(schedule.estimatedCosts ?? emptyCosts);
      }

      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleSave() {
    const schedule = saveSchedule(
      { expoName, startDate, endDate, location, estimatedSales, estimatedCosts },
      scheduleId,
    );
    if (!schedule) {
      setSaveError("저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해주세요.");
      return;
    }

    router.push("/schedule");
  }

  if (!isHydrated) {
    return <main className={styles.page}><section className={styles.content} /></main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO SCHEDULE</p>
          <h1>{scheduleId ? "일정 수정" : "일정 생성"}</h1>
          <p>박람회 기본 정보를 입력해 일정을 관리하세요.</p>
        </header>
        <section className={styles.card}>
          <div className={styles.field}>
            <label htmlFor="expo-name">박람회명</label>
            <input id="expo-name" type="text" value={expoName} onChange={(event) => setExpoName(event.target.value)} placeholder="예: 2026 서울 리빙페어" />
          </div>
          <div className={styles.field}>
            <label htmlFor="start-date">행사 기간</label>
            <div className={styles.dateFieldContent}>
              <div className={styles.dateRange}>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateLabel} htmlFor="start-date">시작일</label>
                  <input id="start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </div>
                <span aria-hidden="true">~</span>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateLabel} htmlFor="end-date">종료일</label>
                  <input id="end-date" type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                </div>
              </div>
              {participationDays !== null && participationDays > 0 && <p className={styles.periodDays}>참가일수 <strong>{participationDays}일</strong></p>}
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="location">장소</label>
            <input id="location" type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="예: 서울 코엑스" />
          </div>

          <section className={styles.estimateSection}>
            <CollapsibleSection
              key={scheduleId ?? "new-schedule"}
              id="estimated-profit-details"
              title="예상 수익 구조"
              heading="h2"
              defaultOpen={Boolean(scheduleId)}
            >
              <div className={styles.field}>
                <label className={styles.goalLabel} htmlFor="estimated-sales">매출 목표</label>
                <MoneyInput
                  id="estimated-sales"
                  value={estimatedSales}
                  onChange={setEstimatedSales}
                  inputClassName={styles.amountInput}
                  readingClassName={styles.amountReading}
                />
              </div>
              <div className={styles.estimatedCostHeading}>예상 비용</div>
              <div className={styles.field}>
                <label>원가 (매출 10%)</label>
                <div>
                  <p className={styles.calculatedAmount}>{formatWon(costOfGoods)}</p>
                  {costOfGoods > 0 && <p className={styles.amountReading}>{formatReadableWon(String(costOfGoods))}</p>}
                </div>
              </div>
              {costItems.map((item) => (
                <div className={styles.field} key={item.id}>
                  <label htmlFor={`estimated-${item.id}`}>{item.name}</label>
                  <MoneyInput
                    id={`estimated-${item.id}`}
                    value={estimatedCosts[item.id] ?? ""}
                    onChange={(value) => setEstimatedCosts((current) => ({ ...current, [item.id]: value }))}
                    inputClassName={styles.amountInput}
                    readingClassName={styles.amountReading}
                  />
                </div>
              ))}
              <div className={styles.estimateTotal}>
                <span>예상 총비용</span>
                <strong>{formatWon(totalCost)}</strong>
              </div>
              <div className={styles.estimateProfit}>
                <span>예상 순이익</span>
                <strong className={estimatedProfit < 0 ? styles.loss : undefined}>{formatWon(estimatedProfit)}</strong>
              </div>
            </CollapsibleSection>
          </section>
        </section>
        <button className={styles.saveButton} type="button" onClick={handleSave}>저장하기</button>
        {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
      </section>
    </main>
  );
}
