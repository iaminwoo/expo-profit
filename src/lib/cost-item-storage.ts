import type { CostItem } from "./models";
import { readCollection, writeCollection } from "./local-storage";

const storageKey = "expo-profit:cost-items";

export const defaultCostItems: CostItem[] = [
  { id: "participationFee", name: "참가비" },
  { id: "transportation", name: "교통비" },
  { id: "accommodation", name: "숙박비" },
  { id: "logistics", name: "주차/화물/주유비" },
  { id: "labor", name: "인건비" },
  { id: "paymentFee", name: "결제수수료" },
  { id: "booth", name: "부스/인쇄물/샘플 비용" },
  { id: "other", name: "기타 비용" },
];

export function getCostItems() {
  if (typeof window === "undefined") {
    return defaultCostItems;
  }

  try {
    return window.localStorage.getItem(storageKey) === null
      ? defaultCostItems
      : readCollection<CostItem>(storageKey);
  } catch (error) {
    console.error(`localStorage 읽기 실패: ${storageKey}`, error);
    return defaultCostItems;
  }
}

export const saveCostItems = (items: CostItem[]) => writeCollection(storageKey, items);
