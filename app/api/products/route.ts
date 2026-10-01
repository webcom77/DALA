import { NextResponse, type NextRequest } from "next/server";
import { productsStore } from "@/lib/store/products-store";
import { inventoryStore } from "@/lib/store/inventory-store";
import { productFormSchema } from "@/schemas/product";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const activeParam = searchParams.get("active");
  const active = activeParam !== null ? activeParam === "true" : undefined;

  if (isSupabaseConfigured()) {
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

        // Mantém store sincronizado
        try {
          mapped.forEach((prod) => productsStore.createProduct(prod as any));
        } catch {
          // Ignore
        }

        return NextResponse.json({ products: mapped });
      }
      if (error) {
        console.error("Erro ao listar produtos no Supabase:", error);
      }
    } catch (err) {
      console.error("Exceção ao listar produtos no Supabase:", err);
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

    if (isSupabaseConfigured()) {
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
        let res = await supabase.from("products").insert(prodPayload).select().single();

        if (res.error && (res.error.code === "42703" || res.error.code === "PGRST204" || res.error.message?.includes("image_url"))) {
          delete prodPayload.image_url;
          res = await supabase.from("products").insert(prodPayload).select().single();
        }

        if (res.error) {
          console.error("Erro ao inserir produto no Supabase:", res.error);
          if (res.error.code === "23505") {
            return NextResponse.json(
              { error: "Já existe uma peça cadastrada com este código EAN-13. Por favor, gere ou informe outro código." },
              { status: 409 }
            );
          }
          return NextResponse.json(
            { error: `Erro no banco de dados: ${res.error.message}` },
            { status: 500 }
          );
        }

        newProd = res.data;

        if (newProd) {
          // Insere as variações de grade com código EAN-13
          const variantsToInsert = data.variants.map((v) => {
            const vEan = v.ean13 || v.sku_variant || eanCode;
            return {
              product_id: newProd.id,
              size: v.size,
              color: v.color || "Padrão",
              sku_variant: vEan.toUpperCase(),
              barcode: v.barcode || vEan,
              active: v.active,
            };
          });

          const { data: createdVariants, error: varErr } = await supabase
            .from("product_variants")
            .insert(variantsToInsert)
            .select();

          if (varErr) {
            console.error("Erro ao inserir variações no Supabase:", varErr);
            if (varErr.code === "23505") {
              return NextResponse.json(
                { error: "Uma das variações da grade possui código EAN-13 duplicado. Regenere os códigos da grade." },
                { status: 409 }
              );
            }
            return NextResponse.json(
              { error: `Erro ao salvar variações da grade: ${varErr.message}` },
              { status: 500 }
            );
          }

          // Se houver quantidade inicial informada, registra movimentação no estoque
          if (createdVariants && createdVariants.length > 0) {
            const initialMovements: Record<string, unknown>[] = [];
            createdVariants.forEach((cv: any, idx: number) => {
              const matchedInput =
                data.variants.find(
                  (dv) =>
                    (dv.ean13 && (dv.ean13 === cv.barcode || dv.ean13 === cv.sku_variant)) ||
                    dv.size === cv.size
                ) ||
                data.variants[idx];

              const stockQty = Number(
                matchedInput?.stock_quantity ?? (data as any).initial_stock ?? 0
              );

              if (stockQty > 0) {
                initialMovements.push({
                  variant_id: cv.id,
                  type: "entry",
                  quantity: stockQty,
                  previous_stock: 0,
                  new_stock: stockQty,
                  reason: "Carga inicial no cadastro de produto",
                });
              }
            });

            if (initialMovements.length > 0) {
              const { error: smErr } = await supabase
                .from("stock_movements")
                .insert(initialMovements);
              if (smErr) {
                console.error("Erro ao registrar carga inicial de estoque no Supabase:", smErr);
              }
            }

            // Mantém store de estoque local atualizado
            try {
              initialMovements.forEach((im: any) => {
                inventoryStore.recordMovement({
                  variant_id: im.variant_id as string,
                  type: "entry",
                  quantity: Number(im.quantity),
                  reason: "Carga inicial no cadastro de produto",
                });
              });
            } catch {
              // Ignore
            }
          }

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
      } catch (err: unknown) {
        console.error("Exceção ao inserir produto no Supabase:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar produto.";
        return NextResponse.json({ error: msg }, { status: 500 });
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
          id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          product_id: "",
          size: v.size,
          color: v.color || "Padrão",
          sku_variant: vEan.toUpperCase(),
          ean13: vEan,
          barcode: v.barcode || vEan,
          active: v.active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }),
    });

    // Registra estoque inicial no store local
    created.variants?.forEach((v, idx) => {
      const stockQty = Number(
        data.variants[idx]?.stock_quantity ?? (data as any).initial_stock ?? 0
      );
      if (stockQty > 0) {
        inventoryStore.recordMovement({
          variant_id: v.id,
          type: "entry",
          quantity: stockQty,
          reason: "Carga inicial no cadastro de produto",
        });
      }
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao cadastrar produto." },
      { status: 500 }
    );
  }
}
