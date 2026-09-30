import { NextResponse, type NextRequest } from "next/server";
import { customersStore } from "@/lib/store/customers-store";
import { customerSchema } from "@/schemas/customer";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (!error && data) {
        const customerObj = {
          ...data,
          address: {
            street: data.street || "",
            number: data.number || "",
            complement: data.complement || "",
            neighborhood: data.neighborhood || "",
            city: data.city || "",
            state: data.state || "",
            zip_code: data.zip_code || "",
          },
          total_spent: Number(data.total_spent || 0),
          orders_count: Number(data.orders_count || 0),
          credit_limit: Number(data.credit_limit || 0),
        };
        return NextResponse.json({ customer: customersStore.enrichCustomer(customerObj) });
      }
    } catch {
      // Fallback
    }
  }

  const customer = customersStore.getCustomerById(id);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const json = await request.json();
    const result = customerSchema.safeParse(json);
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
          name: d.name,
          email: d.email || null,
          phone: d.phone || null,
          cpf_cnpj: d.cpf_cnpj || null,
          birth_date: d.birth_date || null,
          street: d.street || null,
          number: d.number || null,
          complement: d.complement || null,
          neighborhood: d.neighborhood || null,
          city: d.city || null,
          state: d.state || null,
          zip_code: d.zip_code || null,
          notes: d.notes || null,
          active: d.active ?? true,
          credit_limit: d.credit_limit || 0,
        };

        const { data: updatedCustomer, error } = await supabase
          .from("customers")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (!error && updatedCustomer) {
          const customerObj = {
            ...updatedCustomer,
            address: {
              street: updatedCustomer.street || "",
              number: updatedCustomer.number || "",
              complement: updatedCustomer.complement || "",
              neighborhood: updatedCustomer.neighborhood || "",
              city: updatedCustomer.city || "",
              state: updatedCustomer.state || "",
              zip_code: updatedCustomer.zip_code || "",
            },
            total_spent: Number(updatedCustomer.total_spent || 0),
            orders_count: Number(updatedCustomer.orders_count || 0),
            credit_limit: Number(updatedCustomer.credit_limit || 0),
          };

          try {
            customersStore.syncCustomer(customerObj);
          } catch {
            // Ignore
          }

          return NextResponse.json({ customer: customerObj });
        }
      } catch {
        // Fallback
      }
    }

    const updated = customersStore.updateCustomer(id, {
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
  const { id } = params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (!error) {
        customersStore.deleteCustomer(id);
        return NextResponse.json({ success: true });
      }
    } catch {
      // Fallback
    }
  }

  const ok = customersStore.deleteCustomer(id);
  if (!ok) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ success: true });
}
