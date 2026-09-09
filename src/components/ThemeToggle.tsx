"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 ${className}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
