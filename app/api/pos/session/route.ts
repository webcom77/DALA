import { NextResponse, type NextRequest } from "next/server";
import { posStore } from "@/lib/store/pos-store";
import { openCashSessionSchema, closeCashSessionSchema } from "@/schemas/pos";

export async function GET() {
  const session = posStore.getActiveCashSession();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = openCashSessionSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const session = posStore.openCashSession(
      json.opened_by || "Operador de Caixa",
      result.data.initial_balance,
      result.data.notes
    );

    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao abrir caixa." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const result = closeCashSessionSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const session = posStore.closeCashSession(
      json.closed_by || "Operador de Caixa",
      result.data.final_balance,
      result.data.notes
    );

    if (!session) return NextResponse.json({ error: "Nenhum caixa aberto para fechar." }, { status: 400 });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Erro ao fechar caixa." }, { status: 500 });
  }
}
