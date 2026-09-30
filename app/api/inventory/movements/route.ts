import { NextResponse, type NextRequest } from "next/server";
import { inventoryStore } from "@/lib/store/inventory-store";
import { stockMovementSchema } from "@/schemas/inventory";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId") || undefined;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("stock_movements")
        .select(`
          id,
          variant_id,
          type,
          quantity,
          previous_stock,
          new_stock,
          reason,
          reference_id,
          created_at,
          variant:product_variants(size, color, sku_variant, product:products(name))
        `)
        .order("created_at", { ascending: false });

      if (variantId) {
        query = query.eq("variant_id", variantId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((m: any) => ({
          id: m.id,
          variant_id: m.variant_id,
          product_name: m.variant?.product?.name || "Produto",
          sku_variant: m.variant?.sku_variant || "",
          size: m.variant?.size || "Único",
          color: m.variant?.color || "Padrão",
          type: m.type,
          quantity: m.quantity,
          previous_stock: m.previous_stock,
          new_stock: m.new_stock,
          reason: m.reason,
          reference_id: m.reference_id,
          created_at: m.created_at,
        }));
        return NextResponse.json({ movements: mapped });
      }
    } catch (e) {
      console.error("Erro ao buscar movimentações no Supabase:", e);
    }
  }

  const movements = inventoryStore.getMovements(variantId);
  return NextResponse.json({ movements });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = stockMovementSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const { variant_id, type, quantity, reason } = result.data;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data: newMov, error: movErr } = await supabase
          .from("stock_movements")
          .insert({
            variant_id,
            type,
            quantity,
            reason,
          })
          .select()
          .single();

        if (movErr) {
          return NextResponse.json({ error: `Erro no Supabase: ${movErr.message}` }, { status: 500 });
        }

        return NextResponse.json({ movement: newMov }, { status: 201 });
      } catch (err: any) {
        return NextResponse.json({ error: `Falha no banco: ${err?.message}` }, { status: 500 });
      }
    }

    const res = inventoryStore.recordMovement({
      variant_id,
      type,
      quantity,
      reason,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error || "Erro ao movimentar estoque." }, { status: 400 });
    }

    return NextResponse.json({ movement: res.movement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno ao registrar movimentação." }, { status: 500 });
  }
}
