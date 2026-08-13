import { MoneyInput } from "@/components/money-input";
import { formatReadableWon, formatWon } from "@/lib/format";
import styles from "@/app/calculator/page.module.css";

type AmountFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AmountField({ id, label, value, onChange }: AmountFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div>
        <MoneyInput
          id={id}
          value={value}
          onChange={onChange}
          inputClassName={styles.amountInput}
          readingClassName={styles.amountReading}
        />
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
