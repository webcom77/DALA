import { NextResponse, type NextRequest } from "next/server";
import { financeStore } from "@/lib/store/finance-store";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    if (json.action === "mark_paid") {
      const updated = financeStore.markAsPaid(params.id, json.payment_method || "pix");
      if (!updated) return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });
      return NextResponse.json({ transaction: updated });
    }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro ao processar baixa." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = financeStore.deleteTransaction(params.id);
  if (!ok) return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
