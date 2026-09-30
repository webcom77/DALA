import { NextResponse, type NextRequest } from "next/server";
import { posStore } from "@/lib/store/pos-store";
import { checkoutSaleSchema } from "@/schemas/pos";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = checkoutSaleSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;

    // 1. Processa no store local para compatibilidade imediata
    const sale = posStore.checkoutSale({
      customer_id: d.customer_id,
      customer_name: d.customer_name,
      items: d.items,
      subtotal: d.subtotal,
      discount: d.discount,
      total_amount: d.total_amount,
      payment_method: d.payment_method,
      amount_received: d.amount_received,
      change_amount: d.change_amount,
      installments: d.installments,
    });

    // 2. Se o Supabase estiver configurado, persiste permanentemente
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();

        // Localiza caixa aberto para associar a venda
        const { data: activeSession } = await supabase
          .from("cash_sessions")
          .select("*")
          .eq("status", "open")
          .order("opened_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Salva a venda no Supabase
        const salePayload: Record<string, unknown> = {
          sale_number: sale.sale_number,
          customer_id: d.customer_id || null,
          cash_session_id: activeSession?.id || null,
          subtotal: d.subtotal,
          discount: d.discount,
          total_amount: d.total_amount,
          payment_method: d.payment_method,
          amount_received: d.amount_received || null,
          change_amount: d.change_amount || null,
          installments: d.installments || 1,
          status: "completed",
        };

        const { data: dbSale, error: saleErr } = await supabase
          .from("sales")
          .insert(salePayload)
          .select()
          .single();

        if (!saleErr && dbSale) {
          // Salva os itens da venda
          const itemsPayload = d.items.map((it) => ({
            sale_id: dbSale.id,
            variant_id: it.variant_id,
            product_id: it.product_id,
            product_name: it.product_name,
            sku_variant: it.sku_variant,
            size: it.size,
            color: it.color,
            quantity: it.quantity,
            unit_price: it.unit_price,
            discount: it.discount || 0,
            total_price: it.total_price,
          }));

          await supabase.from("sale_items").insert(itemsPayload);

          // Registra movimentação de baixa de estoque no Supabase
          const stockMovements = d.items.map((it) => ({
            variant_id: it.variant_id,
            type: "sale",
            quantity: it.quantity,
            reason: `Venda no PDV ${sale.sale_number}`,
            reference_id: dbSale.id,
          }));

          await supabase.from("stock_movements").insert(stockMovements);

          // Se houver turno de caixa aberto, atualiza o acumulado da sessão
          if (activeSession) {
            const addedAmount = Number(d.total_amount || 0);
            let addedCash = 0;
            let addedPix = 0;
            let addedCard = 0;

            if (d.payment_method === "money") {
              addedCash = addedAmount;
            } else if (d.payment_method === "pix") {
              addedPix = addedAmount;
            } else if (d.payment_method === "credit_card" || d.payment_method === "debit_card") {
              addedCard = addedAmount;
            }

            await supabase
              .from("cash_sessions")
              .update({
                total_sales: Number(((activeSession.total_sales || 0) + addedAmount).toFixed(2)),
                total_cash: Number(((activeSession.total_cash || 0) + addedCash).toFixed(2)),
                total_pix: Number(((activeSession.total_pix || 0) + addedPix).toFixed(2)),
                total_card: Number(((activeSession.total_card || 0) + addedCard).toFixed(2)),
              })
              .eq("id", activeSession.id);
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar venda com Supabase:", err);
      }
    }

    return NextResponse.json({ sale }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao processar venda no PDV." }, { status: 500 });
  }
}
