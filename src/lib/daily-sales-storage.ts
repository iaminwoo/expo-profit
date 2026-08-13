import { readCollection, writeCollection } from "./local-storage";
import type { DailySalesEntry, DailySalesRecord } from "./models";

const storageKey = "expo-profit:daily-sales";

export const getDailySalesRecords = () => readCollection<DailySalesRecord>(storageKey);
export const getDailySales = (scheduleId: string) =>
  getDailySalesRecords().find((record) => record.scheduleId === scheduleId);

export function saveDailySales(scheduleId: string, entries: DailySalesEntry[]) {
  const records = getDailySalesRecords();
  const record: DailySalesRecord = { scheduleId, entries, updatedAt: new Date().toISOString() };
  return writeCollection(storageKey, records.some((item) => item.scheduleId === scheduleId)
    ? records.map((item) => item.scheduleId === scheduleId ? record : item)
    : [record, ...records]);
}
