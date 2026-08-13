export const formatWon = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)} 원`;

export function formatReadableWon(value: string) {
  const amount = Number(value) || 0;
  if (amount <= 0) return "";

  const eok = Math.floor(amount / 100_000_000);
  const afterEok = amount % 100_000_000;
  const man = Math.floor(afterEok / 10_000);
  const won = afterEok % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${eok}억`);
  if (man) parts.push(man >= 100 && man % 100 === 0 ? `${man / 100}백만` : `${man}만`);
  if (won) parts.push(new Intl.NumberFormat("ko-KR").format(won));
  return `${parts.join(" ")}원`;
}

export function formatDateRange(startDate: string, endDate: string) {
  return [startDate, endDate].filter(Boolean).join(" ~ ") || "기간 미입력";
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));
}
