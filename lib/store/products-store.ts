import type { Category, Product, ProductVariant } from "@/types";

// Categorias padrão de vestuário
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Vestidos",
    slug: "vestidos",
    description: "Vestidos curtos, mídis, longos e de festa",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-2",
    name: "Camisas e Blusas",
    slug: "camisas-e-blusas",
    description: "Camisaria, t-shirts, blusas e croppeds",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-3",
    name: "Calças e Jeans",
    slug: "calcas-e-jeans",
    description: "Calças alfaiataria, jeans, pantalonas e leggings",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-4",
    name: "Saias e Shorts",
    slug: "saias-e-shorts",
    description: "Saias mídi, curtas, shorts e bermudas",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-5",
    name: "Casacos e Jaquetas",
    slug: "casacos-e-jaquetas",
    description: "Blazers, jaquetas, sobretudos e cardigãs",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cat-6",
    name: "Acessórios",
    slug: "acessorios",
    description: "Cintos, bolsas, lenços e bijuterias",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Produtos padrão limpos para operação real (sem dados fictícios de teste)
export const INITIAL_PRODUCTS: Product[] = [];

// Singleton em memória para persistência rápida durante a sessão
declare global {
  // eslint-disable-next-line no-var
  var __DALA_PRODUCTS__: Product[] | undefined;
  // eslint-disable-next-line no-var
  var __DALA_CATEGORIES__: Category[] | undefined;
}

if (!global.__DALA_PRODUCTS__) {
  global.__DALA_PRODUCTS__ = [];
}

if (!global.__DALA_CATEGORIES__) {
  global.__DALA_CATEGORIES__ = [...INITIAL_CATEGORIES];
}

export const productsStore = {
  getCategories(): Category[] {
    return global.__DALA_CATEGORIES__ || INITIAL_CATEGORIES;
  },

  getProducts(filters?: { search?: string; categoryId?: string; active?: boolean }): Product[] {
    let list = global.__DALA_PRODUCTS__ || INITIAL_PRODUCTS;

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.ean13 && p.ean13.toLowerCase().includes(q)) ||
          p.variants?.some(
            (v) =>
              v.sku_variant.toLowerCase().includes(q) ||
              (v.ean13 && v.ean13.toLowerCase().includes(q)) ||
              (v.barcode && v.barcode.toLowerCase().includes(q))
          )
      );
    }

    if (filters?.categoryId && filters.categoryId !== "all") {
      list = list.filter((p) => p.category_id === filters.categoryId);
    }

    if (filters?.active !== undefined) {
      list = list.filter((p) => p.active === filters.active);
    }

    return list.map((p) => ({
      ...p,
      category: (global.__DALA_CATEGORIES__ || INITIAL_CATEGORIES).find(
        (c) => c.id === p.category_id
      ) || null,
      variants_count: p.variants?.length || 0,
    }));
  },

  getProductById(id: string): Product | null {
    const list = global.__DALA_PRODUCTS__ || INITIAL_PRODUCTS;
    const prod = list.find((p) => p.id === id);
    if (!prod) return null;

    return {
      ...prod,
      category: (global.__DALA_CATEGORIES__ || INITIAL_CATEGORIES).find(
        (c) => c.id === prod.category_id
      ) || null,
      variants_count: prod.variants?.length || 0,
    };
  },

  createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">): Product {
    const newId = `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const variants: ProductVariant[] = (data.variants || []).map((v, idx) => ({
      id: v.id || `var-${Date.now()}-${idx}`,
      product_id: newId,
      size: v.size,
      color: v.color,
      sku_variant: v.sku_variant || v.ean13 || `EAN-${Date.now()}-${idx}`,
      ean13: v.ean13 || v.barcode || v.sku_variant || null,
      barcode: v.barcode || v.ean13 || null,
      active: v.active ?? true,
      created_at: now,
      updated_at: now,
    }));

    const newProduct: Product = {
      ...data,
      id: newId,
      sku: data.sku || data.ean13 || `EAN-${Date.now()}`,
      ean13: data.ean13 || data.sku || null,
      image_url: data.image_url || null,
      created_at: now,
      updated_at: now,
      variants,
      variants_count: variants.length,
      category: (global.__DALA_CATEGORIES__ || INITIAL_CATEGORIES).find(
        (c) => c.id === data.category_id
      ) || null,
    };

    if (!global.__DALA_PRODUCTS__) {
      global.__DALA_PRODUCTS__ = [];
    }

    global.__DALA_PRODUCTS__.unshift(newProduct);
    return newProduct;
  },

  updateProduct(id: string, data: Partial<Product>): Product | null {
    if (!global.__DALA_PRODUCTS__) return null;

    const idx = global.__DALA_PRODUCTS__.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = global.__DALA_PRODUCTS__[idx];
    const now = new Date().toISOString();

    const updatedVariants: ProductVariant[] = (data.variants || existing.variants || []).map(
      (v, vIdx) => ({
        id: v.id || `var-${Date.now()}-${vIdx}`,
        product_id: id,
        size: v.size,
        color: v.color,
        sku_variant: v.sku_variant || v.ean13 || `EAN-${Date.now()}-${vIdx}`,
        ean13: v.ean13 || v.barcode || v.sku_variant || null,
        barcode: v.barcode || v.ean13 || null,
        active: v.active ?? true,
        created_at: v.created_at || now,
        updated_at: now,
      })
    );

    const updated: Product = {
      ...existing,
      ...data,
      id,
      sku: data.sku || data.ean13 || existing.sku,
      ean13: data.ean13 || data.sku || existing.ean13 || existing.sku,
      image_url: data.image_url !== undefined ? data.image_url : existing.image_url,
      updated_at: now,
      variants: updatedVariants,
      variants_count: updatedVariants.length,
      category: (global.__DALA_CATEGORIES__ || INITIAL_CATEGORIES).find(
        (c) => c.id === (data.category_id ?? existing.category_id)
      ) || null,
    };

    global.__DALA_PRODUCTS__[idx] = updated;
    return updated;
  },

  deleteProduct(id: string): boolean {
    if (!global.__DALA_PRODUCTS__) return false;
    const initialLen = global.__DALA_PRODUCTS__.length;
    global.__DALA_PRODUCTS__ = global.__DALA_PRODUCTS__.filter((p) => p.id !== id);
    return global.__DALA_PRODUCTS__.length < initialLen;
  },
};
