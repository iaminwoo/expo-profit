"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateCosts } from "@/lib/calculations";
import { formatDateRange, formatWon } from "@/lib/format";
import type { ProfitRecord } from "@/lib/models";
import { getSavedExpos } from "@/lib/expo-storage";
import { getProfitSource } from "@/lib/profit-source";
import styles from "./page.module.css";

function getTotals(expo: ProfitRecord) {
  const { schedule, totalSales } = getProfitSource(expo.scheduleId);
  const { totalCost } = calculateCosts(expo.costs, totalSales);
  return { schedule, totalSales, totalCost, profit: totalSales - totalCost };
}

export default function SavedExposPage() {
  const [expos] = useState<ProfitRecord[]>(getSavedExpos);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>EXPO PROFIT</p>
          <h1>저장된 행사</h1>
          <p>이 브라우저에 저장된 행사 목록입니다.</p>
        </header>

        {expos.length > 0 ? (
          <div className={styles.list}>
            {expos.map((expo) => {
              const { schedule, totalSales, totalCost, profit } = getTotals(expo);

              return (
                <Link className={styles.expoCard} href={`/calculator?expo=${expo.id}`} key={expo.id}>
                  <div className={styles.expoInfo}>
                    <strong>
                      {schedule?.expoName || "연결된 일정 없음"} / {schedule?.location || "장소 미입력"}
                    </strong>
                    <span>{schedule ? formatDateRange(schedule.startDate, schedule.endDate) : "일정을 찾을 수 없습니다."}</span>
                  </div>
                  <dl className={styles.totals}>
                    <div><dt>총매출</dt><dd>{formatWon(totalSales)}</dd></div>
                    <div><dt>총비용</dt><dd>{formatWon(totalCost)}</dd></div>
                    <div><dt>순이익</dt><dd className={profit < 0 ? styles.loss : undefined}>{formatWon(profit)}</dd></div>
                  </dl>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>아직 저장된 행사가 없습니다.</div>
        )}
      </section>
    </main>
  );
}
