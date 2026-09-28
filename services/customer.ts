import type { Customer } from "@/types";
import type { CustomerFormData } from "@/schemas/customer";

export const customerService = {
  async getCustomers(search?: string): Promise<Customer[]> {
    try {
      const url = `/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.customers || [];
    } catch {
      return [];
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const res = await fetch(`/api/customers/${id}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.customer || null;
    } catch {
      return null;
    }
  },

  async createCustomer(data: CustomerFormData): Promise<{ customer: Customer | null; error: string | null }> {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { customer: null, error: d.error || "Erro ao cadastrar cliente." };
      return { customer: d.customer, error: null };
    } catch {
      return { customer: null, error: "Erro de conexão." };
    }
  },

  async updateCustomer(id: string, data: CustomerFormData): Promise<{ customer: Customer | null; error: string | null }> {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { customer: null, error: d.error || "Erro ao atualizar cliente." };
      return { customer: d.customer, error: null };
    } catch {
      return { customer: null, error: "Erro de conexão." };
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },
};
