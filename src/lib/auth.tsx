"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AUTH_KEY = "milk-management-auth";
const USERS = ["Asmita", "Haresh", "Shyam"];
const PASSWORD = "Admin@123";

interface AuthContextValue {
  user: string | null;
  ready: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_KEY);
    setUser(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user && pathname !== "/login") router.replace("/login");
    if (user && pathname === "/login") router.replace("/");
  }, [ready, user, pathname, router]);

  const login = (username: string, password: string) => {
    const matched = USERS.find((u) => u.toLowerCase() === username.trim().toLowerCase());
    if (matched && password === PASSWORD) {
      window.localStorage.setItem(AUTH_KEY, matched);
      setUser(matched);
      return true;
    }
    return false;
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_KEY);
    setUser(null);
    router.replace("/login");
  };

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
