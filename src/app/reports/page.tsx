"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { Button, Card, EmptyState, Input, PageHeader, StatCard } from "@/components/ui";
import { currentMonthStr, formatCurrency, isSameMonth, sum } from "@/lib/utils";
import { Session } from "@/lib/types";

export default function ReportsPage() {
  const { data } = useData();
  const [month, setMonth] = useState(currentMonthStr());

  const milkEntries = useMemo(() => data.milkEntries.filter((e) => isSameMonth(e.date, month)), [data.milkEntries, month]);

  const milkTotal = sum(milkEntries.map((e) => e.total));
  const milkQty = sum(milkEntries.map((e) => e.quantity));

  const bySession = (session: Session) => sum(milkEntries.filter((e) => e.session === session).map((e) => e.total));

  const byMilkType = data.milkTypes.map((mt) => {
    const entries = milkEntries.filter((e) => e.milkTypeId === mt.id);
    return { name: mt.name, qty: sum(entries.map((e) => e.quantity)), amount: sum(entries.map((e) => e.total)) };
  });

  const pendingMilk = sum(milkEntries.filter((e) => e.paymentStatus !== "Paid").map((e) => e.total));

  return (
    <div>
      <PageHeader
        title="Monthly Report"
        action={
          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Print
          </Button>
        }
      />

      <Card className="mb-4 print:hidden">
        <Input type="month" label="Select Month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </Card>

      <div id="printable-report" className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Report for {month}</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Milk Sales" value={formatCurrency(milkTotal)} sub={`${milkQty.toFixed(1)} L total`} />
          <StatCard label="Net Profit" value={formatCurrency(milkTotal)} accent="text-emerald-600" />
          <StatCard label="Pending Payments" value={formatCurrency(pendingMilk)} accent="text-amber-600" />
        </div>

        <Card>
          <p className="mb-3 text-sm font-semibold text-neutral-700">Milk Sales by Session</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {(["Morning", "Afternoon", "Night"] as Session[]).map((s) => (
              <div key={s}>
                <p className="text-xs text-neutral-400">{s}</p>
                <p className="mt-1 font-semibold text-neutral-900">{formatCurrency(bySession(s))}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-semibold text-neutral-700">Milk Sales by Type</p>
          {byMilkType.every((m) => m.qty === 0) ? (
            <EmptyState text="No milk sales this month." />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {byMilkType.map((m) => (
                  <tr key={m.name} className="border-b border-neutral-100">
                    <td className="py-1.5">{m.name}</td>
                    <td className="py-1.5 text-right">{m.qty.toFixed(1)} L</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
