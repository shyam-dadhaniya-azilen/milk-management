"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { AuditLogEntry, fetchAuditLog } from "@/lib/audit";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";

const ENTITY_LABELS: Record<string, string> = {
  milkEntry: "Milk Entry",
  milkType: "Milk Type",
  expense: "Expense",
  member: "Member",
};

const ACTION_STYLES: Record<string, string> = {
  create: "text-emerald-600 dark:text-emerald-400",
  update: "text-indigo-600 dark:text-indigo-400",
  delete: "text-red-500 dark:text-red-400",
};

export default function AuditPage() {
  const { societyId } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    const fresh = await fetchAuditLog(societyId);
    setLogs(fresh);
    setLoading(false);
  }, [societyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Log"
        action={
          <Button variant="secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />
      <Card>
        {logs.length === 0 ? (
          <EmptyState text={loading ? "Loading…" : "No changes recorded yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">User</th>
                  <th className="py-2 pr-3 font-medium">Action</th>
                  <th className="py-2 pr-3 font-medium">Item</th>
                  <th className="py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                    <td className="whitespace-nowrap py-2 pr-3 text-neutral-500 dark:text-neutral-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-medium text-neutral-800 dark:text-neutral-200">{log.user}</td>
                    <td className={`py-2 pr-3 font-semibold capitalize ${ACTION_STYLES[log.action] ?? ""}`}>{log.action}</td>
                    <td className="py-2 pr-3 text-neutral-600 dark:text-neutral-300">{ENTITY_LABELS[log.entity] ?? log.entity}</td>
                    <td className="py-2 text-neutral-500 dark:text-neutral-400">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
