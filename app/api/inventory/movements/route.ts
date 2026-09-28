import { NextResponse, type NextRequest } from "next/server";
import { inventoryStore } from "@/lib/store/inventory-store";
import { stockMovementSchema } from "@/schemas/inventory";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId") || undefined;
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
