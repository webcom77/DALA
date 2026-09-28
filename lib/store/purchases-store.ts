import type { PurchaseOrder } from "@/types";
import { inventoryStore } from "./inventory-store";
import { financeStore } from "./finance-store";

export const INITIAL_PURCHASES: PurchaseOrder[] = [
  {
    id: "purch-1",
    order_number: "PED-00101",
    supplier_id: "supp-1",
    supplier_name: "Confecções Estilo & Arte",
    status: "received",
    payment_status: "paid",
    total_amount: 1598.00,
    expected_delivery: "2026-09-20",
    received_at: "2026-09-20T14:30:00Z",
    notes: "Lote inaugural de vestidos mídis da coleção primavera.",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    items: [
      {
        id: "item-1-1",
        product_id: "prod-1",
        variant_id: "var-1-1",
        product_name: "Vestido Midi Floral Evasê",
        sku_variant: "VEST-001-P-PRETO",
        size: "P",
        color: "Preto",
        quantity: 10,
        unit_cost: 79.90,
        total_cost: 799.00,
      },
      {
        id: "item-1-2",
        product_id: "prod-1",
        variant_id: "var-1-2",
        product_name: "Vestido Midi Floral Evasê",
        sku_variant: "VEST-001-M-PRETO",
        size: "M",
        color: "Preto",
        quantity: 10,
        unit_cost: 79.90,
        total_cost: 799.00,
      },
    ],
  },
  {
    id: "purch-2",
    order_number: "PED-00102",
    supplier_id: "supp-3",
    supplier_name: "Linhos & Tramas Naturais",
    status: "pending",
    payment_status: "pending",
    total_amount: 975.00,
    expected_delivery: "2026-10-05",
    notes: "Reposição de camisas brancas e azuis em linho.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    items: [
      {
        id: "item-2-1",
        product_id: "prod-2",
        variant_id: "var-2-1",
        product_name: "Camisa Linho Manga Longa",
        sku_variant: "CAM-002-P-BRANCO",
        size: "P",
        color: "Branco",
        quantity: 15,
        unit_cost: 65.00,
        total_cost: 975.00,
      },
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_PURCHASES__: PurchaseOrder[] | undefined;
}

if (!global.__DALA_PURCHASES__) {
  global.__DALA_PURCHASES__ = [...INITIAL_PURCHASES];
}

export const purchasesStore = {
  getPurchases(): PurchaseOrder[] {
    return global.__DALA_PURCHASES__ || INITIAL_PURCHASES;
  },

  getPurchaseById(id: string): PurchaseOrder | null {
    const list = global.__DALA_PURCHASES__ || INITIAL_PURCHASES;
    return list.find((p) => p.id === id) || null;
  },

  createPurchase(data: Omit<PurchaseOrder, "id" | "order_number" | "created_at" | "updated_at">): PurchaseOrder {
    const newId = `purch-${Date.now()}`;
    const orderNumber = `PED-00${(global.__DALA_PURCHASES__?.length || 0) + 103}`;
    const now = new Date().toISOString();

    const newOrder: PurchaseOrder = {
      ...data,
      id: newId,
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
    };

    if (!global.__DALA_PURCHASES__) global.__DALA_PURCHASES__ = [];
    global.__DALA_PURCHASES__.unshift(newOrder);

    // Se já estiver como recebido, alimenta estoque e financeiro
    if (newOrder.status === "received") {
      this.processReceipt(newOrder);
    }

    return newOrder;
  },

  markAsReceived(id: string): PurchaseOrder | null {
    if (!global.__DALA_PURCHASES__) return null;
    const idx = global.__DALA_PURCHASES__.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const order = global.__DALA_PURCHASES__[idx];
    if (order.status === "received") return order;

    const updated: PurchaseOrder = {
      ...order,
      status: "received",
      received_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    global.__DALA_PURCHASES__[idx] = updated;
    this.processReceipt(updated);

    return updated;
  },

  processReceipt(order: PurchaseOrder) {
    // 1. Atualiza estoque de cada item recebido
    order.items.forEach((item) => {
      inventoryStore.recordMovement({
        variant_id: item.variant_id,
        type: "purchase",
        quantity: item.quantity,
        reason: `Recebimento Pedido de Compra ${order.order_number}`,
        reference_id: order.id,
      });
    });

    // 2. Lança conta a pagar no módulo financeiro se ainda não existir
    financeStore.createTransaction({
      type: "payable",
      category: "Fornecedores",
      description: `Pedido de Compra ${order.order_number} - ${order.supplier_name}`,
      amount: order.total_amount,
      due_date: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
      status: order.payment_status === "paid" ? "paid" : "pending",
      supplier_id: order.supplier_id,
      supplier_name: order.supplier_name,
      reference_id: order.id,
    });
  },
};
