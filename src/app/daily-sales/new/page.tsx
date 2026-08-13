"use client";

import {
  getDailySales,
  saveDailySales,
  type DailySalesEntry,
} from "@/lib/daily-sales-storage";
import { getSchedule, type ScheduleRecord } from "@/lib/schedule-storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const toNumber = (value: string) => Number(value) || 0;
const formatWon = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)} 원`;

function getDates(startDate: string, endDate: string) {
  if (!startDate || !endDate || startDate > endDate) return [];
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const last = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export default function DailySalesFormPage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleRecord>();
  const [entries, setEntries] = useState<DailySalesEntry[]>([]);
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const scheduleId = new URLSearchParams(window.location.search).get(
      "schedule",
    );
    if (!scheduleId) return;
    const savedSchedule = getSchedule(scheduleId);
    if (!savedSchedule) return;
    const savedSales = getDailySales(scheduleId);
    const dates = getDates(savedSchedule.startDate, savedSchedule.endDate);
    const salesByDate = new Map(
      savedSales?.entries.map((entry) => [entry.date, entry]),
    );
    const timer = window.setTimeout(() => {
      setSchedule(savedSchedule);
      setEntries(
        dates.map((date) => {
          const savedEntry = salesByDate.get(date);
          return {
            date,
            card: savedEntry?.card ?? savedEntry?.sales ?? "",
            cash: savedEntry?.cash ?? "",
            refund: savedEntry?.refund ?? "",
          };
        }),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSave() {
    if (!schedule) return;
    saveDailySales(schedule.id, entries);
    router.push("/daily-sales");
  }

  if (!schedule) {
    return (
      <main className={styles.page}>
        <section className={styles.content}>
          <Link className={styles.homeLink} href="/">
            ← 홈으로 돌아가기
          </Link>
          <div className={styles.empty}>
            기록할 행사를 찾을 수 없습니다. 일별 매출 기록 목록에서 행사를
            선택해 주세요.
          </div>
        </section>
      </main>
    );
  }

  const totalSales = entries.reduce(
    (total, entry) =>
      total + toNumber(entry.card) + toNumber(entry.cash) - toNumber(entry.refund),
    0,
  );

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Link className={styles.homeLink} href="/">
            ← 홈으로 돌아가기
          </Link>
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
            entries.map((entry, index) => {
              const dailySales =
                toNumber(entry.card) + toNumber(entry.cash) - toNumber(entry.refund);

              return (
                <section className={styles.daySection} key={entry.date}>
                  <h3>
                    <button
                      className={styles.dayHeading}
                      type="button"
                      onClick={() =>
                        setOpenDates((current) => ({
                          ...current,
                          [entry.date]: !(current[entry.date] ?? false),
                        }))
                      }
                      aria-expanded={openDates[entry.date] ?? false}
                      aria-controls={`details-${entry.date}`}
                    >
                      <span>{formatDate(entry.date)}</span>
                      <span className={(openDates[entry.date] ?? false) ? styles.arrowOpen : styles.arrow}>▾</span>
                    </button>
                  </h3>
                  <div
                    id={`details-${entry.date}`}
                    className={`${styles.collapsible} ${(openDates[entry.date] ?? false) ? styles.collapsibleOpen : ""}`}
                    inert={!(openDates[entry.date] ?? false)}
                  >
                    <div className={styles.collapsibleInner}>
                  {(["card", "cash", "refund"] as const).map((field) => (
                    <div className={styles.field} key={field}>
                      <label htmlFor={`${field}-${entry.date}`}>
                        {field === "card"
                          ? "카드매출"
                          : field === "cash"
                            ? "현금매출"
                            : "환불/취소"}
                      </label>
                      <div className={styles.amountInput}>
                        <input
                          id={`${field}-${entry.date}`}
                          type="number"
                          min="0"
                          step="1000"
                          inputMode="numeric"
                          value={entry[field]}
                          onChange={(event) =>
                            setEntries((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, [field]: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="0"
                        />
                        <span>원</span>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                  <div className={styles.dailyTotal}>
                    <span>일일 매출</span>
                    <strong>{formatWon(dailySales)}</strong>
                  </div>
                </section>
              );
            })
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
      </section>
    </main>
  );
}
