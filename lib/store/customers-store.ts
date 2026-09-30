import type { Customer, FinancialTransaction, Sale } from "@/types";
import { financeStore } from "./finance-store";

function enrichCustomerWithDebt(customer: Customer): Customer {
  const transactions = financeStore.getTransactions({ type: "receivable" });
  const today = new Date().toISOString().split("T")[0];
  const customerTx = transactions.filter(
    (t) =>
      t.customer_id === customer.id ||
      (t.customer_name && t.customer_name.toLowerCase() === customer.name.toLowerCase())
  );

  let totalDebt = 0;
  let overdueDebt = 0;
  let overdueCount = 0;

  customerTx.forEach((t) => {
    if (t.status === "pending" || t.status === "overdue") {
      totalDebt += t.amount;
      if (t.due_date < today || t.status === "overdue") {
        overdueDebt += t.amount;
        overdueCount++;
      }
    }
  });

  return {
    ...customer,
    total_debt: Number(totalDebt.toFixed(2)),
    overdue_debt: Number(overdueDebt.toFixed(2)),
    overdue_count: overdueCount,
  };
}

export const INITIAL_CUSTOMERS: Customer[] = [];

declare global {
  // eslint-disable-next-line no-var
  var __DALA_CUSTOMERS__: Customer[] | undefined;
}

if (!global.__DALA_CUSTOMERS__) {
  global.__DALA_CUSTOMERS__ = [];
}

