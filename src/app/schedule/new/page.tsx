"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSchedule, saveSchedule } from "@/lib/schedule-storage";
import styles from "./page.module.css";

export default function ScheduleFormPage() {
  const router = useRouter();
  const [scheduleId, setScheduleId] = useState<string>();
  const [expoName, setExpoName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const participationDays = startDate && endDate
    ? Math.floor((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000) + 1
    : null;

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("schedule");
    if (!id) return;
    const schedule = getSchedule(id);
    if (!schedule) return;

    const timer = window.setTimeout(() => {
      setScheduleId(schedule.id);
      setExpoName(schedule.expoName);
      setStartDate(schedule.startDate);
      setEndDate(schedule.endDate);
      setLocation(schedule.location);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSave() {
    saveSchedule({ expoName, startDate, endDate, location }, scheduleId);
    router.push("/schedule");
  }

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Link className={styles.homeLink} href="/">← 홈으로 돌아가기</Link>
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
        </section>
        <button className={styles.saveButton} type="button" onClick={handleSave}>저장하기</button>
      </section>
    </main>
  );
}
