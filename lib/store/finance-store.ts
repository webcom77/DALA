import type { FinancialSummary, FinancialTransaction } from "@/types";

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_FINANCE__: FinancialTransaction[] | undefined;
}

if (!global.__DALA_FINANCE__) {
  global.__DALA_FINANCE__ = [];
}

export const financeStore = {
  getTransactions(filters?: { type?: string; status?: string; search?: string }): FinancialTransaction[] {
    let list = global.__DALA_FINANCE__ || INITIAL_TRANSACTIONS;

    if (filters?.type && filters.type !== "all") {
      list = list.filter((t) => t.type === filters.type);
    }

    if (filters?.status && filters.status !== "all") {
      list = list.filter((t) => t.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
          (t.supplier_name && t.supplier_name.toLowerCase().includes(q))
      );
    }

    return list;
  },

  getTransactionById(id: string): FinancialTransaction | null {
    const list = global.__DALA_FINANCE__ || INITIAL_TRANSACTIONS;
    return list.find((t) => t.id === id) || null;
  },

  getCustomerReceivables(customerId: string): FinancialTransaction[] {
    const list = global.__DALA_FINANCE__ || INITIAL_TRANSACTIONS;
    const today = new Date().toISOString().split("T")[0];
    return list
      .filter((t) => t.type === "receivable" && t.customer_id === customerId)
      .map((t) => {
        if (t.status === "pending" && t.due_date < today) {
          return { ...t, status: "overdue" as const };
        }
        return t;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  },

  createTransaction(
    data: Omit<FinancialTransaction, "id" | "created_at">
  ): FinancialTransaction {
    const newId = `fin-${Date.now()}`;
    const newTx: FinancialTransaction = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };

    if (!global.__DALA_FINANCE__) global.__DALA_FINANCE__ = [];
    global.__DALA_FINANCE__.unshift(newTx);
    return newTx;
  },

  markAsPaid(id: string, paymentMethod: string = "pix"): FinancialTransaction | null {
    if (!global.__DALA_FINANCE__) return null;
    const idx = global.__DALA_FINANCE__.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const tx = global.__DALA_FINANCE__[idx];
    const updated: FinancialTransaction = {
      ...tx,
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
    };

    global.__DALA_FINANCE__[idx] = updated;
    return updated;
  },

  deleteTransaction(id: string): boolean {
    if (!global.__DALA_FINANCE__) return false;
    const initialLen = global.__DALA_FINANCE__.length;
    global.__DALA_FINANCE__ = global.__DALA_FINANCE__.filter((t) => t.id !== id);
    return global.__DALA_FINANCE__.length < initialLen;
  },

  getSummary(): FinancialSummary {
    const list = global.__DALA_FINANCE__ || INITIAL_TRANSACTIONS;
    const today = new Date().toISOString().split("T")[0];

    let totalReceivablePending = 0;
    let totalPayablePending = 0;
    let totalReceivedMonth = 0;
    let totalPaidMonth = 0;
    let overdueCount = 0;

    list.forEach((t) => {
      if (t.type === "receivable") {
        if (t.status === "paid") {
          totalReceivedMonth += t.amount;
        } else if (t.status === "pending" || t.status === "overdue") {
          totalReceivablePending += t.amount;
        }
      } else if (t.type === "payable") {
        if (t.status === "paid") {
          totalPaidMonth += t.amount;
        } else if (t.status === "pending" || t.status === "overdue") {
          totalPayablePending += t.amount;
        }
      }

      if (t.status === "pending" && t.due_date < today) {
        overdueCount++;
      }
    });

    const currentBalance = totalReceivedMonth - totalPaidMonth + 4500.00; // Saldo de capital de giro base

    return {
      current_balance: Number(currentBalance.toFixed(2)),
      total_receivable_pending: Number(totalReceivablePending.toFixed(2)),
      total_payable_pending: Number(totalPayablePending.toFixed(2)),
      total_received_month: Number(totalReceivedMonth.toFixed(2)),
      total_paid_month: Number(totalPaidMonth.toFixed(2)),
      overdue_count: overdueCount,
    };
  },
};
