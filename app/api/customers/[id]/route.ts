import { NextResponse, type NextRequest } from "next/server";
import { customersStore } from "@/lib/store/customers-store";
import { customerSchema } from "@/schemas/customer";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = customersStore.getCustomerById(params.id);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const result = customerSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const updated = customersStore.updateCustomer(params.id, {
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      cpf_cnpj: d.cpf_cnpj || null,
      birth_date: d.birth_date || null,
      address: {
        street: d.street,
        number: d.number,
        complement: d.complement,
        neighborhood: d.neighborhood,
        city: d.city,
        state: d.state,
        zip_code: d.zip_code,
      },
      notes: d.notes || null,
      active: d.active,
    });

    if (!updated) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    return NextResponse.json({ customer: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cliente." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = customersStore.deleteCustomer(params.id);
  if (!ok) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
