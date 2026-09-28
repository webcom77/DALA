export type StockMovementType =
  | "entry"      // Entrada avulsa / bonificação
  | "exit"       // Saída avulsa / perda / avaria
  | "adjustment" // Ajuste de inventário
  | "sale"       // Saída por venda no PDV
  | "purchase";  // Entrada por pedido de compra

export interface StockLevel {
  variant_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  sku_variant: string;
  size: string;
  color: string;
  current_stock: number;
  min_stock: number;
  cost_price: number;
  sale_price: number;
  status: "normal" | "low" | "out_of_stock";
  category_name?: string;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  product_name: string;
  sku_variant: string;
  size: string;
  color: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference_id?: string | null; // ID da venda ou da compra
  created_at: string;
}
