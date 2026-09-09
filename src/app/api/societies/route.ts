import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, SOCIETIES_TABLE } from "@/lib/supabase-server";

export async function GET() {
  if (!supabaseServer) return NextResponse.json({ societies: [] });
  const { data, error } = await supabaseServer
    .from(SOCIETIES_TABLE)
    .select("id, payload");
  if (error)
    return NextResponse.json(
      { societies: [], error: error.message },
      { status: 500 },
    );
  const societies = (data ?? []).map((row) => ({ id: row.id, ...row.payload }));
  return NextResponse.json({ societies });
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
    .from(SOCIETIES_TABLE)
    .upsert({ id, payload });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
