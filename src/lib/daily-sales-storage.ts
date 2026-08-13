export type DailySalesEntry = {
  date: string;
  card: string;
  cash: string;
  refund: string;
  sales?: string;
};

export type DailySalesRecord = {
  scheduleId: string;
  entries: DailySalesEntry[];
  updatedAt: string;
};

const storageKey = "expo-profit:daily-sales";

export function getDailySalesRecords(): DailySalesRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const records = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function getDailySales(scheduleId: string) {
  return getDailySalesRecords().find((record) => record.scheduleId === scheduleId);
}

export function saveDailySales(scheduleId: string, entries: DailySalesEntry[]) {
  const records = getDailySalesRecords();
  const record: DailySalesRecord = { scheduleId, entries, updatedAt: new Date().toISOString() };
  const nextRecords = records.some((item) => item.scheduleId === scheduleId)
    ? records.map((item) => (item.scheduleId === scheduleId ? record : item))
    : [record, ...records];

  window.localStorage.setItem(storageKey, JSON.stringify(nextRecords));
}
