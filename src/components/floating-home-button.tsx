"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./floating-home-button.module.css";

export function FloatingHomeButton() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <Link className={styles.button} href="/" aria-label="홈으로 이동">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="m3.5 10 8.5-7 8.5 7v9.5a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 19.5V10Z" />
        <path d="M9 21v-6h6v6" />
      </svg>
    </Link>
  );
}
