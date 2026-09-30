import { NextResponse, type NextRequest } from "next/server";
import { inventoryStore } from "@/lib/store/inventory-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { StockLevel } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim();
  const status = searchParams.get("status");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      let prodQuery = supabase
        .from("products")
        .select(`
          id,
          name,
          sku,
          cost_price,
          sale_price,
          category:categories(name),
          variants:product_variants(id, size, color, sku_variant)
        `)
        .order("name", { ascending: true });

      if (search) {
        prodQuery = prodQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      }

      const [{ data: prods, error: prodErr }, { data: movs }] = await Promise.all([
        prodQuery,
        supabase.from("stock_movements").select("variant_id, type, quantity"),
      ]);

      if (!prodErr && prods) {
        const stockMap = new Map<string, number>();
        (movs || []).forEach((m: any) => {
          const cur = stockMap.get(m.variant_id) || 0;
          if (m.type === "entry" || m.type === "purchase") {
            stockMap.set(m.variant_id, cur + Number(m.quantity || 0));
          } else if (m.type === "exit" || m.type === "sale") {
            stockMap.set(m.variant_id, cur - Number(m.quantity || 0));
          } else {
            stockMap.set(m.variant_id, cur + Number(m.quantity || 0));
          }
        });

        const list: StockLevel[] = [];
        prods.forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            const current = stockMap.get(v.id) || 0;
            let itemStatus: "normal" | "low" | "out_of_stock" = "normal";
            if (current <= 0) {
              itemStatus = "out_of_stock";
            } else if (current <= 2) {
              itemStatus = "low";
            }

            if (status && status !== "all" && itemStatus !== status) {
              return;
            }

            list.push({
              variant_id: v.id,
              product_id: p.id,
              product_name: p.name,
              sku: p.sku,
              sku_variant: v.sku_variant,
              size: v.size,
              color: v.color,
              current_stock: current,
              min_stock: 2,
              cost_price: Number(p.cost_price || 0),
              sale_price: Number(p.sale_price || 0),
              status: itemStatus,
              category_name: p.category?.name || "Sem categoria",
            });
          });
        });

        return NextResponse.json({ stockLevels: list });
      }
    } catch (e) {
      console.error("Erro ao buscar estoque no Supabase:", e);
    }
  }

  const stockLevels = inventoryStore.getStockLevels({ search, status: status || undefined });
  return NextResponse.json({ stockLevels });
}
