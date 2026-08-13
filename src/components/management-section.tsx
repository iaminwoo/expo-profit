"use client";

import Link from "next/link";
import { CollapsibleSection } from "@/components/collapsible-section";
import styles from "@/app/page.module.css";

export function ManagementSection() {
  return (
    <section className={styles.management}>
      <CollapsibleSection
        id="management-links"
        title="관리"
        triggerClassName={styles.managementToggle}
      >
        <div className={styles.managementContent}>
          <Link className={styles.primaryButton} href="/cost-items">비용 항목 관리</Link>
        </div>
      </CollapsibleSection>
    </section>
  );
}
