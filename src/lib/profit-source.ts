import { calculateDailySales } from "./calculations";
import { getDailySales } from "./daily-sales-storage";
import { emptySales, type SalesBreakdown } from "./models";
import { getSchedule } from "./schedule-storage";

export function getProfitSource(scheduleId: string) {
  const schedule = getSchedule(scheduleId);
  const entries = getDailySales(scheduleId)?.entries ?? [];
  const sales: SalesBreakdown = entries.reduce(
    (total, entry) => ({
      card: String(Number(total.card) + (Number(entry.card) || 0)),
      cash: String(Number(total.cash) + (Number(entry.cash) || 0)),
      refund: String(Number(total.refund) + (Number(entry.refund) || 0)),
    }),
    emptySales,
  );

  return { schedule, sales, totalSales: calculateDailySales(entries) };
}
