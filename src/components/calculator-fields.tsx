import { formatReadableWon, formatWon } from "@/lib/format";
import styles from "@/app/calculator/page.module.css";

type AmountFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AmountField({ id, label, value, onChange }: AmountFieldProps) {
  const readableValue = formatReadableWon(value);
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div>
        <div className={styles.amountInput}>
          <input id={id} type="number" min="0" step="1000" inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" />
          <span>원</span>
        </div>
        {readableValue && <p className={styles.amountReading}>{readableValue}</p>}
      </div>
    </div>
  );
}

export function CalculatedAmountField({ label, value }: { label: string; value: string }) {
  const amount = Number(value) || 0;
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <div>
        <p className={styles.calculatedAmount}>{formatWon(amount)}</p>
        {amount > 0 && <p className={styles.amountReading}>{formatReadableWon(value)}</p>}
      </div>
    </div>
  );
}
