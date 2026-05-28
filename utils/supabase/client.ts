import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
}

export const createClient = () => {
  assertSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseKey);
};