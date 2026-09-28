import { NextResponse, type NextRequest } from "next/server";
import { customersStore } from "@/lib/store/customers-store";
import { customerSchema } from "@/schemas/customer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const customers = customersStore.getCustomers(search);
  return NextResponse.json({ customers });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = customerSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const created = customersStore.createCustomer({
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

    return NextResponse.json({ customer: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar cliente." }, { status: 500 });
  }
}
