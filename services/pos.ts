import type { CashSession, Sale } from "@/types";
import type { CheckoutSaleFormData, OpenCashSessionFormData, CloseCashSessionFormData } from "@/schemas/pos";

export const posService = {
  async getActiveSession(): Promise<CashSession | null> {
    try {
      const res = await fetch("/api/pos/session", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.session || null;
    } catch {
      return null;
    }
  },

  async openSession(data: OpenCashSessionFormData, openedBy: string = "Operador"): Promise<{ session: CashSession | null; error: string | null }> {
    try {
      const res = await fetch("/api/pos/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, opened_by: openedBy }),
      });
      const d = await res.json();
      if (!res.ok) return { session: null, error: d.error || "Erro ao abrir caixa." };
      return { session: d.session, error: null };
    } catch {
      return { session: null, error: "Erro de conexão." };
    }
  },

  async closeSession(data: CloseCashSessionFormData, closedBy: string = "Operador"): Promise<{ session: CashSession | null; error: string | null }> {
    try {
      const res = await fetch("/api/pos/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, closed_by: closedBy }),
      });
      const d = await res.json();
      if (!res.ok) return { session: null, error: d.error || "Erro ao fechar caixa." };
      return { session: d.session, error: null };
    } catch {
      return { session: null, error: "Erro de conexão." };
    }
  },

  async getSessionHistory(): Promise<CashSession[]> {
    try {
      const res = await fetch("/api/pos/session?history=true", { cache: "no-store" });
      if (!res.ok) return [];
      const d = await res.json();
      return d.sessions || [];
    } catch {
      return [];
    }
  },

  async checkoutSale(data: CheckoutSaleFormData): Promise<{ sale: Sale | null; error: string | null }> {
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { sale: null, error: d.error || "Erro ao concluir venda." };
      return { sale: d.sale, error: null };
    } catch {
      return { sale: null, error: "Erro de conexão ao processar venda." };
    }
  },

  async getSales(): Promise<Sale[]> {
    try {
      const res = await fetch("/api/sales", { cache: "no-store" });
      if (!res.ok) return [];
      const d = await res.json();
      return d.sales || [];
    } catch {
      return [];
    }
  },
};
