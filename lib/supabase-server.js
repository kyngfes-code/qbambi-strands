"use server";

import { createClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key missing");
  }

  return createClient(supabaseUrl, supabaseKey);
}
