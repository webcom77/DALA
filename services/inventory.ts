import type { StockLevel, StockMovement } from "@/types";
import type { StockMovementFormData } from "@/schemas/inventory";

export const inventoryService = {
  async getStockLevels(filters?: { search?: string; status?: string }): Promise<StockLevel[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);

      const res = await fetch(`/api/inventory?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.stockLevels || [];
    } catch {
      return [];
    }
  },

  async getMovements(variantId?: string): Promise<StockMovement[]> {
    try {
      const url = `/api/inventory/movements${variantId ? `?variantId=${variantId}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.movements || [];
    } catch {
      return [];
    }
  },

  async recordMovement(data: StockMovementFormData): Promise<{ movement: StockMovement | null; error: string | null }> {
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { movement: null, error: d.error || "Erro ao movimentar estoque." };
      return { movement: d.movement, error: null };
    } catch {
      return { movement: null, error: "Erro de conexão ao movimentar estoque." };
    }
  },
};
