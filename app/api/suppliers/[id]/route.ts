import { NextResponse, type NextRequest } from "next/server";
import { suppliersStore } from "@/lib/store/suppliers-store";
import { supplierSchema } from "@/schemas/supplier";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();
      if (!error && data) {
        const supplierObj = {
          ...data,
          address: {
            street: data.street || "",
            number: data.number || "",
            neighborhood: data.neighborhood || "",
            city: data.city || "",
            state: data.state || "",
            zip_code: data.zip_code || "",
          },
        };
        return NextResponse.json({ supplier: supplierObj });
      }
    } catch {
      // Fallback
    }
  }

  const supplier = suppliersStore.getSupplierById(id);
  if (!supplier) return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
  return NextResponse.json({ supplier });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const json = await request.json();
    const result = supplierSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Dados inválidos", details: result.error.format() }, { status: 400 });
    }

    const d = result.data;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const updatePayload = {
          trade_name: d.trade_name,
          corporate_name: d.corporate_name,
          cnpj: d.cnpj || null,
          email: d.email || null,
          phone: d.phone || null,
          contact_person: d.contact_person || null,
          category: d.category || null,
          street: d.street || null,
          number: d.number || null,
          neighborhood: d.neighborhood || null,
          city: d.city || null,
          state: d.state || null,
          zip_code: d.zip_code || null,
          notes: d.notes || null,
          active: d.active ?? true,
        };

        const { data: updatedSupplier, error } = await supabase
          .from("suppliers")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && updatedSupplier) {
          const supplierObj = {
            ...updatedSupplier,
            address: {
              street: updatedSupplier.street || "",
              number: updatedSupplier.number || "",
              neighborhood: updatedSupplier.neighborhood || "",
              city: updatedSupplier.city || "",
              state: updatedSupplier.state || "",
              zip_code: updatedSupplier.zip_code || "",
            },
          };
          return NextResponse.json({ supplier: supplierObj });
        }
      } catch {
        // Fallback
      }
    }

    const updated = suppliersStore.updateSupplier(id, {
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
  const { id } = params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (!error) {
        suppliersStore.deleteSupplier(id);
        return NextResponse.json({ success: true });
      }
    } catch {
      // Fallback
    }
  }

  const ok = suppliersStore.deleteSupplier(id);
  if (!ok) return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
