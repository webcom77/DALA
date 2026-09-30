import { NextResponse } from "next/server";
import { productsStore } from "@/lib/store/products-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ categories: data });
      }
    } catch {
      // Fallback para store local
    }
  }

  const categories = productsStore.getCategories();
  return NextResponse.json({ categories });
}
