import { NextResponse, type NextRequest } from "next/server";
import { purchasesStore } from "@/lib/store/purchases-store";
import { suppliersStore } from "@/lib/store/suppliers-store";
import { purchaseOrderSchema } from "@/schemas/purchase";

export async function GET() {
  const purchases = purchasesStore.getPurchases();
  return NextResponse.json({ purchases });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = purchaseOrderSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const supplier = suppliersStore.getSupplierById(d.supplier_id);
    const supplierName = supplier?.trade_name || "Fornecedor";

    const totalAmount = d.items.reduce((acc, it) => acc + it.quantity * it.unit_cost, 0);

    const created = purchasesStore.createPurchase({
      supplier_id: d.supplier_id,
      supplier_name: supplierName,
      status: "pending",
      payment_status: "pending",
      total_amount: Number(totalAmount.toFixed(2)),
      expected_delivery: d.expected_delivery || null,
      notes: d.notes || null,
      items: d.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        product_id: it.product_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        sku_variant: it.sku_variant,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        total_cost: Number((it.quantity * it.unit_cost).toFixed(2)),
      })),
    });

    return NextResponse.json({ purchase: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar pedido de compra." }, { status: 500 });
  }
}
