"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AppData,
  DEFAULT_MILK_TYPES,
  DEFAULT_PRODUCTS,
  Expense,
  MilkEntry,
  MilkType,
  Product,
  ProductSale,
  Customer,
} from "./types";

const STORAGE_KEY = "milk-management-data-v1";
const MILK_MONTH_PREFIX = "milk-management-milk-";

const emptyData: AppData = {
  milkTypes: DEFAULT_MILK_TYPES,
  milkEntries: [],
  products: DEFAULT_PRODUCTS,
  productSales: [],
  expenses: [],
  customers: [],
};

function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function loadData(): AppData {
  if (typeof window === "undefined") return emptyData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...emptyData, ...parsed, milkEntries: loadAllMilkEntries() };
  } catch {
    return emptyData;
  }
}

function loadAllMilkEntries(): MilkEntry[] {
  if (typeof window === "undefined") return [];
  const entries: MilkEntry[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(MILK_MONTH_PREFIX)) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) entries.push(...(JSON.parse(raw) as MilkEntry[]));
    } catch {
      // skip corrupt month bucket
    }
  }
  return entries;
}

function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  const { milkEntries: _milkEntries, ...rest } = data;
  void _milkEntries;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

function saveMilkEntriesByMonth(milkEntries: MilkEntry[]) {
  if (typeof window === "undefined") return;
  // clear existing month buckets first so removed/emptied months don't linger
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(MILK_MONTH_PREFIX)) window.localStorage.removeItem(key);
  }
  const byMonth = new Map<string, MilkEntry[]>();
  for (const entry of milkEntries) {
    const month = monthOf(entry.date);
    const list = byMonth.get(month) ?? [];
    list.push(entry);
    byMonth.set(month, list);
  }
  for (const [month, list] of byMonth) {
    window.localStorage.setItem(MILK_MONTH_PREFIX + month, JSON.stringify(list));
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
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
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addProductSale: (s: Omit<ProductSale, "id" | "createdAt">) => void;
  updateProductSale: (id: string, s: Partial<ProductSale>) => void;
  deleteProductSale: (id: string) => void;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id">) => void;
  deleteCustomer: (id: string) => void;
  resetAll: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveData(data);
    saveMilkEntriesByMonth(data.milkEntries);
  }, [data, ready]);

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

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setData((d) => ({ ...d, products: [...d.products, { ...p, id: uid() }] }));
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setData((d) => ({ ...d, products: d.products.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }));
  }, []);

  const addProductSale = useCallback((s: Omit<ProductSale, "id" | "createdAt">) => {
    setData((d) => ({
      ...d,
      productSales: [...d.productSales, { ...s, id: uid(), createdAt: Date.now() }],
    }));
  }, []);

  const updateProductSale = useCallback((id: string, s: Partial<ProductSale>) => {
    setData((d) => ({
      ...d,
      productSales: d.productSales.map((x) => (x.id === id ? { ...x, ...s } : x)),
    }));
  }, []);

  const deleteProductSale = useCallback((id: string) => {
    setData((d) => ({ ...d, productSales: d.productSales.filter((s) => s.id !== id) }));
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

  const addCustomer = useCallback((c: Omit<Customer, "id">) => {
    setData((d) => ({ ...d, customers: [...d.customers, { ...c, id: uid() }] }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setData((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }));
  }, []);

  const resetAll = useCallback(() => {
    setData(emptyData);
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
        addProduct,
        updateProduct,
        deleteProduct,
        addProductSale,
        updateProductSale,
        deleteProductSale,
        addExpense,
        updateExpense,
        deleteExpense,
        addCustomer,
        deleteCustomer,
        resetAll,
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
