"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AppData, Expense, MilkEntry, MilkType } from "./types";
import { useAuth } from "./auth";
import { logAudit } from "./audit";

const emptyData: AppData = {
  milkTypes: [],
  milkEntries: [],
  expenses: [],
};

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

async function pullRemote(societyId: string): Promise<AppData | null> {
  try {
    const res = await fetch(`/api/data?id=${encodeURIComponent(societyId)}`);
    if (!res.ok) return null;
    const { payload } = await res.json();
    if (!payload) return null;
    return { ...emptyData, ...(payload as Partial<AppData>) };
  } catch {
    return null;
  }
}

async function pushRemote(societyId: string, data: AppData) {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: societyId, payload: data }),
  });
  if (!res.ok) throw new Error("Failed to save data");
}

interface DataContextValue {
  data: AppData;
  ready: boolean;
  addMilkEntry: (e: Omit<MilkEntry, "id" | "createdAt">) => void;
  updateMilkEntry: (id: string, e: Partial<MilkEntry>) => void;
  deleteMilkEntry: (id: string) => void;
  addMilkType: (m: Omit<MilkType, "id">) => void;
  updateMilkType: (id: string, m: Partial<MilkType>) => void;
  deleteMilkType: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  syncStatus: "loading" | "syncing" | "synced" | "error";
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { societyId, user } = useAuth();
  const pathname = usePathname();
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "syncing" | "synced" | "error">("loading");
  const skipNextPush = useRef(false);
  const isPushing = useRef(false);
  // Tracks the latest data outside of React's setState batching so audit entries can capture
  // the "before" state of an edited/deleted record without depending on stale closures.
  const dataRef = useRef<AppData>(emptyData);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Load this society's data straight from the database (via API routes) whenever the signed-in society changes.
  useEffect(() => {
    if (!societyId) {
      setData(emptyData);
      setReady(false);
      return;
    }
    let cancelled = false;
    setReady(false);
    setSyncStatus("loading");
    (async () => {
      const remote = await pullRemote(societyId);
      if (cancelled) return;
      // Only skip the next auto-push if we actually loaded existing data from the database.
      // For a brand-new society (no remote row yet), push the defaults immediately so they're persisted.
      skipNextPush.current = remote !== null;
      setData(remote ?? emptyData);
      setReady(true);
      setSyncStatus("synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [societyId]);

  // Every change is written straight to the database immediately, then re-fetched (GET) right
  // after so the UI always reflects the server's confirmed state — no debounce, no local caching.
  useEffect(() => {
    if (!ready || !societyId) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    let cancelled = false;
    setSyncStatus("syncing");
    isPushing.current = true;
    (async () => {
      try {
        await pushRemote(societyId, data);
        const fresh = await pullRemote(societyId);
        if (!cancelled && fresh) {
          skipNextPush.current = true;
          setData(fresh);
        }
        if (!cancelled) setSyncStatus("synced");
      } catch {
        if (!cancelled) setSyncStatus("error");
      } finally {
        isPushing.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ready, societyId]);

  // Re-pull from the database on every page navigation so changes made elsewhere (another
  // member, another tab) show up without a full reload — skipped while a local write is pending.
  useEffect(() => {
    if (!ready || !societyId || isPushing.current) return;
    let cancelled = false;
    (async () => {
      const remote = await pullRemote(societyId);
      if (cancelled || !remote) return;
      skipNextPush.current = true;
      setData(remote);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const addMilkEntry = useCallback(
    (e: Omit<MilkEntry, "id" | "createdAt">) => {
      const entry: MilkEntry = { ...e, id: uid(), createdAt: Date.now() };
      setData((d) => ({ ...d, milkEntries: [...d.milkEntries, entry] }));
      if (societyId && user)
        logAudit({
          societyId,
          user,
          action: "create",
          entity: "milkEntry",
          entityId: entry.id,
          summary: `Added milk entry for ${entry.customer}`,
          after: entry,
        });
    },
    [societyId, user]
  );

  const updateMilkEntry = useCallback(
    (id: string, e: Partial<MilkEntry>) => {
      const before = dataRef.current.milkEntries.find((m) => m.id === id);
      setData((d) => ({
        ...d,
        milkEntries: d.milkEntries.map((m) => (m.id === id ? { ...m, ...e } : m)),
      }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "update",
          entity: "milkEntry",
          entityId: id,
          summary: `Updated milk entry for ${before.customer}`,
          before,
          after: { ...before, ...e },
        });
    },
    [societyId, user]
  );

  const deleteMilkEntry = useCallback(
    (id: string) => {
      const before = dataRef.current.milkEntries.find((m) => m.id === id);
      setData((d) => ({ ...d, milkEntries: d.milkEntries.filter((m) => m.id !== id) }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "delete",
          entity: "milkEntry",
          entityId: id,
          summary: `Deleted milk entry for ${before.customer}`,
          before,
        });
    },
    [societyId, user]
  );

  const addMilkType = useCallback(
    (m: Omit<MilkType, "id">) => {
      const milkType: MilkType = { ...m, id: uid() };
      setData((d) => ({ ...d, milkTypes: [...d.milkTypes, milkType] }));
      if (societyId && user)
        logAudit({
          societyId,
          user,
          action: "create",
          entity: "milkType",
          entityId: milkType.id,
          summary: `Added milk type ${milkType.name}`,
          after: milkType,
        });
    },
    [societyId, user]
  );

  const updateMilkType = useCallback(
    (id: string, m: Partial<MilkType>) => {
      const before = dataRef.current.milkTypes.find((x) => x.id === id);
      setData((d) => ({ ...d, milkTypes: d.milkTypes.map((x) => (x.id === id ? { ...x, ...m } : x)) }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "update",
          entity: "milkType",
          entityId: id,
          summary: `Updated milk type ${before.name}`,
          before,
          after: { ...before, ...m },
        });
    },
    [societyId, user]
  );

  const deleteMilkType = useCallback(
    (id: string) => {
      const before = dataRef.current.milkTypes.find((x) => x.id === id);
      setData((d) => ({ ...d, milkTypes: d.milkTypes.filter((m) => m.id !== id) }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "delete",
          entity: "milkType",
          entityId: id,
          summary: `Deleted milk type ${before.name}`,
          before,
        });
    },
    [societyId, user]
  );

  const addExpense = useCallback(
    (e: Omit<Expense, "id" | "createdAt">) => {
      const expense: Expense = { ...e, id: uid(), createdAt: Date.now() };
      setData((d) => ({ ...d, expenses: [...d.expenses, expense] }));
      if (societyId && user)
        logAudit({
          societyId,
          user,
          action: "create",
          entity: "expense",
          entityId: expense.id,
          summary: `Added expense: ${expense.description || expense.category}`,
          after: expense,
        });
    },
    [societyId, user]
  );

  const updateExpense = useCallback(
    (id: string, e: Partial<Expense>) => {
      const before = dataRef.current.expenses.find((x) => x.id === id);
      setData((d) => ({ ...d, expenses: d.expenses.map((x) => (x.id === id ? { ...x, ...e } : x)) }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "update",
          entity: "expense",
          entityId: id,
          summary: `Updated expense: ${before.description || before.category}`,
          before,
          after: { ...before, ...e },
        });
    },
    [societyId, user]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const before = dataRef.current.expenses.find((x) => x.id === id);
      setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
      if (societyId && user && before)
        logAudit({
          societyId,
          user,
          action: "delete",
          entity: "expense",
          entityId: id,
          summary: `Deleted expense: ${before.description || before.category}`,
          before,
        });
    },
    [societyId, user]
  );

  return (
    <DataContext.Provider
      value={{
        data,
        ready,
        addMilkEntry,
        updateMilkEntry,
        deleteMilkEntry,
        addMilkType,
        updateMilkType,
        deleteMilkType,
        addExpense,
        updateExpense,
        deleteExpense,
        syncStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
