import type { PurchaseOrder } from "@/types";
import { inventoryStore } from "./inventory-store";
import { financeStore } from "./finance-store";

export const INITIAL_PURCHASES: PurchaseOrder[] = [];

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