export const customersStore = {
  enrichCustomer(customer: Customer): Customer {
    return enrichCustomerWithDebt(customer);
  },

  syncCustomer(customer: Customer): void {
    if (!global.__DALA_CUSTOMERS__) global.__DALA_CUSTOMERS__ = [];
    const idx = global.__DALA_CUSTOMERS__.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      global.__DALA_CUSTOMERS__[idx] = customer;
    } else {
      global.__DALA_CUSTOMERS__.unshift(customer);
    }
  },
  getCustomers(search?: string, filter?: "all" | "with_debt" | "overdue" | "no_debt"): Customer[] {
    let list = (global.__DALA_CUSTOMERS__ || INITIAL_CUSTOMERS).map(enrichCustomerWithDebt);

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.cpf_cnpj && c.cpf_cnpj.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    if (filter === "with_debt") {
      list = list.filter((c) => (c.total_debt || 0) > 0);
    } else if (filter === "overdue") {
      list = list.filter((c) => (c.overdue_debt || 0) > 0);
    } else if (filter === "no_debt") {
      list = list.filter((c) => (c.total_debt || 0) === 0);
    }

    return list;
  },

  getCustomerById(id: string): Customer | null {
    const list = global.__DALA_CUSTOMERS__ || INITIAL_CUSTOMERS;
    const found = list.find((c) => c.id === id);
    if (!found) return null;
    return enrichCustomerWithDebt(found);
  },

  createCustomer(data: Omit<Customer, "id" | "created_at" | "updated_at" | "total_spent" | "orders_count">): Customer {
    const newId = `cust-${Date.now()}`;
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...data,
      id: newId,
      total_spent: 0,
      orders_count: 0,
      created_at: now,
      updated_at: now,
    };
    if (!global.__DALA_CUSTOMERS__) global.__DALA_CUSTOMERS__ = [];
    global.__DALA_CUSTOMERS__.unshift(newCustomer);
    return enrichCustomerWithDebt(newCustomer);
  },

  updateCustomer(id: string, data: Partial<Customer>): Customer | null {
    if (!global.__DALA_CUSTOMERS__) return null;
    const idx = global.__DALA_CUSTOMERS__.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated: Customer = {
      ...global.__DALA_CUSTOMERS__[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    global.__DALA_CUSTOMERS__[idx] = updated;
    return enrichCustomerWithDebt(updated);
  },

  deleteCustomer(id: string): boolean {
    if (!global.__DALA_CUSTOMERS__) return false;
    const initialLen = global.__DALA_CUSTOMERS__.length;
    global.__DALA_CUSTOMERS__ = global.__DALA_CUSTOMERS__.filter((c) => c.id !== id);
    return global.__DALA_CUSTOMERS__.length < initialLen;
  },

  registerPurchase(customerId: string, amount: number) {
    const customer = this.getCustomerById(customerId);
    if (customer) {
      this.updateCustomer(customerId, {
        total_spent: Number((customer.total_spent + amount).toFixed(2)),
        orders_count: customer.orders_count + 1,
        last_purchase_at: new Date().toISOString(),
      });
    }
  },

  getCustomerDebtDetails(customerId: string): {
    customer: Customer | null;
    transactions: FinancialTransaction[];
    sales: Sale[];
    totalDebt: number;
    overdueDebt: number;
    paidDebt: number;
    nextDueDate: string | null;
  } {
    const customer = this.getCustomerById(customerId);
    if (!customer) {
      return {
        customer: null,
        transactions: [],
        sales: [],
        totalDebt: 0,
        overdueDebt: 0,
        paidDebt: 0,
        nextDueDate: null,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const transactions = financeStore.getCustomerReceivables(customerId);
    const allSales = (global.__DALA_SALES__ || []) as Sale[];
    const customerSales = allSales.filter(
      (s) => s.customer_id === customerId || (s.customer_name && s.customer_name.toLowerCase() === customer.name.toLowerCase())
    );

    let totalDebt = 0;
    let overdueDebt = 0;
    let paidDebt = 0;
    let nextDueDate: string | null = null;

    transactions.forEach((t) => {
      if (t.status === "paid") {
        paidDebt += t.amount;
      } else if (t.status === "pending" || t.status === "overdue") {
        totalDebt += t.amount;
        if (t.due_date < today || t.status === "overdue") {
          overdueDebt += t.amount;
        }
        if (!nextDueDate || t.due_date < nextDueDate) {
          nextDueDate = t.due_date;
        }
      }
    });

    return {
      customer: {
        ...customer,
        total_debt: Number(totalDebt.toFixed(2)),
        overdue_debt: Number(overdueDebt.toFixed(2)),
        overdue_count: transactions.filter((t) => t.status === "overdue" || (t.status === "pending" && t.due_date < today)).length,
      },
      transactions,
      sales: customerSales,
      totalDebt: Number(totalDebt.toFixed(2)),
      overdueDebt: Number(overdueDebt.toFixed(2)),
      paidDebt: Number(paidDebt.toFixed(2)),
      nextDueDate,
    };
  },

  receivePromissoryPayment(data: {
    customerId: string;
    transactionId: string;
    amount: number;
    paymentMethod: "money" | "pix" | "credit_card" | "debit_card";
    cashierName?: string;
  }): {
    success: boolean;
    receipt?: {
      receiptNumber: string;
      customerName: string;
      amountPaid: number;
      paymentMethod: string;
      paidAt: string;
      installmentDescription: string;
      remainingDebt: number;
    };
    error?: string;
  } {
    const tx = financeStore.getTransactionById(data.transactionId);
    if (!tx) {
      return { success: false, error: "Parcela não encontrada." };
    }

    const customer = this.getCustomerById(data.customerId);
    if (!customer) {
      return { success: false, error: "Cliente não encontrado." };
    }

    const now = new Date().toISOString();
    const receiptNumber = `REC-00${Date.now().toString().slice(-4)}`;

    if (data.amount >= tx.amount) {
      financeStore.markAsPaid(data.transactionId, data.paymentMethod);
    } else {
      tx.amount = Number((tx.amount - data.amount).toFixed(2));
      financeStore.createTransaction({
        type: "receivable",
        category: "Notinha Promissória",
        description: `Amortização ${tx.description} - ${receiptNumber}`,
        amount: data.amount,
        due_date: now.split("T")[0],
        paid_at: now,
        status: "paid",
        payment_method: data.paymentMethod,
        customer_id: customer.id,
        customer_name: customer.name,
        reference_id: tx.reference_id,
      });
    }

    // Se o caixa estiver aberto, registra a entrada
    const session = global.__DALA_CASH_SESSION__;
    if (session && session.status === "open") {
      session.total_sales = Number((session.total_sales + data.amount).toFixed(2));
      if (data.paymentMethod === "money") {
        session.total_cash = Number((session.total_cash + data.amount).toFixed(2));
      } else if (data.paymentMethod === "pix") {
        session.total_pix = Number((session.total_pix + data.amount).toFixed(2));
      } else {
        session.total_card = Number((session.total_card + data.amount).toFixed(2));
      }
    }

    const debtDetails = this.getCustomerDebtDetails(data.customerId);

    return {
      success: true,
      receipt: {
        receiptNumber,
        customerName: customer.name,
        amountPaid: data.amount,
        paymentMethod: data.paymentMethod,
        paidAt: now,
        installmentDescription: tx.description,
        remainingDebt: debtDetails.totalDebt,
      },
    };
  },
};

