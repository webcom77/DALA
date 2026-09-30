import { NextResponse, type NextRequest } from "next/server";
import { customersStore } from "@/lib/store/customers-store";
import { customerSchema } from "@/schemas/customer";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const filter = (searchParams.get("filter") || "all") as "all" | "with_debt" | "overdue" | "no_debt";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase.from("customers").select("*").order("name", { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((c: any) => {
          const custObj = {
            ...c,
            address: {
              street: c.street || "",
              number: c.number || "",
              complement: c.complement || "",
              neighborhood: c.neighborhood || "",
              city: c.city || "",
              state: c.state || "",
              zip_code: c.zip_code || "",
            },
            total_spent: Number(c.total_spent || 0),
            orders_count: Number(c.orders_count || 0),
            credit_limit: Number(c.credit_limit || 0),
          };
          // Mantém sincronizado no store local
          try {
            customersStore.syncCustomer(custObj);
          } catch {
            // Ignore
          }
          return customersStore.enrichCustomer(custObj);
        });

        let filtered = mapped;
        if (filter === "with_debt") {
          filtered = mapped.filter((c: any) => (c.total_debt || 0) > 0);
        } else if (filter === "overdue") {
          filtered = mapped.filter((c: any) => (c.overdue_debt || 0) > 0);
        } else if (filter === "no_debt") {
          filtered = mapped.filter((c: any) => (c.total_debt || 0) === 0);
        }

        return NextResponse.json({ customers: filtered });
      }
    } catch {
      // Fallback
    }
  }

  const customers = customersStore.getCustomers(search, filter);
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const dbPayload = {
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

        const { data: newCustomer, error } = await supabase
          .from("customers")
          .insert(dbPayload)
          .select()
          .single();

        if (!error && newCustomer) {
          const customerObj = {
            ...newCustomer,
            address: {
              street: newCustomer.street || "",
              number: newCustomer.number || "",
              complement: newCustomer.complement || "",
              neighborhood: newCustomer.neighborhood || "",
              city: newCustomer.city || "",
              state: newCustomer.state || "",
              zip_code: newCustomer.zip_code || "",
            },
            total_spent: Number(newCustomer.total_spent || 0),
            orders_count: Number(newCustomer.orders_count || 0),
            credit_limit: Number(newCustomer.credit_limit || 0),
          };

          try {
            customersStore.syncCustomer(customerObj);
          } catch {
            // Ignore
          }

          return NextResponse.json({ customer: customerObj }, { status: 201 });
        }
      } catch {
        // Fallback
      }
    }

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
