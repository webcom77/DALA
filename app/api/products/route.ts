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
          ean13: p.sku,
          image_url: p.image_url || null,
          variants_count: p.variants?.length || 0,
          variants: p.variants?.map((v: any) => ({
            ...v,
            ean13: v.barcode || v.sku_variant,
          })),
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

    const eanCode = data.ean13 || data.sku || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();

        // Tenta inserir produto com image_url se disponível
        const prodPayload: Record<string, unknown> = {
          name: data.name,
          sku: eanCode.toUpperCase(),
          category_id: data.category_id || null,
          cost_price: data.cost_price,
          sale_price: data.sale_price,
          description: data.description || null,
          active: data.active,
        };
        if (data.image_url) {
          prodPayload.image_url = data.image_url;
        }

        let newProd: any = null;
        const res = await supabase.from("products").insert(prodPayload).select().single();

        if (res.error && (res.error.code === "42703" || res.error.code === "PGRST204" || res.error.message?.includes("image_url"))) {
          // Coluna image_url ainda não existe no Postgres do Supabase, tenta sem ela
          delete prodPayload.image_url;
          const retry = await supabase.from("products").insert(prodPayload).select().single();
          newProd = retry.data;
        } else if (!res.error) {
          newProd = res.data;
        }

        if (newProd) {
          // Insere as variações de grade com código EAN-13
          const variantsToInsert = data.variants.map((v) => {
            const vEan = v.ean13 || v.sku_variant || eanCode;
            return {
              product_id: newProd.id,
              size: v.size,
              color: v.color,
              sku_variant: vEan.toUpperCase(),
              barcode: v.barcode || vEan,
              active: v.active,
            };
          });

          const { data: createdVariants, error: varErr } = await supabase
            .from("product_variants")
            .insert(variantsToInsert)
            .select();

          if (!varErr) {
            const finalProduct = {
              ...newProd,
              ean13: newProd.sku,
              image_url: data.image_url || newProd.image_url || null,
              variants: createdVariants?.map((v) => ({ ...v, ean13: v.barcode || v.sku_variant })),
              variants_count: createdVariants?.length || 0,
            };

            // Mantém o store local em sincronia
            try {
              productsStore.createProduct(finalProduct as any);
            } catch {
              // Ignore
            }

            return NextResponse.json(
              { product: finalProduct },
              { status: 201 }
            );
          }
        }
      } catch {
        // Prossegue para o store local
      }
    }

    const created = productsStore.createProduct({
      name: data.name,
      sku: eanCode.toUpperCase(),
      ean13: eanCode,
      image_url: data.image_url || null,
      category_id: data.category_id || null,
      cost_price: data.cost_price,
      sale_price: data.sale_price,
      description: data.description || null,
      active: data.active,
      variants: data.variants.map((v) => {
        const vEan = v.ean13 || v.sku_variant || eanCode;
        return {
          id: "",
          product_id: "",
          size: v.size,
          color: v.color,
          sku_variant: vEan.toUpperCase(),
          ean13: vEan,
          barcode: v.barcode || vEan,
          active: v.active,
          created_at: "",
          updated_at: "",
        };
      }),
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao cadastrar produto." },
      { status: 500 }
    );
  }
}
