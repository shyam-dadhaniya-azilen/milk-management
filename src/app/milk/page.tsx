"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useData } from "@/lib/store";
import { Button, Card, EmptyState, Input, Modal, PageHeader, Select } from "@/components/ui";
import { currentMonthStr, formatCurrency, isSameMonth, todayStr } from "@/lib/utils";
import { MilkEntry, PaymentStatus, Session } from "@/lib/types";

const SESSIONS: Session[] = ["Morning", "Afternoon", "Night"];
const STATUSES: PaymentStatus[] = ["Paid", "Pending", "Partial"];

function MilkPageInner() {
  const { data, addMilkEntry, deleteMilkEntry } = useData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(searchParams.get("add") === "1");
  const [filterMonth, setFilterMonth] = useState(currentMonthStr());
  const [filterSession, setFilterSession] = useState<Session | "All">("All");

  const closeModal = () => {
    setOpen(false);
    router.replace("/milk");
  };

  const filtered = useMemo(
    () =>
      data.milkEntries
        .filter((e) => isSameMonth(e.date, filterMonth))
        .filter((e) => filterSession === "All" || e.session === filterSession)
        .sort((a, b) => b.createdAt - a.createdAt),
    [data.milkEntries, filterMonth, filterSession]
  );

  const total = filtered.reduce((a, e) => a + e.total, 0);

  return (
    <div>
      <PageHeader
        title="Milk Entries"
        action={
          <Button onClick={() => setOpen(true)}>+ Add Milk</Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <Input type="month" label="Month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          <Select label="Session" value={filterSession} onChange={(e) => setFilterSession(e.target.value as Session | "All")}>
            <option value="All">All</option>
            {SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-700">
            {filterMonth} {filterSession !== "All" && `· ${filterSession}`}
          </p>
          <p className="text-sm font-bold text-emerald-600">{formatCurrency(total)}</p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState text="No milk entries for this month." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Session</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Qty</th>
                  <th className="py-2 pr-2">Rate</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const mt = data.milkTypes.find((m) => m.id === e.milkTypeId);
                  return (
                    <tr key={e.id} className="border-b border-neutral-100">
                      <td className="py-2 pr-2">{e.date}</td>
                      <td className="py-2 pr-2">{e.session}</td>
                      <td className="py-2 pr-2">{mt?.name ?? e.itemName ?? "—"}</td>
                      <td className="py-2 pr-2">
                        {e.quantity} {e.unit}
                      </td>
                      <td className="py-2 pr-2">{formatCurrency(e.rate)}</td>
                      <td className="py-2 pr-2 font-medium">{formatCurrency(e.total)}</td>
                      <td className="py-2 pr-2">
                        <StatusBadge status={e.paymentStatus} />
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <button
                          onClick={() => deleteMilkEntry(e.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={closeModal} title="Add Milk Entry">
        <MilkForm
          milkTypes={data.milkTypes}
          onSubmit={(entry) => {
            addMilkEntry(entry);
            closeModal();
          }}
        />
      </Modal>
    </div>
  );
}

export default function MilkPage() {
  return (
    <Suspense>
      <MilkPageInner />
    </Suspense>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Partial: "bg-blue-100 text-blue-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>{status}</span>;
}

function MilkForm({
  milkTypes,
  onSubmit,
}: {
  milkTypes: { id: string; name: string; defaultUnit: string; defaultRate: number }[];
  onSubmit: (e: Omit<MilkEntry, "id" | "createdAt">) => void;
}) {
  const [session, setSession] = useState<Session>("Morning");
  const [milkTypeId, setMilkTypeId] = useState(milkTypes[0]?.id ?? "");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(milkTypes[0]?.defaultUnit ?? "Litre");
  const [rate, setRate] = useState(String(milkTypes[0]?.defaultRate ?? ""));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Pending");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOther = milkTypeId === "other";
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const total = qtyNum * rateNum;

  const handleMilkTypeChange = (id: string) => {
    setMilkTypeId(id);
    if (id === "other") {
      setUnit("Litre");
      setRate("");
      return;
    }
    const mt = milkTypes.find((m) => m.id === id);
    if (mt) {
      setUnit(mt.defaultUnit);
      setRate(String(mt.defaultRate));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!milkTypeId) errs.milkTypeId = "Required";
    if (isOther && !itemName.trim()) errs.itemName = "Required";
    if (qtyNum <= 0) errs.quantity = "Must be greater than 0";
    if (rateNum < 0) errs.rate = "Must be >= 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      date: todayStr(),
      session,
      milkTypeId,
      itemName: isOther ? itemName.trim() : undefined,
      customer: "",
      quantity: qtyNum,
      unit,
      rate: rateNum,
      total,
      paymentStatus,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Select label="Session" value={session} onChange={(e) => setSession(e.target.value as Session)}>
        {SESSIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select label="Type" value={milkTypeId} onChange={(e) => handleMilkTypeChange(e.target.value)} required>
        {milkTypes.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
        <option value="other">Other</option>
      </Select>
      {isOther && (
        <Input
          label="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          error={errors.itemName}
          placeholder="e.g. Cow Milk"
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantity"
          type="number"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={errors.quantity}
        />
        <Input label="Rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} error={errors.rate} />
      </div>
      <div className="rounded-md bg-neutral-100 px-3 py-2 text-sm">
        <span className="text-neutral-500">Total: </span>
        <span className="font-semibold text-neutral-900">{formatCurrency(total)}</span>
      </div>
      <Select label="Payment Status" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      <Button type="submit" className="w-full">
        Save Entry
      </Button>
    </form>
  );
}
