"use client";

import React from "react";

export function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-16px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = "text-neutral-900",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <span className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-50" />
      <p className="relative text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className={`relative mt-1 text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="relative mt-0.5 text-xs text-neutral-400">{sub}</p>}
    </Card>
  );
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const base = "rounded-lg px-3.5 py-2 text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.97]";
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700",
    secondary: "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-neutral-700">{label}</span>}
      <input
        className={`rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-neutral-700">{label}</span>}
      <select
        className={`rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white p-4 shadow-xl sm:max-w-md sm:rounded-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-neutral-400">{text}</p>;
}
