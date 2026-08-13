"use client";

import { getDailySales } from "@/lib/daily-sales-storage";
import { getSchedules, type ScheduleRecord } from "@/lib/schedule-storage";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const toNumber = (value: string) => Number(value) || 0;
const formatWon = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)} 원`;

function formatDateRange(schedule: ScheduleRecord) {
  return (
    [schedule.startDate, schedule.endDate].filter(Boolean).join(" ~ ") ||
    "기간 미입력"
  );
}

export default function DailySalesListPage() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSchedules(getSchedules()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Link className={styles.homeLink} href="/">
            ← 홈으로 돌아가기
          </Link>
          <p className={styles.eyebrow}>EXPO DAILY SALES</p>
          <h1>일일 매출 기록</h1>
          <p>행사를 선택해 날짜별 매출을 기록하세요.</p>
        </header>
        {schedules.length ? (
          <div className={styles.list}>
            {schedules.map((schedule) => {
              const totalSales =
                getDailySales(schedule.id)?.entries.reduce(
                  (total, entry) =>
                    total +
                    toNumber(entry.card ?? entry.sales ?? "") +
                    toNumber(entry.cash) -
                    toNumber(entry.refund),
                  0,
                ) ?? 0;
              return (
                <Link
                  className={styles.scheduleCard}
                  href={`/daily-sales/new?schedule=${schedule.id}`}
                  key={schedule.id}
                >
                  <div>
                    <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                    <span>{formatDateRange(schedule)}</span>
                    <span>{schedule.location || "장소 미입력"}</span>
                  </div>
                  <dl>
                    <dt>기록 매출</dt>
                    <dd>{formatWon(totalSales)}</dd>
                  </dl>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            먼저 일정 생성에서 행사를 등록해 주세요.
          </div>
        )}
      </section>
    </main>
  );
}
