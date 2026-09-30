import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from "./config";

export { isSupabaseConfigured };

export function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
