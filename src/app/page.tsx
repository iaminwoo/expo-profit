import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.eyebrow}>EXPO PROFIT</p>
        <h1>박람회 관리</h1>
        <p className={styles.description}>
          박람회 수익성과 일정을 브라우저에서 간편하게 관리하세요.
        </p>
        <section className={styles.actionsCard}>
          <div className={styles.groups}>
            <section className={styles.group}>
              <h2>행사 전</h2>
              <h3>일정 관리</h3>
              <div className={styles.buttonRow}>
                <Link className={styles.primaryButton} href="/schedule/new">일정 생성</Link>
                <Link className={styles.secondaryButton} href="/schedule">일정 확인</Link>
              </div>
            </section>
            <section className={styles.group}>
              <h2>행사 중</h2>
              <h3>일일 매출</h3>
              <Link className={styles.primaryButton} href="/daily-sales">기록하기</Link>
            </section>
            <section className={styles.group}>
              <h2>행사 후</h2>
              <h3>수익성 관리</h3>
              <div className={styles.buttonRow}>
                <Link className={styles.primaryButton} href="/calculator">수익성 계산</Link>
                <Link className={styles.secondaryButton} href="/saved">수익성 목록</Link>
              </div>
            </section>
            <section className={styles.group}>
              <h2>관리</h2>
              <Link className={styles.primaryButton} href="/cost-items">비용 항목 관리</Link>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
