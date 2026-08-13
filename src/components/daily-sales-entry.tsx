"use client";

import { calculateSales } from "@/lib/calculations";
import { MoneyInput } from "@/components/money-input";
import { formatShortDate, formatWon } from "@/lib/format";
import type { DailySalesEntry } from "@/lib/models";
import styles from "@/app/daily-sales/new/page.module.css";
import { useState } from "react";

type Props = {
  entry: DailySalesEntry;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof Omit<DailySalesEntry, "date">, value: string) => void;
};

const fields = [
  { key: "cash", label: "현금매출 (계좌이체 + 현금)" },
  { key: "card", label: "카드매출" },
  { key: "refund", label: "환불/취소" },
] as const;

export function DailySalesEntrySection({ entry, isOpen, onToggle, onChange }: Props) {
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [transactionText, setTransactionText] = useState("");

  function applyCashTotal() {
    const total = (Number(transferAmount) || 0) + (Number(cashAmount) || 0);
    onChange("cash", total ? String(total) : "");
    setIsCashModalOpen(false);
  }

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
              {field.key === "cash" ? (
                <button
                  className={styles.cashInputButton}
                  type="button"
                  onClick={() => setIsCashModalOpen(true)}
                >
                  <span>{entry.cash ? formatWon(Number(entry.cash)) : "현금매출 입력하기"}</span>
                  <span aria-hidden="true">›</span>
                </button>
              ) : (
                <MoneyInput
                  id={`${field.key}-${entry.date}`}
                  value={entry[field.key]}
                  onChange={(value) => onChange(field.key, value)}
                  inputClassName={styles.amountInput}
                  readingClassName={styles.amountReading}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.dailyTotal}>
        <span>일일 매출</span>
        <strong>{formatWon(calculateSales(entry))}</strong>
      </div>
      {isCashModalOpen && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.cashModal} role="dialog" aria-modal="true" aria-labelledby={`cash-modal-title-${entry.date}`}>
            <div className={styles.modalHeader}>
              <h2 id={`cash-modal-title-${entry.date}`}>현금매출 입력</h2>
              <button className={styles.modalClose} type="button" onClick={() => setIsCashModalOpen(false)} aria-label="닫기">×</button>
            </div>
            <div className={styles.modalField}>
              <label htmlFor={`transaction-text-${entry.date}`}>거래내역</label>
              <textarea
                id={`transaction-text-${entry.date}`}
                value={transactionText}
                onChange={(event) => setTransactionText(event.target.value)}
                placeholder="나중에 계좌 거래내역을 복사해 붙여넣을 수 있습니다."
                rows={3}
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor={`transfer-${entry.date}`}>계좌이체</label>
              <MoneyInput
                id={`transfer-${entry.date}`}
                value={transferAmount}
                onChange={setTransferAmount}
                inputClassName={styles.amountInput}
                readingClassName={styles.amountReading}
              />
            </div>
            <div className={styles.modalField}>
              <label htmlFor={`cash-${entry.date}`}>현금</label>
              <MoneyInput
                id={`cash-${entry.date}`}
                value={cashAmount}
                onChange={setCashAmount}
                inputClassName={styles.amountInput}
                readingClassName={styles.amountReading}
              />
            </div>
            <button className={styles.combineButton} type="button" onClick={applyCashTotal}>합산</button>
          </section>
        </div>
      )}
    </section>
  );
}
