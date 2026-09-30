export const DEFAULT_SUPABASE_URL = "https://vimjhbjscvkwusxilzmo.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cJjg2P8owQCYeU3NwtSOSw_rGbdbASA";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  return Boolean(url && !url.includes("your-project.supabase.co"));
}
