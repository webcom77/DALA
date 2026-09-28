import type { StockLevel, StockMovement, StockMovementType } from "@/types";
import { productsStore } from "./products-store";

// Saldos de estoque inicial em memória
const generateInitialStock = (): Map<string, { current: number; min: number }> => {
  const map = new Map<string, { current: number; min: number }>();
  const prods = productsStore.getProducts();

  prods.forEach((prod, pIdx) => {
    (prod.variants || []).forEach((v, vIdx) => {
      // Gera quantidades realistas de loja de roupas
      let qty = 6 + ((pIdx * 3 + vIdx * 2) % 12);
      if (v.size === "G" && v.color === "Preto") qty = 1; // Para simular estoque baixo
      map.set(v.id, { current: qty, min: 3 });
    });
  });

  return map;
};

// Histórico inicial de movimentações
export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    variant_id: "var-1-1",
    product_name: "Vestido Midi Floral Evasê",
    sku_variant: "VEST-001-P-PRETO",
    size: "P",
    color: "Preto",
    type: "entry",
    quantity: 10,
    previous_stock: 0,
    new_stock: 10,
    reason: "Entrada inicial de lote de coleção",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "mov-2",
    variant_id: "var-2-1",
    product_name: "Camisa Linho Manga Longa",
    sku_variant: "CAM-002-P-BRANCO",
    size: "P",
    color: "Branco",
    type: "entry",
    quantity: 12,
    previous_stock: 0,
    new_stock: 12,
    reason: "Recebimento de pedido de confecção",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "mov-3",
    variant_id: "var-1-1",
    product_name: "Vestido Midi Floral Evasê",
    sku_variant: "VEST-001-P-PRETO",
    size: "P",
    color: "Preto",
    type: "sale",
    quantity: 1,
    previous_stock: 10,
    new_stock: 9,
    reason: "Venda PDV cupom balcão",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

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
        const item = stockMap.get(v.id) || { current: 5, min: 2 };
        let status: "normal" | "low" | "out_of_stock" = "normal";

        if (item.current <= 0) {
          status = "out_of_stock";
        } else if (item.current <= item.min) {
          status = "low";
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
