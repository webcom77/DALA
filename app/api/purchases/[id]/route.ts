import { NextResponse, type NextRequest } from "next/server";
import { purchasesStore } from "@/lib/store/purchases-store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const purchase = purchasesStore.getPurchaseById(params.id);
  if (!purchase) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ purchase });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    if (json.action === "receive") {
      const updated = purchasesStore.markAsReceived(params.id);
      if (!updated) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
      return NextResponse.json({ purchase: updated });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro ao processar pedido." }, { status: 500 });
  }
}
