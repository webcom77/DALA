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

// Produtos padrão de vestuário com grade completa
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "VEST-001",
    name: "Vestido Midi Floral Evasê",
    category_id: "cat-1",
    cost_price: 79.9,
    sale_price: 189.9,
    description: "Vestido confeccionado em viscose leve com estampa floral exclusiva e decote transpassado.",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[0],
    variants: [
      {
        id: "var-1-1",
        product_id: "prod-1",
        size: "P",
        color: "Preto",
        sku_variant: "VEST-001-P-PRETO",
        barcode: "7891001001",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-1-2",
        product_id: "prod-1",
        size: "M",
        color: "Preto",
        sku_variant: "VEST-001-M-PRETO",
        barcode: "7891001002",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-1-3",
        product_id: "prod-1",
        size: "G",
        color: "Preto",
        sku_variant: "VEST-001-G-PRETO",
        barcode: "7891001003",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-1-4",
        product_id: "prod-1",
        size: "P",
        color: "Terracota",
        sku_variant: "VEST-001-P-TERRA",
        barcode: "7891001004",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-1-5",
        product_id: "prod-1",
        size: "M",
        color: "Terracota",
        sku_variant: "VEST-001-M-TERRA",
        barcode: "7891001005",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "prod-2",
    sku: "CAM-002",
    name: "Camisa Linho Manga Longa",
    category_id: "cat-2",
    cost_price: 65.0,
    sale_price: 159.0,
    description: "Camisa clássica em linho misto com modelagem comfort e botões perolados.",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[1],
    variants: [
      {
        id: "var-2-1",
        product_id: "prod-2",
        size: "P",
        color: "Branco",
        sku_variant: "CAM-002-P-BRANCO",
        barcode: "7892002001",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-2-2",
        product_id: "prod-2",
        size: "M",
        color: "Branco",
        sku_variant: "CAM-002-M-BRANCO",
        barcode: "7892002002",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-2-3",
        product_id: "prod-2",
        size: "G",
        color: "Branco",
        sku_variant: "CAM-002-G-BRANCO",
        barcode: "7892002003",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-2-4",
        product_id: "prod-2",
        size: "M",
        color: "Azul Claro",
        sku_variant: "CAM-002-M-AZUL",
        barcode: "7892002004",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "prod-3",
    sku: "CALC-003",
    name: "Calça Jeans Wide Leg Cintura Alta",
    category_id: "cat-3",
    cost_price: 85.0,
    sale_price: 219.9,
    description: "Jeans 100% algodão com lavagem azul clássica e corte moderno wide leg.",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[2],
    variants: [
      {
        id: "var-3-1",
        product_id: "prod-3",
        size: "36",
        color: "Azul Marinho",
        sku_variant: "CALC-003-36-AZUL",
        barcode: "7893003036",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-3-2",
        product_id: "prod-3",
        size: "38",
        color: "Azul Marinho",
        sku_variant: "CALC-003-38-AZUL",
        barcode: "7893003038",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-3-3",
        product_id: "prod-3",
        size: "40",
        color: "Azul Marinho",
        sku_variant: "CALC-003-40-AZUL",
        barcode: "7893003040",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var-3-4",
        product_id: "prod-3",
        size: "42",
        color: "Azul Marinho",
        sku_variant: "CALC-003-42-AZUL",
        barcode: "7893003042",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
];

// Singleton em memória para persistência rápida durante a sessão
declare global {
  // eslint-disable-next-line no-var
  var __DALA_PRODUCTS__: Product[] | undefined;
  // eslint-disable-next-line no-var
  var __DALA_CATEGORIES__: Category[] | undefined;
}

if (!global.__DALA_PRODUCTS__) {
  global.__DALA_PRODUCTS__ = [...INITIAL_PRODUCTS];
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
          p.variants?.some((v) => v.sku_variant.toLowerCase().includes(q))
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
      sku_variant: v.sku_variant,
      barcode: v.barcode || null,
      active: v.active ?? true,
      created_at: now,
      updated_at: now,
    }));

    const newProduct: Product = {
      ...data,
      id: newId,
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
        sku_variant: v.sku_variant,
        barcode: v.barcode || null,
        active: v.active ?? true,
        created_at: v.created_at || now,
        updated_at: now,
      })
    );

    const updated: Product = {
      ...existing,
      ...data,
      id,
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
