"use client";

import React, { useState } from "react";
import { useData } from "@/lib/store";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { MilkType } from "@/lib/types";

export default function SettingsPage() {
  const { data, addMilkType, updateMilkType, deleteMilkType, resetAll } = useData();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("Litre");
  const [rate, setRate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMilkType({ name: name.trim(), defaultUnit: unit, defaultRate: Number.parseFloat(rate) || 0 });
    setName("");
    setRate("");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" />

      <Card>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Milk Types</p>
        <div className="mb-3 space-y-2">
          {data.milkTypes.map((mt) => (
            <MilkTypeRow key={mt.id} milkType={mt} onSave={(m) => updateMilkType(mt.id, m)} onDelete={() => deleteMilkType(mt.id)} />
          ))}
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cow Milk" />
          <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="Litre">Litre</option>
            <option value="Kg">Kg</option>
            <option value="Piece">Piece</option>
            <option value="Other">Other</option>
          </Select>
          <Input label="Default Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Button type="submit">+ Add Milk Type</Button>
        </form>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-semibold text-neutral-700">Data</p>
        <p className="mb-3 text-xs text-neutral-400">
          All data is stored locally in this browser. Clearing it cannot be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("Reset all data? This cannot be undone.")) resetAll();
          }}
        >
          Reset All Data
        </Button>
      </Card>
    </div>
  );
}

function MilkTypeRow({
  milkType,
  onSave,
  onDelete,
}: {
  milkType: MilkType;
  onSave: (m: Partial<MilkType>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(milkType.name);
  const [unit, setUnit] = useState(milkType.defaultUnit);
  const [rate, setRate] = useState(String(milkType.defaultRate));

  const save = () => {
    onSave({ name: name.trim() || milkType.name, defaultUnit: unit, defaultRate: Number.parseFloat(rate) || 0 });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-md border border-neutral-200 p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="Litre">Litre</option>
            <option value="Kg">Kg</option>
            <option value="Piece">Piece</option>
            <option value="Other">Other</option>
          </Select>
          <Input label="Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div className="mt-2 flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
      <span>
        {milkType.name}{" "}
        <span className="text-neutral-400">
          ({milkType.defaultUnit}, ₹{milkType.defaultRate})
        </span>
      </span>
      <div className="flex gap-3">
        <button onClick={() => setEditing(true)} className="text-xs text-emerald-600 hover:underline">
          Edit
        </button>
        <button onClick={onDelete} className="text-xs text-red-500 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
