import { NextResponse, type NextRequest } from "next/server";
import { productsStore } from "@/lib/store/products-store";
import { productFormSchema } from "@/schemas/product";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          variants:product_variants(*)
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return NextResponse.json({
          product: {
            ...data,
            variants_count: data.variants?.length || 0,
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  const product = productsStore.getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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

        // Atualiza o produto base
        const { data: updatedProd, error: prodErr } = await supabase
          .from("products")
          .update({
            name: data.name,
            sku: data.sku.toUpperCase(),
            category_id: data.category_id || null,
            cost_price: data.cost_price,
            sale_price: data.sale_price,
            description: data.description || null,
            active: data.active,
          })
          .eq("id", id)
          .select()
          .single();

        if (prodErr) throw prodErr;

        // Atualiza variações: remove as que não estão mais presentes e atualiza/insere as novas
        await supabase.from("product_variants").delete().eq("product_id", id);

        const variantsToInsert = data.variants.map((v) => ({
          product_id: id,
          size: v.size,
          color: v.color,
          sku_variant: v.sku_variant.toUpperCase(),
          barcode: v.barcode || null,
          active: v.active,
        }));

        const { data: insertedVariants } = await supabase
          .from("product_variants")
          .insert(variantsToInsert)
          .select();

        return NextResponse.json({
          product: {
            ...updatedProd,
            variants: insertedVariants,
            variants_count: insertedVariants?.length || 0,
          },
        });
      } catch {
        // Fallback
      }
    }

    const updated = productsStore.updateProduct(id, {
      name: data.name,
      sku: data.sku.toUpperCase(),
      category_id: data.category_id || null,
      cost_price: data.cost_price,
      sale_price: data.sale_price,
      description: data.description || null,
      active: data.active,
      variants: data.variants.map((v) => ({
        ...v,
        id: v.id || "",
        product_id: id,
        sku_variant: v.sku_variant.toUpperCase(),
        created_at: "",
        updated_at: "",
      })),
    });

    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar produto." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        return NextResponse.json({ success: true });
      }
    } catch {
      // Fallback
    }
  }

  const deleted = productsStore.deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
