export type SalesBreakdown = {
  card: string;
  cash: string;
  refund: string;
};

export type CostBreakdown = Record<string, string>;

export type CostItem = {
  id: string;
  name: string;
};

export type ScheduleInput = {
  expoName: string;
  startDate: string;
  endDate: string;
  location: string;
};

export type ScheduleRecord = ScheduleInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type DailySalesEntry = SalesBreakdown & { date: string };

export type DailySalesRecord = {
  scheduleId: string;
  entries: DailySalesEntry[];
  updatedAt: string;
};

export type ProfitRecord = ScheduleInput & {
  id: string;
  scheduleId: string;
  createdAt: string;
  updatedAt: string;
  sales: SalesBreakdown;
  costs: CostBreakdown;
  notes: string;
};

export type ProfitInput = Omit<ProfitRecord, "id" | "createdAt" | "updatedAt">;

export const emptySales: SalesBreakdown = { card: "", cash: "", refund: "" };

export const emptyCosts: CostBreakdown = {};
