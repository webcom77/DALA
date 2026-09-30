import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://vimjhbjscvkwusxilzmo.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cJjg2P8owQCYeU3NwtSOSw_rGbdbASA";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
