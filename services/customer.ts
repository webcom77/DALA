import type { Customer, FinancialTransaction, Sale } from "@/types";
import type { CustomerFormData } from "@/schemas/customer";

export interface CustomerDebtDetails {
  customer: Customer | null;
  transactions: FinancialTransaction[];
  sales: Sale[];
  totalDebt: number;
  overdueDebt: number;
  paidDebt: number;
  nextDueDate: string | null;
}

export interface PaymentReceipt {
  receiptNumber: string;
  customerName: string;
  amountPaid: number;
  paymentMethod: string;
  paidAt: string;
  installmentDescription: string;
  remainingDebt: number;
}

export const customerService = {
  async getCustomers(
    search?: string,
    filter?: "all" | "with_debt" | "overdue" | "no_debt"
  ): Promise<Customer[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter && filter !== "all") params.set("filter", filter);
      const url = `/api/customers${params.toString() ? `?${params.toString()}` : ""}`;
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

  async getCustomerDebtDetails(id: string): Promise<CustomerDebtDetails | null> {
    try {
      const res = await fetch(`/api/customers/${id}/debt`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async receivePayment(data: {
    customerId: string;
    transactionId: string;
    amount: number;
    paymentMethod: string;
  }): Promise<{ success: boolean; receipt?: PaymentReceipt; error?: string }> {
    try {
      const res = await fetch(`/api/customers/${data.customerId}/debt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) {
        return { success: false, error: d.error || "Erro ao processar baixa." };
      }
      return d;
    } catch {
      return { success: false, error: "Erro de conexão ao processar baixa." };
    }
  },

  async createCustomer(
    data: CustomerFormData
  ): Promise<{ customer: Customer | null; error: string | null }> {
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

  async updateCustomer(
    id: string,
    data: CustomerFormData
  ): Promise<{ customer: Customer | null; error: string | null }> {
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
