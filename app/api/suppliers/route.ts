import { NextResponse, type NextRequest } from "next/server";
import { suppliersStore } from "@/lib/store/suppliers-store";
import { supplierSchema } from "@/schemas/supplier";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const suppliers = suppliersStore.getSuppliers(search);
  return NextResponse.json({ suppliers });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = supplierSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const created = suppliersStore.createSupplier({
      trade_name: d.trade_name,
      corporate_name: d.corporate_name,
      cnpj: d.cnpj || null,
      email: d.email || null,
      phone: d.phone || null,
      contact_person: d.contact_person || null,
      category: d.category || null,
      address: {
        street: d.street,
        number: d.number,
        neighborhood: d.neighborhood,
        city: d.city,
        state: d.state,
        zip_code: d.zip_code,
      },
      notes: d.notes || null,
      active: d.active,
    });

    return NextResponse.json({ supplier: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar fornecedor." }, { status: 500 });
  }
}
