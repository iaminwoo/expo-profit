"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDateRange } from "@/lib/format";
import type { ScheduleRecord } from "@/lib/models";
import { getSchedules } from "@/lib/schedule-storage";
import styles from "./page.module.css";

export default function ScheduleListPage() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSchedules(getSchedules());
      setIsLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO SCHEDULE</p>
          <h1>일정 확인</h1>
          <p>이 브라우저에 저장된 박람회 일정입니다.</p>
        </header>
        {isLoaded && (schedules.length ? (
          <div className={styles.list}>
            {schedules.map((schedule) => (
              <Link className={styles.scheduleCard} href={`/schedule/new?schedule=${schedule.id}`} key={schedule.id}>
                <strong>{schedule.expoName || "이름 없는 행사"}</strong>
                <span>{formatDateRange(schedule.startDate, schedule.endDate)}</span>
                <span>{schedule.location || "장소 미입력"}</span>
              </Link>
            ))}
          </div>
        ) : <div className={styles.empty}>아직 저장된 일정이 없습니다.</div>)}
      </section>
    </main>
  );
}
