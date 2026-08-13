"use client";

import { getDailySales } from "@/lib/daily-sales-storage";
import { calculateDailySales } from "@/lib/calculations";
import { formatDateRange, formatWon } from "@/lib/format";
import type { ScheduleRecord } from "@/lib/models";
import { getSchedules } from "@/lib/schedule-storage";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";


export default function DailySalesListPage() {
  const [schedules] = useState<ScheduleRecord[]>(getSchedules);

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
              const totalSales = calculateDailySales(getDailySales(schedule.id)?.entries ?? []);
              return (
                <Link
                  className={styles.scheduleCard}
                  href={`/daily-sales/new?schedule=${schedule.id}`}
                  key={schedule.id}
                >
                  <div>
                    <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                    <span>{formatDateRange(schedule.startDate, schedule.endDate)}</span>
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
