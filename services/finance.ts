import type { FinancialSummary, FinancialTransaction } from "@/types";
import type { FinancialTransactionFormData } from "@/schemas/finance";

export const financeService = {
  async getTransactions(filters?: { type?: string; status?: string; search?: string }): Promise<FinancialTransaction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== "all") params.set("type", filters.type);
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);

      const res = await fetch(`/api/finance/transactions?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return [];
      const d = await res.json();
      return d.transactions || [];
    } catch {
      return [];
    }
  },

  async getSummary(): Promise<FinancialSummary | null> {
    try {
      const res = await fetch("/api/finance/summary", { cache: "no-store" });
      if (!res.ok) return null;
      const d = await res.json();
      return d.summary || null;
    } catch {
      return null;
    }
  },

  async createTransaction(data: FinancialTransactionFormData): Promise<{ transaction: FinancialTransaction | null; error: string | null }> {
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { transaction: null, error: d.error || "Erro ao criar lançamento." };
      return { transaction: d.transaction, error: null };
    } catch {
      return { transaction: null, error: "Erro de conexão." };
    }
  },

  async markAsPaid(id: string, paymentMethod: string = "pix"): Promise<{ transaction: FinancialTransaction | null; error: string | null }> {
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid", payment_method: paymentMethod }),
      });
      const d = await res.json();
      if (!res.ok) return { transaction: null, error: d.error || "Erro ao dar baixa." };
      return { transaction: d.transaction, error: null };
    } catch {
      return { transaction: null, error: "Erro de conexão." };
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },
};
