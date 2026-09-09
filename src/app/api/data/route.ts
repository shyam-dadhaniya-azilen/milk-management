import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, DATA_TABLE } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!supabaseServer) return NextResponse.json({ payload: null });
  const { data, error } = await supabaseServer
    .from(DATA_TABLE)
    .select("payload")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { payload: null, error: error.message },
      { status: 500 },
    );
  return NextResponse.json({ payload: data?.payload ?? null });
}

export async function POST(req: NextRequest) {
  if (!supabaseServer)
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  const body = await req.json();
  const { id, payload } = body as { id: string; payload: unknown };
  if (!id || !payload)
    return NextResponse.json(
      { error: "Missing id or payload" },
      { status: 400 },
    );
  const { error } = await supabaseServer
    .from(DATA_TABLE)
    .upsert({ id, payload, updated_at: new Date().toISOString() });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
