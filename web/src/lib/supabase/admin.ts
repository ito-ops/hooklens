import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, supabaseAdminEnv } from "@/lib/env";

/**
 * Service-role Supabase client.
 *
 * Bypasses RLS — only use server-side for admin tasks (Stripe webhooks,
 * background jobs, etc). Never expose to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    publicEnv().NEXT_PUBLIC_SUPABASE_URL,
    supabaseAdminEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
