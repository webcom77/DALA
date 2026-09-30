import type { StockLevel, StockMovement, StockMovementType } from "@/types";
import { productsStore } from "./products-store";

// Saldos de estoque inicial em memória
const generateInitialStock = (): Map<string, { current: number; min: number }> => {
  const map = new Map<string, { current: number; min: number }>();
  const prods = productsStore.getProducts();

  prods.forEach((prod) => {
    (prod.variants || []).forEach((v) => {
      map.set(v.id, { current: 0, min: 0 });
    });
  });

  return map;
};

// Histórico inicial de movimentações
export const INITIAL_MOVEMENTS: StockMovement[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_STOCK_MAP__: Map<string, { current: number; min: number }> | undefined;
  // eslint-disable-next-line no-var
  var __DALA_STOCK_MOVEMENTS__: StockMovement[] | undefined;
}

if (!global.__DALA_STOCK_MAP__) {
  global.__DALA_STOCK_MAP__ = generateInitialStock();
}

if (!global.__DALA_STOCK_MOVEMENTS__) {
  global.__DALA_STOCK_MOVEMENTS__ = [...INITIAL_MOVEMENTS];
}

export const inventoryStore = {
  getStockLevels(filters?: { search?: string; status?: string }): StockLevel[] {
    const prods = productsStore.getProducts();
    const stockMap = global.__DALA_STOCK_MAP__ || generateInitialStock();
    const result: StockLevel[] = [];

    prods.forEach((p) => {
      (p.variants || []).forEach((v) => {
        const item = stockMap.get(v.id) || { current: 0, min: 0 };
        let status: "normal" | "low" | "out_of_stock" = "normal";

        if (item.current <= 0) {
          status = "out_of_stock";
        }

        result.push({
          variant_id: v.id,
          product_id: p.id,
          product_name: p.name,
          sku: p.sku,
          sku_variant: v.sku_variant,
          size: v.size,
          color: v.color,
          current_stock: item.current,
          min_stock: item.min,
          cost_price: p.cost_price,
          sale_price: p.sale_price,
          status,
          category_name: p.category?.name || "Sem categoria",
        });
      });
    });

    let list = result;

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.product_name.toLowerCase().includes(q) ||
          i.sku_variant.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.size.toLowerCase().includes(q) ||
          i.color.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== "all") {
      list = list.filter((i) => i.status === filters.status);
    }

    return list;
  },

  getStockByVariantId(variantId: string): StockLevel | null {
    const all = this.getStockLevels();
    return all.find((i) => i.variant_id === variantId) || null;
  },

  recordMovement(data: {
    variant_id: string;
    type: StockMovementType;
    quantity: number;
    reason: string;
    reference_id?: string | null;
  }): { success: boolean; movement?: StockMovement; error?: string } {
    const stockMap = global.__DALA_STOCK_MAP__ || generateInitialStock();
    const item = stockMap.get(data.variant_id) || { current: 0, min: 2 };
    const prevStock = item.current;

    let newStock = prevStock;
    if (data.type === "entry" || data.type === "purchase") {
      newStock += data.quantity;
    } else if (data.type === "exit" || data.type === "sale") {
      if (prevStock < data.quantity && data.type === "exit") {
        // Alerta de estoque insuficiente
      }
      newStock = Math.max(0, prevStock - data.quantity);
    } else if (data.type === "adjustment") {
      newStock = data.quantity;
    }

    stockMap.set(data.variant_id, { ...item, current: newStock });
    global.__DALA_STOCK_MAP__ = stockMap;

    // Busca detalhes do produto para registrar na movimentação
    const prods = productsStore.getProducts();
    let prodName = "Peça";
    let skuVar = "SKU-VAR";
    let size = "-";
    let color = "-";

    for (const p of prods) {
      const v = p.variants?.find((vr) => vr.id === data.variant_id);
      if (v) {
        prodName = p.name;
        skuVar = v.sku_variant;
        size = v.size;
        color = v.color;
        break;
      }
    }

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      variant_id: data.variant_id,
      product_name: prodName,
      sku_variant: skuVar,
      size,
      color,
      type: data.type,
      quantity: data.quantity,
      previous_stock: prevStock,
      new_stock: newStock,
      reason: data.reason,
      reference_id: data.reference_id || null,
      created_at: new Date().toISOString(),
    };

    if (!global.__DALA_STOCK_MOVEMENTS__) global.__DALA_STOCK_MOVEMENTS__ = [];
    global.__DALA_STOCK_MOVEMENTS__.unshift(newMov);

    return { success: true, movement: newMov };
  },

  getMovements(variantId?: string): StockMovement[] {
    let list = global.__DALA_STOCK_MOVEMENTS__ || INITIAL_MOVEMENTS;
    if (variantId) {
      list = list.filter((m) => m.variant_id === variantId);
    }
    return list;
  },
};
