"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedExpos, type ExpoRecord } from "@/lib/expo-storage";
import styles from "./page.module.css";

function formatDateRange(startDate: string, endDate: string) {
  if (!startDate && !endDate) return "기간 미입력";
  return [startDate, endDate].filter(Boolean).join(" ~ ");
}

const toNumber = (value: string) => Number(value) || 0;
const formatWon = (value: number) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

function getTotals(expo: ExpoRecord) {
  const totalSales =
    toNumber(expo.sales.card) + toNumber(expo.sales.cash) - toNumber(expo.sales.refund);
  const totalCost =
    Math.round(totalSales * 0.1) +
    Object.values(expo.costs).reduce((total, cost) => total + toNumber(cost), 0);

  return { totalSales, totalCost, profit: totalSales - totalCost };
}

export default function SavedExposPage() {
  const [expos, setExpos] = useState<ExpoRecord[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setExpos(getSavedExpos()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <Link className={styles.backLink} href="/">← 홈으로 돌아가기</Link>
          <p className={styles.eyebrow}>EXPO PROFIT</p>
          <h1>저장된 행사</h1>
          <p>이 브라우저에 저장된 행사 목록입니다.</p>
        </header>

        {expos.length > 0 ? (
          <div className={styles.list}>
            {expos.map((expo) => {
              const { totalSales, totalCost, profit } = getTotals(expo);

              return (
                <Link className={styles.expoCard} href={`/calculator?expo=${expo.id}`} key={expo.id}>
                  <div className={styles.expoInfo}>
                    <strong>
                      {expo.expoName || "이름 없는 행사"} / {expo.location || "장소 미입력"}
                    </strong>
                    <span>{formatDateRange(expo.startDate, expo.endDate)}</span>
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
