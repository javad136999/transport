"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://pfbpfrtpgwlttniatohn.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_fTSh52VEYbqo122MSJVtAA_DbpgLcwD";

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
