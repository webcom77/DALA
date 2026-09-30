import { NextResponse, type NextRequest } from "next/server";
import { suppliersStore } from "@/lib/store/suppliers-store";
import { supplierSchema } from "@/schemas/supplier";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from("suppliers").select("*").order("trade_name", { ascending: true });

      if (search) {
        query = query.or(`trade_name.ilike.%${search}%,corporate_name.ilike.%${search}%,cnpj.ilike.%${search}%,category.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((s: any) => ({
          ...s,
          address: {
            street: s.street || "",
            number: s.number || "",
            neighborhood: s.neighborhood || "",
            city: s.city || "",
            state: s.state || "",
            zip_code: s.zip_code || "",
          },
        }));
        return NextResponse.json({ suppliers: mapped });
      }
    } catch {
      // Fallback
    }
  }

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const dbPayload = {
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

        const { data: newSupplier, error } = await supabase
          .from("suppliers")
          .insert(dbPayload)
          .select()
          .single();

        if (!error && newSupplier) {
          const supplierObj = {
            ...newSupplier,
            address: {
              street: newSupplier.street || "",
              number: newSupplier.number || "",
              neighborhood: newSupplier.neighborhood || "",
              city: newSupplier.city || "",
              state: newSupplier.state || "",
              zip_code: newSupplier.zip_code || "",
            },
          };
          return NextResponse.json({ supplier: supplierObj }, { status: 201 });
        }
      } catch {
        // Fallback
      }
    }

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
