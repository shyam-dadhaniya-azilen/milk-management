export type AuditAction = "create" | "update" | "delete";
export type AuditEntity = "milkEntry" | "milkType" | "expense" | "member";

export interface AuditLogEntry {
  id: string;
  societyId: string;
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  summary?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

// Best-effort: a failed audit write should never block the user's actual action.
export async function logAudit(entry: {
  societyId: string;
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  summary?: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // ignore
  }
}

export async function fetchAuditLog(societyId: string): Promise<AuditLogEntry[]> {
  try {
    const res = await fetch(`/api/audit?id=${encodeURIComponent(societyId)}`);
    if (!res.ok) return [];
    const { logs } = await res.json();
    return logs ?? [];
  } catch {
    return [];
  }
}
