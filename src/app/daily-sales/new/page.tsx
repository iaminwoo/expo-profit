"use client";

import {
  getDailySales,
  saveDailySales,
} from "@/lib/daily-sales-storage";
import { calculateDailySales, getDatesBetween } from "@/lib/calculations";
import { formatWon } from "@/lib/format";
import { emptySales, type DailySalesEntry, type ScheduleRecord } from "@/lib/models";
import { getSchedule } from "@/lib/schedule-storage";
import { DailySalesEntrySection } from "@/components/daily-sales-entry";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";


export default function DailySalesFormPage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleRecord>();
  const [entries, setEntries] = useState<DailySalesEntry[]>([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const scheduleId = new URLSearchParams(window.location.search).get(
      "schedule",
    );
    if (!scheduleId) return;
    const savedSchedule = getSchedule(scheduleId);
    if (!savedSchedule) return;
    const savedSales = getDailySales(scheduleId);
    const dates = getDatesBetween(savedSchedule.startDate, savedSchedule.endDate);
    const salesByDate = new Map(
      savedSales?.entries.map((entry) => [entry.date, entry]),
    );
    const timer = window.setTimeout(() => {
      setSchedule(savedSchedule);
      setEntries(
        dates.map((date) => {
          const savedEntry = salesByDate.get(date);
          return { date, ...(savedEntry ?? emptySales) };
        }),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSave() {
    if (!schedule) return;
    if (!saveDailySales(schedule.id, entries)) {
      setSaveError("저장하지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해주세요.");
      return;
    }

    router.push("/daily-sales");
  }

  if (!schedule) {
    return (
      <main className={styles.page}>
        <section className={styles.content}>
          <div className={styles.empty}>
            기록할 행사를 찾을 수 없습니다. 일별 매출 기록 목록에서 행사를
            선택해 주세요.
          </div>
        </section>
      </main>
    );
  }

  const totalSales = calculateDailySales(entries);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO DAILY SALES</p>
          <h1>일일 매출 기록</h1>
        </header>
        <section className={styles.infoCard}>
          <strong>{schedule.expoName || "이름 없는 행사"}</strong>
          <span>
            {[schedule.startDate, schedule.endDate]
              .filter(Boolean)
              .join(" ~ ") || "기간 미입력"}
          </span>
          <span>{schedule.location || "장소 미입력"}</span>
        </section>
        <section className={styles.card}>
          <h2>날짜별 매출</h2>
          {entries.length ? (
            entries.map((entry, index) => <DailySalesEntrySection
              key={entry.date}
              entry={entry}
              onChange={(field, value) => setEntries((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))}
            />)
          ) : (
            <p className={styles.noDates}>행사 기간을 먼저 입력해 주세요.</p>
          )}
          <div className={styles.total}>
            <span>기간 총매출</span>
            <strong>{formatWon(totalSales)}</strong>
          </div>
        </section>
        <button
          className={styles.saveButton}
          type="button"
          onClick={handleSave}
        >
          저장하기
        </button>
        {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
      </section>
    </main>
  );
}
