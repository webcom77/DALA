import { NextResponse, type NextRequest } from "next/server";
import { customersStore } from "@/lib/store/customers-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const details = customersStore.getCustomerDebtDetails(id);
  if (!details.customer) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }
  return NextResponse.json(details);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { transactionId, amount, paymentMethod } = body;

    if (!transactionId || !amount || amount <= 0 || !paymentMethod) {
      return NextResponse.json(
        { error: "Dados inválidos para recebimento de parcela." },
        { status: 400 }
      );
    }

    const res = customersStore.receivePromissoryPayment({
      customerId: id,
      transactionId,
      amount: Number(amount),
      paymentMethod,
    });

    if (!res.success) {
      return NextResponse.json(
        { error: res.error || "Erro ao processar baixa de pagamento." },
        { status: 400 }
      );
    }

    return NextResponse.json(res, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar baixa." },
      { status: 500 }
    );
  }
}
