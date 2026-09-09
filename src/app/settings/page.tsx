"use client";

import React, { useState } from "react";
import { useData } from "@/lib/store";
import { useAuth, Member } from "@/lib/auth";
import { Button, Card, Input, Modal, PageHeader, PasswordInput, Select } from "@/components/ui";
import { MilkType } from "@/lib/types";

export default function SettingsPage() {
  const { data, addMilkType, updateMilkType, deleteMilkType, syncStatus } = useData();
  const { user, members, addMember, updateMember, removeMember } = useAuth();
  const [addMilkTypeOpen, setAddMilkTypeOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("Litre");
  const [rate, setRate] = useState("");

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberError, setMemberError] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addMember(memberName, memberPassword);
    if (!result.ok) {
      setMemberError(result.error ?? "Could not add member");
      return;
    }
    setMemberError("");
    setMemberName("");
    setMemberPassword("");
    setAddMemberOpen(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMilkType({ name: name.trim(), defaultUnit: unit, defaultRate: Number.parseFloat(rate) || 0 });
    setName("");
    setRate("");
    setAddMilkTypeOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Milk Types</p>
          <Button onClick={() => setAddMilkTypeOpen(true)}>+ Add Milk Type</Button>
        </div>
        <div className="space-y-2">
          {data.milkTypes.map((mt) => (
            <MilkTypeRow key={mt.id} milkType={mt} onSave={(m) => updateMilkType(mt.id, m)} onDelete={() => deleteMilkType(mt.id)} />
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Members</p>
          <Button onClick={() => setAddMemberOpen(true)}>+ Add Member</Button>
        </div>
        <div className="space-y-2">
          {members.map((m) => (
            <MemberRow
              key={m.name}
              member={m}
              isYou={m.name === user}
              onSave={(next) => updateMember(m.name, next)}
              onDelete={() => removeMember(m.name)}
            />
          ))}
        </div>
      </Card>

      <Modal open={addMilkTypeOpen} onClose={() => setAddMilkTypeOpen(false)} title="Add Milk Type">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cow Milk" />
          <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="Litre">Litre</option>
            <option value="Kg">Kg</option>
            <option value="Piece">Piece</option>
            <option value="Other">Other</option>
          </Select>
          <Input label="Default Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Button type="submit" className="w-full">
            Add Milk Type
          </Button>
        </form>
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-3">
          <Input label="Username" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="e.g. Priya" />
          <PasswordInput
            label="Password"
            value={memberPassword}
            onChange={(e) => setMemberPassword(e.target.value)}
            placeholder="Set a password"
            error={memberError}
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500">New members can log in with this username and password and share this society's data.</p>
          <Button type="submit" className="w-full">
            Add Member
          </Button>
        </form>
      </Modal>

      <Card>
        <p className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Data</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {syncStatus === "error"
            ? "Couldn't reach the database — check your connection and try again."
            : "All data is stored directly in the database. Changes save automatically."}
        </p>
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
      <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3">
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
    <div className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
      <span>
        {milkType.name}{" "}
        <span className="text-neutral-400 dark:text-neutral-500">
          ({milkType.defaultUnit}, ₹{milkType.defaultRate})
        </span>
      </span>
      <div className="flex gap-3">
        <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:underline">
          Edit
        </button>
        <button onClick={onDelete} className="text-xs text-red-500 dark:text-red-400 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  isYou,
  onSave,
  onDelete,
}: {
  member: Member;
  isYou: boolean;
  onSave: (next: { name: string; password: string }) => { ok: boolean; error?: string };
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [password, setPassword] = useState(member.password);
  const [error, setError] = useState("");

  const save = () => {
    const result = onSave({ name, password });
    if (!result.ok) {
      setError(result.error ?? "Could not update member");
      return;
    }
    setError("");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
        </div>
        <div className="mt-2 flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setName(member.name);
              setPassword(member.password);
              setError("");
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm">
      <span>
        {member.name} {isYou && <span className="text-neutral-400 dark:text-neutral-500">(you)</span>}
      </span>
      <div className="flex gap-3">
        <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:underline">
          Edit
        </button>
        {!isYou && (
          <button onClick={onDelete} className="text-xs text-red-500 dark:text-red-400 hover:underline">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
