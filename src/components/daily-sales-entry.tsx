import { calculateSales } from "@/lib/calculations";
import { formatShortDate, formatWon } from "@/lib/format";
import type { DailySalesEntry } from "@/lib/models";
import styles from "@/app/daily-sales/new/page.module.css";

type Props = {
  entry: DailySalesEntry;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof Omit<DailySalesEntry, "date">, value: string) => void;
};

const fields = [
  { key: "card", label: "카드매출" },
  { key: "cash", label: "현금매출" },
  { key: "refund", label: "환불/취소" },
] as const;

export function DailySalesEntrySection({ entry, isOpen, onToggle, onChange }: Props) {
  return (
    <section className={styles.daySection}>
      <h3>
        <button className={styles.dayHeading} type="button" onClick={onToggle} aria-expanded={isOpen} aria-controls={`details-${entry.date}`}>
          <span>{formatShortDate(entry.date)}</span>
          <span className={isOpen ? styles.arrowOpen : styles.arrow}>▾</span>
        </button>
      </h3>
      <div id={`details-${entry.date}`} className={`${styles.collapsible} ${isOpen ? styles.collapsibleOpen : ""}`} inert={!isOpen}>
        <div className={styles.collapsibleInner}>
          {fields.map((field) => (
            <div className={styles.field} key={field.key}>
              <label htmlFor={`${field.key}-${entry.date}`}>{field.label}</label>
              <div className={styles.amountInput}>
                <input id={`${field.key}-${entry.date}`} type="number" min="0" step="1000" inputMode="numeric" value={entry[field.key]} onChange={(event) => onChange(field.key, event.target.value)} placeholder="0" />
                <span>원</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.dailyTotal}>
        <span>일일 매출</span>
        <strong>{formatWon(calculateSales(entry))}</strong>
      </div>
    </section>
  );
}
