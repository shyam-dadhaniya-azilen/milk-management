"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AppData, Expense, MilkEntry, MilkType } from "./types";
import { useAuth } from "./auth";

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
  const { societyId } = useAuth();
  const pathname = usePathname();
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"loading" | "syncing" | "synced" | "error">("loading");
  const skipNextPush = useRef(false);
  const isPushing = useRef(false);

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

  const addMilkEntry = useCallback((e: Omit<MilkEntry, "id" | "createdAt">) => {
    setData((d) => ({
      ...d,
      milkEntries: [...d.milkEntries, { ...e, id: uid(), createdAt: Date.now() }],
    }));
  }, []);

  const updateMilkEntry = useCallback((id: string, e: Partial<MilkEntry>) => {
    setData((d) => ({
      ...d,
      milkEntries: d.milkEntries.map((m) => (m.id === id ? { ...m, ...e } : m)),
    }));
  }, []);

  const deleteMilkEntry = useCallback((id: string) => {
    setData((d) => ({ ...d, milkEntries: d.milkEntries.filter((m) => m.id !== id) }));
  }, []);

  const addMilkType = useCallback((m: Omit<MilkType, "id">) => {
    setData((d) => ({ ...d, milkTypes: [...d.milkTypes, { ...m, id: uid() }] }));
  }, []);

  const updateMilkType = useCallback((id: string, m: Partial<MilkType>) => {
    setData((d) => ({ ...d, milkTypes: d.milkTypes.map((x) => (x.id === id ? { ...x, ...m } : x)) }));
  }, []);

  const deleteMilkType = useCallback((id: string) => {
    setData((d) => ({ ...d, milkTypes: d.milkTypes.filter((m) => m.id !== id) }));
  }, []);

  const addExpense = useCallback((e: Omit<Expense, "id" | "createdAt">) => {
    setData((d) => ({ ...d, expenses: [...d.expenses, { ...e, id: uid(), createdAt: Date.now() }] }));
  }, []);

  const updateExpense = useCallback((id: string, e: Partial<Expense>) => {
    setData((d) => ({ ...d, expenses: d.expenses.map((x) => (x.id === id ? { ...x, ...e } : x)) }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  }, []);

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
