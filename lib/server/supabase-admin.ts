import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseAdminClient() {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!supabaseUrl || !supabaseAdminKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export function getSupabaseAppStateTable() {
  return process.env.SUPABASE_APP_STATE_TABLE || "app_state";
}

export function getSupabaseInvoicesBucket() {
  return process.env.SUPABASE_INVOICES_BUCKET || "invoices";
}

export function isSupabaseAvailable() {
  return Boolean(getSupabaseAdminClient());
}