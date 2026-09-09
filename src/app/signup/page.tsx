"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button, Card, Input, PasswordInput } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signup({ username, password, societyName, blockNumber });
    if (!result.ok) setError(result.error ?? "Signup failed");
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <Card className="w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center gap-2">
          <img src="/stock-vector-vector-logo-milk.jpeg" alt="Milk Manager" className="h-20 w-20 rounded-2xl object-cover shadow-sm shadow-indigo-200" />
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Create Account</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Join or create your society</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. Shyam" autoFocus />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <Input
            label="Society Name"
            value={societyName}
            onChange={(e) => setSocietyName(e.target.value)}
            placeholder="e.g. Green Valley"
          />
          <Input
            label="Block Number"
            value={blockNumber}
            onChange={(e) => setBlockNumber(e.target.value)}
            placeholder="e.g. A-101"
            error={error}
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Same society + block joins that society&apos;s shared data; a new combination creates a new society.
          </p>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
