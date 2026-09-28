import { NextResponse, type NextRequest } from "next/server";
import { suppliersStore } from "@/lib/store/suppliers-store";
import { supplierSchema } from "@/schemas/supplier";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supplier = suppliersStore.getSupplierById(params.id);
  if (!supplier) return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
  return NextResponse.json({ supplier });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const result = supplierSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const updated = suppliersStore.updateSupplier(params.id, {
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

    if (!updated) return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
    return NextResponse.json({ supplier: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar fornecedor." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = suppliersStore.deleteSupplier(params.id);
  if (!ok) return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
