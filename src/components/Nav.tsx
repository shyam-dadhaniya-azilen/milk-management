"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const links = [
  { href: "/", label: "Milk" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/bill", label: "Bill" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, societyName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-neutral-800/70 dark:bg-neutral-950/80 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
            <img
              src="/stock-vector-vector-logo-milk.jpeg"
              alt="Milk Manager"
              className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-indigo-500/30"
            />
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity print:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] transform flex-col bg-white shadow-2xl transition-transform dark:bg-neutral-900 print:hidden ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3.5 dark:border-neutral-800">
          <span className="flex items-center gap-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
            <img
              src="/stock-vector-vector-logo-milk.jpeg"
              alt="Milk Manager"
              className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-indigo-500/30"
            />
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{user}</span> · {societyName}
            </span>
            <button onClick={logout} className="text-xs font-medium text-red-500 hover:underline dark:text-red-400">
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
