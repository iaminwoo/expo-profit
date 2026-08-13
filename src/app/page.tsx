import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.eyebrow}>EXPO PROFIT</p>
        <h1>박람회 수익 계산기</h1>
        <p className={styles.description}>
          박람회별 매출과 비용을 계산하고, 브라우저에 저장해 다시 확인하세요.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/calculator">
            입력
          </Link>
          <Link className={styles.secondaryButton} href="/saved">
            목록
          </Link>
        </div>
      </section>
    </main>
  );
}
