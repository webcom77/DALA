export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku_variant: string;
  barcode?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id?: string | null;
  cost_price: number;
  sale_price: number;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  variants?: ProductVariant[];
  variants_count?: number;
}

/**
 * Tamanhos pré-definidos padrão para moda e vestuário
 */
export const COMMON_CLOTHING_SIZES = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XGG",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "Único",
] as const;

/**
 * Cores sugeridas padrão para vestuário
 */
export const COMMON_CLOTHING_COLORS = [
  "Preto",
  "Branco",
  "Off-White",
  "Cinza",
  "Bege",
  "Azul Marinho",
  "Azul Claro",
  "Vermelho",
  "Bordô / Vinho",
  "Rosa",
  "Verde Militar",
  "Verde Oliva",
  "Terracota",
  "Marrom",
  "Estampado",
] as const;
