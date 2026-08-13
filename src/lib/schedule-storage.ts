export type ScheduleRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  expoName: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type ScheduleInput = Omit<ScheduleRecord, "id" | "createdAt" | "updatedAt">;

const storageKey = "expo-profit:schedules";

export function getSchedules(): ScheduleRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const schedules = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(schedules) ? schedules : [];
  } catch {
    return [];
  }
}

export function getSchedule(id: string) {
  return getSchedules().find((schedule) => schedule.id === id);
}

export function saveSchedule(input: ScheduleInput, id?: string): ScheduleRecord {
  const schedules = getSchedules();
  const existing = id ? schedules.find((schedule) => schedule.id === id) : undefined;
  const now = new Date().toISOString();
  const schedule: ScheduleRecord = {
    ...input,
    id: existing?.id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextSchedules = existing
    ? schedules.map((item) => (item.id === existing.id ? schedule : item))
    : [schedule, ...schedules];

  window.localStorage.setItem(storageKey, JSON.stringify(nextSchedules));
  return schedule;
}
