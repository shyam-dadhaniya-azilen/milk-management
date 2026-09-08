"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-2xl shadow-sm shadow-emerald-200">
            🥛
          </span>
          <h1 className="text-lg font-semibold text-neutral-900">Milk Manager</h1>
          <p className="text-sm text-neutral-500">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. Shyam" autoFocus />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            error={error}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
