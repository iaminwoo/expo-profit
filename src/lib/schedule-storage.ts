import { createId, readCollection, writeCollection } from "./local-storage";
import type { ScheduleInput, ScheduleRecord } from "./models";

const storageKey = "expo-profit:schedules";

export const getSchedules = () => readCollection<ScheduleRecord>(storageKey);
export const getSchedule = (id: string) => getSchedules().find((schedule) => schedule.id === id);

export function saveSchedule(input: ScheduleInput, id?: string) {
  const schedules = getSchedules();
  const existing = schedules.find((schedule) => schedule.id === id);
  const now = new Date().toISOString();
  const schedule: ScheduleRecord = {
    ...input,
    id: existing?.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextSchedules = existing
    ? schedules.map((item) => item.id === id ? schedule : item)
    : [schedule, ...schedules];
  return writeCollection(storageKey, nextSchedules) ? schedule : null;
}
