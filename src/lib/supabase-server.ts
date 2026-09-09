import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

export const supabaseServer: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export const DATA_TABLE = "milk_manager_data";
export const SOCIETIES_TABLE = "milk_manager_societies";
