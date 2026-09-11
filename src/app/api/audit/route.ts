import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, AUDIT_TABLE } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!supabaseServer) return NextResponse.json({ logs: [] });
  const { data, error } = await supabaseServer
    .from(AUDIT_TABLE)
    .select("*")
    .eq("society_id", id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error)
    return NextResponse.json({ logs: [], error: error.message }, { status: 500 });
  const logs = (data ?? []).map((row) => ({
    id: row.id,
    societyId: row.society_id,
    user: row.user_name,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    summary: row.summary,
    before: row.before,
    after: row.after,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  if (!supabaseServer)
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const { societyId, user, action, entity, entityId, summary, before, after } = body as {
    societyId: string;
    user: string;
    action: string;
    entity: string;
    entityId: string;
    summary?: string;
    before?: unknown;
    after?: unknown;
  };
  if (!societyId || !user || !action || !entity || !entityId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const { error } = await supabaseServer.from(AUDIT_TABLE).insert({
    society_id: societyId,
    user_name: user,
    action,
    entity,
    entity_id: entityId,
    summary: summary ?? null,
    before: before ?? null,
    after: after ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
