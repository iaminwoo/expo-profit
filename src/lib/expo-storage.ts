import { createId, readCollection, writeCollection } from "./local-storage";
import type { ProfitInput, ProfitRecord } from "./models";

const storageKey = "expo-profit:expos";

export const getSavedExpos = () => readCollection<ProfitRecord>(storageKey);
export const getSavedExpo = (id: string) => getSavedExpos().find((expo) => expo.id === id);

export function saveExpo(input: ProfitInput, id?: string) {
  const expos = getSavedExpos();
  const existing = expos.find((expo) => expo.id === id);
  const now = new Date().toISOString();
  const expo: ProfitRecord = {
    ...input,
    id: existing?.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextExpos = existing
    ? expos.map((item) => item.id === id ? expo : item)
    : [expo, ...expos];
  return writeCollection(storageKey, nextExpos) ? expo : null;
}
