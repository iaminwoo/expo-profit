"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSchedules, type ScheduleRecord } from "@/lib/schedule-storage";
import styles from "./page.module.css";

function formatDateRange(schedule: ScheduleRecord) {
  return [schedule.startDate, schedule.endDate].filter(Boolean).join(" ~ ") || "기간 미입력";
}

export default function ScheduleListPage() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSchedules(getSchedules()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Link className={styles.homeLink} href="/">← 홈으로 돌아가기</Link>
          <p className={styles.eyebrow}>EXPO SCHEDULE</p>
          <h1>일정 확인</h1>
          <p>이 브라우저에 저장된 박람회 일정입니다.</p>
        </header>
        {schedules.length ? (
          <div className={styles.list}>
            {schedules.map((schedule) => (
              <Link className={styles.scheduleCard} href={`/schedule/new?schedule=${schedule.id}`} key={schedule.id}>
                <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                <span>{formatDateRange(schedule)}</span>
                <span>{schedule.location || "장소 미입력"}</span>
              </Link>
            ))}
          </div>
        ) : <div className={styles.empty}>아직 저장된 일정이 없습니다.</div>}
      </section>
    </main>
  );
}
