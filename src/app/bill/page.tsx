"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/store";
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { currentMonthStr, formatCurrency, formatDate, isSameMonth } from "@/lib/utils";

export default function BillPage() {
  const { data } = useData();
  const [month, setMonth] = useState(currentMonthStr());

  const milkRows = useMemo(
    () => data.milkEntries.filter((e) => isSameMonth(e.date, month)).sort((a, b) => a.date.localeCompare(b.date)),
    [data.milkEntries, month]
  );

  const milkTotal = milkRows.reduce((a, e) => a + e.total, 0);
  const paidTotal = milkRows.filter((e) => e.paymentStatus === "Paid").reduce((a, e) => a + e.total, 0);
  const dueTotal = milkTotal - paidTotal;

  return (
    <div>
      <PageHeader
        title="Bill"
        action={
          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Print / Download
          </Button>
        }
      />

      <Card className="mb-4 print:hidden">
        <Input type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </Card>

      <Card id="printable-bill">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <p className="text-lg font-semibold text-neutral-900">Milk Manager</p>
            <p className="text-xs text-neutral-400">Bill for {month}</p>
          </div>
        </div>

        {milkRows.length > 0 && (
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400">
                  <th className="py-1.5">Date</th>
                  <th className="py-1.5">Session</th>
                  <th className="py-1.5 text-right">Qty</th>
                  <th className="py-1.5 text-right">Rate</th>
                  <th className="py-1.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {milkRows.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-100">
                    <td className="py-1.5">{formatDate(e.date)}</td>
                    <td className="py-1.5">{e.session}</td>
                    <td className="py-1.5 text-right">
                      {e.quantity} {e.unit}
                    </td>
                    <td className="py-1.5 text-right">{formatCurrency(e.rate)}</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(e.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {milkRows.length === 0 ? (
          <EmptyState text="No transactions for this month." />
        ) : (
          <div className="space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <Row label="Grand Total" value={milkTotal} bold />
            <Row label="Paid" value={paidTotal} />
            <Row label="Due" value={dueTotal} accent />
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: number; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-neutral-500">{label}</span>
      <span className={accent ? "font-semibold text-amber-600" : "text-neutral-900"}>{formatCurrency(value)}</span>
    </div>
  );
}
