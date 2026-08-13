import { formatReadableWon } from "@/lib/format";

type MoneyInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName: string;
  readingClassName: string;
};

export function MoneyInput({
  id,
  value,
  onChange,
  inputClassName,
  readingClassName,
}: MoneyInputProps) {
  const readableValue = formatReadableWon(value);

  return (
    <div style={{ minWidth: 0 }}>
      <div className={inputClassName}>
        <input
          id={id}
          type="number"
          min="0"
          step="1000"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
        />
        <span>원</span>
      </div>
      {readableValue && <p className={readingClassName}>{readableValue}</p>}
    </div>
  );
}
