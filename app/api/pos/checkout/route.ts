import { NextResponse, type NextRequest } from "next/server";
import { posStore } from "@/lib/store/pos-store";
import { checkoutSaleSchema } from "@/schemas/pos";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = checkoutSaleSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
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

    return NextResponse.json({ sale }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao processar venda no PDV." }, { status: 500 });
  }
}
