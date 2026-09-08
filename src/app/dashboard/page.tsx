"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { StatCard, Card, EmptyState } from "@/components/ui";
import { currentMonthStr, formatCurrency, isSameMonth, sum, todayStr } from "@/lib/utils";
import { Session } from "@/lib/types";

export default function Dashboard() {
  const { data, ready } = useData();
  const today = todayStr();
  const month = currentMonthStr();

  const todaysEntries = data.milkEntries.filter((e) => e.date === today);

  const bySession = (session: Session) => sum(todaysEntries.filter((e) => e.session === session).map((e) => e.total));

  const milkQtyToday = sum(todaysEntries.map((e) => e.quantity));
  const milkAmountToday = sum(todaysEntries.map((e) => e.total));

  const monthMilkEntries = data.milkEntries.filter((e) => isSameMonth(e.date, month));
  const monthTotal = sum(monthMilkEntries.map((e) => e.total));

  const pendingTotal = sum(data.milkEntries.filter((e) => e.paymentStatus !== "Paid").map((e) => e.total));

  const milkTypeStats = data.milkTypes.map((mt) => {
    const entries = todaysEntries.filter((e) => e.milkTypeId === mt.id);
    return {
      name: mt.name,
      qty: sum(entries.map((e) => e.quantity)),
      amount: sum(entries.map((e) => e.total)),
      unit: mt.defaultUnit,
    };
  });

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">{new Date(today + "T00:00:00").toDateString()}</p>
      </div>

      {/* Session summary */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Today&apos;s Sessions</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["Morning", "Afternoon", "Night"] as Session[]).map((s) => (
            <div key={s}>
              <p className="text-xs text-neutral-400">{s}</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">{formatCurrency(bySession(s))}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-neutral-200 pt-3 text-center">
          <p className="text-xs text-neutral-400">Today&apos;s Total</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(milkAmountToday)}</p>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Milk Qty Today" value={milkQtyToday.toFixed(1)} sub="Litres" />
        <StatCard label="Milk Sales Today" value={formatCurrency(milkAmountToday)} />
        <StatCard label="Month Total" value={formatCurrency(monthTotal)} />
        <StatCard label="Pending Payments" value={formatCurrency(pendingTotal)} accent="text-amber-600" />
      </div>

      {/* Milk type breakdown */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Milk Type Breakdown (Today)</p>
        {milkTypeStats.every((m) => m.qty === 0) ? (
          <EmptyState text="No milk entries yet today." />
        ) : (
          <div className="space-y-2">
            {milkTypeStats.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{m.name}</span>
                <span className="text-neutral-900">
                  {m.qty} {m.unit} · {formatCurrency(m.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction href="/milk?add=1" label="Add Milk" />
          <QuickAction href="/bill" label="Generate Bill" />
          <QuickAction href="/reports" label="View Reports" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition-colors hover:border-emerald-500 hover:bg-emerald-50"
    >
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </Link>
  );
}
