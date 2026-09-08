export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function isSameMonth(dateStr: string, monthStr: string): boolean {
  return dateStr.slice(0, 7) === monthStr;
}

export function currentMonthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

export function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
