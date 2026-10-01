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

      // Busca todos os produtos com paginação (limite de 1000 do PostgREST)
      let allProds: any[] = [];
      let page = 0;
      while (true) {
        let q = supabase
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
          .order("created_at", { ascending: false })
          .range(page * 1000, (page + 1) * 1000 - 1);

        if (search) {
          q = q.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        const { data: pageProds, error: pErr } = await q;
        if (pErr || !pageProds || pageProds.length === 0) break;
        allProds = allProds.concat(pageProds);
        if (pageProds.length < 1000) break;
        page++;
      }

      // Busca todas as movimentações de estoque
      let allMovs: any[] = [];
      let mPage = 0;
      while (true) {
        const { data: pageMovs, error: mErr } = await supabase
          .from("stock_movements")
          .select("variant_id, type, quantity")
          .range(mPage * 1000, (mPage + 1) * 1000 - 1);
        if (mErr || !pageMovs || pageMovs.length === 0) break;
        allMovs = allMovs.concat(pageMovs);
        if (pageMovs.length < 1000) break;
        mPage++;
      }

      if (allProds.length > 0) {
        const stockMap = new Map<string, number>();
        allMovs.forEach((m: any) => {
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
        allProds.forEach((p: any) => {
          (p.variants || []).forEach((v: any) => {
            const current = stockMap.get(v.id) || 0;
            const itemStatus: "normal" | "low" | "out_of_stock" =
              current <= 0 ? "out_of_stock" : "normal";

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
              min_stock: 0,
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
