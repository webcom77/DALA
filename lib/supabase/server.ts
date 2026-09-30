import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from "./config";

export { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey };

export async function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  try {
    const cookieStore = cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    });
  } catch {
    // Se cookies() não estiver disponível no contexto, usa o cliente direto
    return createSupabaseJsClient(supabaseUrl, supabaseAnonKey);
  }
}
