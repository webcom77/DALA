import { NextResponse, type NextRequest } from "next/server";
import { productsStore } from "@/lib/store/products-store";
import { productFormSchema } from "@/schemas/product";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (isSupabaseConfigured()) {
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
            ean13: data.sku,
            image_url: data.image_url || null,
            variants_count: data.variants?.length || 0,
            variants: data.variants?.map((v: any) => ({
              ...v,
              ean13: v.barcode || v.sku_variant,
            })),
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
    const eanCode = data.ean13 || data.sku || "";

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();

        // Atualiza o produto base
        const updatePayload: Record<string, unknown> = {
          name: data.name,
          sku: eanCode.toUpperCase(),
          category_id: data.category_id || null,
          cost_price: data.cost_price,
          sale_price: data.sale_price,
          description: data.description || null,
          active: data.active,
        };
        if (data.image_url !== undefined) {
          updatePayload.image_url = data.image_url;
        }

        let updatedProd: any = null;
        let res = await supabase.from("products").update(updatePayload).eq("id", id).select().single();

        if (res.error && (res.error.code === "42703" || res.error.code === "PGRST204" || res.error.message?.includes("image_url"))) {
          delete updatePayload.image_url;
          res = await supabase.from("products").update(updatePayload).eq("id", id).select().single();
        }

        if (res.error) {
          console.error("Erro ao atualizar produto no Supabase:", res.error);
          if (res.error.code === "23505") {
            return NextResponse.json(
              { error: "Já existe outra peça com este código EAN-13 cadastrado." },
              { status: 409 }
            );
          }
          return NextResponse.json(
            { error: `Erro no banco de dados: ${res.error.message}` },
            { status: 500 }
          );
        }

        updatedProd = res.data;

        if (updatedProd) {
          // Atualiza variações: remove as antigas e insere com código EAN-13
          await supabase.from("product_variants").delete().eq("product_id", id);

          const variantsToInsert = data.variants.map((v) => {
            const vEan = v.ean13 || v.sku_variant || eanCode;
            return {
              product_id: id,
              size: v.size,
              color: v.color,
              sku_variant: vEan.toUpperCase(),
              barcode: v.barcode || vEan,
              active: v.active,
            };
          });

          const { data: insertedVariants, error: varErr } = await supabase
            .from("product_variants")
            .insert(variantsToInsert)
            .select();

          if (varErr) {
            console.error("Erro ao atualizar variações no Supabase:", varErr);
            return NextResponse.json(
              { error: `Erro ao atualizar variações da grade: ${varErr.message}` },
              { status: 500 }
            );
          }

          const finalProduct = {
            ...updatedProd,
            ean13: updatedProd.sku,
            image_url: data.image_url !== undefined ? data.image_url : updatedProd.image_url,
            variants: insertedVariants?.map((v) => ({ ...v, ean13: v.barcode || v.sku_variant })),
            variants_count: insertedVariants?.length || 0,
          };

          try {
            productsStore.updateProduct(id, finalProduct as any);
          } catch {
            // Ignore
          }

          return NextResponse.json({ product: finalProduct });
        }
      } catch (err: unknown) {
        console.error("Exceção ao atualizar produto no Supabase:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao atualizar produto.";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    const updated = productsStore.updateProduct(id, {
      name: data.name,
      sku: eanCode.toUpperCase(),
      ean13: eanCode,
      image_url: data.image_url,
      category_id: data.category_id || null,
      cost_price: data.cost_price,
      sale_price: data.sale_price,
      description: data.description || null,
      active: data.active,
      variants: data.variants.map((v) => {
        const vEan = v.ean13 || v.sku_variant || eanCode;
        return {
          id: v.id || "",
          product_id: id,
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

    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao atualizar produto." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Erro ao deletar produto no Supabase:", error);
        return NextResponse.json(
          { error: `Erro ao excluir produto no banco: ${error.message}` },
          { status: 500 }
        );
      }
      productsStore.deleteProduct(id);
      return NextResponse.json({ success: true });
    } catch (err: unknown) {
      console.error("Exceção ao excluir produto no Supabase:", err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao excluir produto.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const deleted = productsStore.deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
