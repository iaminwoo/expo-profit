export type ExpoSales = {
  card: string;
  cash: string;
  refund: string;
};

export type ExpoCosts = {
  participationFee: string;
  transportation: string;
  accommodation: string;
  logistics: string;
  labor: string;
  paymentFee: string;
  booth: string;
  other: string;
};

export type ExpoRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  scheduleId?: string;
  expoName: string;
  startDate: string;
  endDate: string;
  location: string;
  sales: ExpoSales;
  costs: ExpoCosts;
  notes: string;
};

export type ExpoInput = Omit<ExpoRecord, "id" | "createdAt" | "updatedAt">;

const storageKey = "expo-profit:expos";

export function getSavedExpos(): ExpoRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function getSavedExpo(id: string): ExpoRecord | undefined {
  return getSavedExpos().find((expo) => expo.id === id);
}

export function saveExpo(input: ExpoInput, id?: string): ExpoRecord {
  const savedExpos = getSavedExpos();
  const existing = id ? savedExpos.find((expo) => expo.id === id) : undefined;
  const now = new Date().toISOString();
  const record: ExpoRecord = {
    ...input,
    id: existing?.id ?? createExpoId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextExpos = existing
    ? savedExpos.map((expo) => (expo.id === existing.id ? record : expo))
    : [record, ...savedExpos];

  window.localStorage.setItem(storageKey, JSON.stringify(nextExpos));
  return record;
}

function createExpoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
