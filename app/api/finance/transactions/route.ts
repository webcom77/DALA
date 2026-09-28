import { NextResponse, type NextRequest } from "next/server";
import { financeStore } from "@/lib/store/finance-store";
import { financialTransactionSchema } from "@/schemas/finance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const transactions = financeStore.getTransactions({ type, status, search });
  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = financialTransactionSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const created = financeStore.createTransaction({
      type: d.type,
      category: d.category,
      description: d.description,
      amount: d.amount,
      due_date: d.due_date,
      paid_at: d.paid_at || null,
      status: d.status,
      payment_method: d.payment_method || null,
      supplier_id: d.supplier_id || null,
      customer_id: d.customer_id || null,
      notes: d.notes || null,
    });

    return NextResponse.json({ transaction: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar lançamento financeiro." }, { status: 500 });
  }
}
