import type { CostBreakdown, DailySalesEntry, SalesBreakdown } from "./models";

export const toNumber = (value: string) => Number(value) || 0;

export function calculateSales(sales: SalesBreakdown) {
  return toNumber(sales.card) + toNumber(sales.cash) - toNumber(sales.refund);
}

export function calculateCosts(costs: CostBreakdown, salesTotal: number) {
  const costOfGoods = Math.round(salesTotal * 0.1);
  const otherCosts = Object.values(costs).reduce((total, cost) => total + toNumber(cost), 0);
  return { costOfGoods, totalCost: costOfGoods + otherCosts };
}

export function calculateDailySales(entries: DailySalesEntry[]) {
  return entries.reduce((total, entry) => total + calculateSales(entry), 0);
}

export function calculateProfitRate(profit: number, baseAmount: number) {
  if (baseAmount === 0) return null;

  return (profit / baseAmount) * 100;
}

export function getDatesBetween(startDate: string, endDate: string) {
  if (!startDate || !endDate || startDate > endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const last = new Date(`${endDate}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function getParticipationDays(startDate: string, endDate: string) {
  return getDatesBetween(startDate, endDate).length || null;
}
