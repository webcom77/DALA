import type { Supplier } from "@/types";
import type { SupplierFormData } from "@/schemas/supplier";

export const supplierService = {
  async getSuppliers(search?: string): Promise<Supplier[]> {
    try {
      const url = `/api/suppliers${search ? `?search=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.suppliers || [];
    } catch {
      return [];
    }
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.supplier || null;
    } catch {
      return null;
    }
  },

  async createSupplier(data: SupplierFormData): Promise<{ supplier: Supplier | null; error: string | null }> {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { supplier: null, error: d.error || "Erro ao cadastrar fornecedor." };
      return { supplier: d.supplier, error: null };
    } catch {
      return { supplier: null, error: "Erro de conexão." };
    }
  },

  async updateSupplier(id: string, data: SupplierFormData): Promise<{ supplier: Supplier | null; error: string | null }> {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { supplier: null, error: d.error || "Erro ao atualizar fornecedor." };
      return { supplier: d.supplier, error: null };
    } catch {
      return { supplier: null, error: "Erro de conexão." };
    }
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },
};
