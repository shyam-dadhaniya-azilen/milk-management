"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AUTH_KEY = "milk-management-auth";

export interface Member {
  name: string;
  password: string;
}

export interface Society {
  id: string;
  societyName: string;
  blockNumber: string;
  members: Member[];
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchSocieties(): Promise<{ ok: boolean; societies: Society[] }> {
  try {
    const res = await fetch("/api/societies");
    if (!res.ok) return { ok: false, societies: [] };
    const { societies } = await res.json();
    return { ok: true, societies: societies ?? [] };
  } catch {
    return { ok: false, societies: [] };
  }
}

async function pushSociety(society: Society) {
  try {
    await fetch("/api/societies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: society.id,
        payload: { societyName: society.societyName, blockNumber: society.blockNumber, members: society.members },
      }),
    });
  } catch {
    // best-effort — UI already reflects the optimistic update
  }
}

// Push then immediately re-fetch (GET) so the UI reflects what the server actually confirmed.
async function pushSocietyAndRefresh(society: Society, onFresh: (societies: Society[]) => void) {
  await pushSociety(society);
  const { ok, societies: fresh } = await fetchSocieties();
  if (ok) onFresh(fresh);
}

interface StoredAuth {
  user: string;
  societyId: string;
}

interface AuthContextValue {
  user: string | null;
  societyId: string | null;
  societyName: string | null;
  members: Member[];
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: { username: string; password: string; societyName: string; blockNumber: string }) => { ok: boolean; error?: string };
  addMember: (username: string, password: string) => { ok: boolean; error?: string };
  updateMember: (oldName: string, next: { name: string; password: string }) => { ok: boolean; error?: string };
  removeMember: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function findMember(societies: Society[], username: string): { society: Society; member: Member } | null {
  const clean = username.trim().toLowerCase();
  for (const society of societies) {
    const member = society.members.find((m) => m.name.toLowerCase() === clean);
    if (member) return { society, member };
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const { societies: loaded } = await fetchSocieties();
      setSocieties(loaded);
      try {
        const raw = window.localStorage.getItem(AUTH_KEY);
        setAuth(raw ? (JSON.parse(raw) as StoredAuth) : null);
      } catch {
        setAuth(null);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!auth && pathname !== "/login" && pathname !== "/signup") router.replace("/login");
    if (auth && (pathname === "/login" || pathname === "/signup")) router.replace("/");
  }, [ready, auth, pathname, router]);

  // Re-fetch societies/members on every navigation so changes made elsewhere (another member
  // adding/editing a member) show up without a full reload.
  useEffect(() => {
    if (!ready || !auth) return;
    let cancelled = false;
    (async () => {
      const { ok, societies: loaded } = await fetchSocieties();
      if (!cancelled && ok) setSocieties(loaded);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login: AuthContextValue["login"] = async (username, password) => {
    const { ok, societies: fresh } = await fetchSocieties();
    // If this refetch failed but we already have societies loaded from an earlier successful
    // fetch, fall back to those rather than failing outright on a transient network hiccup.
    if (!ok && societies.length === 0) {
      return { ok: false, error: "Could not reach the server. Check your connection and try again." };
    }
    const list = ok ? fresh : societies;
    if (ok) setSocieties(fresh);

    const found = findMember(list, username);
    if (found && found.member.password === password) {
      const next: StoredAuth = { user: found.member.name, societyId: found.society.id };
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      setAuth(next);
      return { ok: true };
    }
    return { ok: false, error: "Invalid username or password" };
  };

  const signup: AuthContextValue["signup"] = ({ username, password, societyName, blockNumber }) => {
    const name = username.trim();
    if (!name || !password || !societyName.trim() || !blockNumber.trim()) {
      return { ok: false, error: "All fields are required" };
    }
    if (findMember(societies, name)) {
      return { ok: false, error: "Username already taken" };
    }

    const existing = societies.find(
      (s) =>
        s.societyName.toLowerCase() === societyName.trim().toLowerCase() && s.blockNumber.toLowerCase() === blockNumber.trim().toLowerCase()
    );

    let societyId: string;
    let updatedSociety: Society;
    if (existing) {
      societyId = existing.id;
      updatedSociety = { ...existing, members: [...existing.members, { name, password }] };
    } else {
      societyId = slugify(`${societyName}-${blockNumber}`) || `society-${Date.now()}`;
      updatedSociety = { id: societyId, societyName: societyName.trim(), blockNumber: blockNumber.trim(), members: [{ name, password }] };
    }

    setSocieties((prev) => (existing ? prev.map((s) => (s.id === societyId ? updatedSociety : s)) : [...prev, updatedSociety]));
    pushSocietyAndRefresh(updatedSociety, setSocieties);

    const next: StoredAuth = { user: name, societyId };
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    setAuth(next);
    return { ok: true };
  };

  const addMember: AuthContextValue["addMember"] = (username, password) => {
    const name = username.trim();
    if (!name || !password) return { ok: false, error: "Username and password are required" };
    if (!auth) return { ok: false, error: "Not signed in" };
    if (findMember(societies, name)) return { ok: false, error: "Username already taken" };

    const society = societies.find((s) => s.id === auth.societyId);
    if (!society) return { ok: false, error: "Society not found" };
    const updated: Society = { ...society, members: [...society.members, { name, password }] };
    setSocieties((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    pushSocietyAndRefresh(updated, setSocieties);
    return { ok: true };
  };

  const updateMember: AuthContextValue["updateMember"] = (oldName, { name, password }) => {
    const trimmedName = name.trim();
    if (!auth) return { ok: false, error: "Not signed in" };
    if (!trimmedName || !password) return { ok: false, error: "Name and password are required" };
    if (trimmedName.toLowerCase() !== oldName.toLowerCase() && findMember(societies, trimmedName)) {
      return { ok: false, error: "Username already taken" };
    }

    const society = societies.find((s) => s.id === auth.societyId);
    if (!society) return { ok: false, error: "Society not found" };
    const updated: Society = {
      ...society,
      members: society.members.map((m) => (m.name === oldName ? { name: trimmedName, password } : m)),
    };
    setSocieties((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    pushSocietyAndRefresh(updated, setSocieties);

    if (auth.user === oldName) {
      const next: StoredAuth = { user: trimmedName, societyId: auth.societyId };
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      setAuth(next);
    }
    return { ok: true };
  };

  const removeMember = (username: string) => {
    if (!auth) return;
    const society = societies.find((s) => s.id === auth.societyId);
    if (!society) return;
    const updated: Society = { ...society, members: society.members.filter((m) => m.name !== username) };
    setSocieties((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    pushSocietyAndRefresh(updated, setSocieties);
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_KEY);
    setAuth(null);
    router.replace("/login");
  };

  const society = auth ? societies.find((s) => s.id === auth.societyId) ?? null : null;

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        societyId: auth?.societyId ?? null,
        societyName: society ? `${society.societyName} · ${society.blockNumber}` : null,
        members: society?.members ?? [],
        ready,
        login,
        signup,
        addMember,
        updateMember,
        removeMember,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
