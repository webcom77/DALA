import { NextResponse, type NextRequest } from "next/server";
import { productsStore } from "@/lib/store/products-store";
import { productFormSchema } from "@/schemas/product";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const activeParam = searchParams.get("active");
  const active = activeParam !== null ? activeParam === "true" : undefined;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*)
        `)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      }
      if (categoryId && categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }
      if (active !== undefined) {
        query = query.eq("active", active);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((p) => ({
          ...p,
          variants_count: p.variants?.length || 0,
        }));
        return NextResponse.json({ products: mapped });
      }
    } catch {
      // Fallback
    }
  }

  const products = productsStore.getProducts({ search, categoryId, active });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = productFormSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();

        // Insere o produto
        const { data: newProd, error: prodErr } = await supabase
          .from("products")
          .insert({
            name: data.name,
            sku: data.sku.toUpperCase(),
            category_id: data.category_id || null,
            cost_price: data.cost_price,
            sale_price: data.sale_price,
            description: data.description || null,
            active: data.active,
          })
          .select()
          .single();

        if (prodErr || !newProd) {
          throw prodErr;
        }

        // Insere as variações de grade
        const variantsToInsert = data.variants.map((v) => ({
          product_id: newProd.id,
          size: v.size,
          color: v.color,
          sku_variant: v.sku_variant.toUpperCase(),
          barcode: v.barcode || null,
          active: v.active,
        }));

        const { data: createdVariants, error: varErr } = await supabase
          .from("product_variants")
          .insert(variantsToInsert)
          .select();

        if (!varErr) {
          return NextResponse.json(
            {
              product: {
                ...newProd,
                variants: createdVariants,
                variants_count: createdVariants?.length || 0,
              },
            },
            { status: 201 }
          );
        }
      } catch {
        // Prossegue para o store local
      }
    }

    const created = productsStore.createProduct({
      name: data.name,
      sku: data.sku.toUpperCase(),
      category_id: data.category_id || null,
      cost_price: data.cost_price,
      sale_price: data.sale_price,
      description: data.description || null,
      active: data.active,
      variants: data.variants.map((v) => ({
        ...v,
        id: "",
        product_id: "",
        sku_variant: v.sku_variant.toUpperCase(),
        created_at: "",
        updated_at: "",
      })),
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao cadastrar produto." },
      { status: 500 }
    );
  }
}
