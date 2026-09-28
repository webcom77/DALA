import type { PurchaseOrder } from "@/types";
import type { PurchaseOrderFormData } from "@/schemas/purchase";

export const purchaseService = {
  async getPurchases(): Promise<PurchaseOrder[]> {
    try {
      const res = await fetch("/api/purchases", { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.purchases || [];
    } catch {
      return [];
    }
  },

  async getPurchaseById(id: string): Promise<PurchaseOrder | null> {
    try {
      const res = await fetch(`/api/purchases/${id}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.purchase || null;
    } catch {
      return null;
    }
  },

  async createPurchase(data: PurchaseOrderFormData): Promise<{ purchase: PurchaseOrder | null; error: string | null }> {
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { purchase: null, error: d.error || "Erro ao criar pedido." };
      return { purchase: d.purchase, error: null };
    } catch {
      return { purchase: null, error: "Erro de conexão ao criar pedido." };
    }
  },

  async markAsReceived(id: string): Promise<{ purchase: PurchaseOrder | null; error: string | null }> {
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receive" }),
      });
      const d = await res.json();
      if (!res.ok) return { purchase: null, error: d.error || "Erro ao receber mercadorias." };
      return { purchase: d.purchase, error: null };
    } catch {
      return { purchase: null, error: "Erro de conexão." };
    }
  },
};
