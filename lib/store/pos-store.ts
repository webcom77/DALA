import type { CashSession, Sale, SaleItem } from "@/types";
import { inventoryStore } from "./inventory-store";
import { customersStore } from "./customers-store";
import { financeStore } from "./finance-store";

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_CASH_SESSION: CashSession | null = null;

declare global {
  // eslint-disable-next-line no-var
  var __DALA_SALES__: Sale[] | undefined;
  // eslint-disable-next-line no-var
  var __DALA_CASH_SESSION__: CashSession | null | undefined;
}

global.__DALA_SALES__ = [];
global.__DALA_CASH_SESSION__ = null;

export const posStore = {
  getActiveCashSession(): CashSession | null {
    if (global.__DALA_CASH_SESSION__ === undefined) {
      global.__DALA_CASH_SESSION__ = INITIAL_CASH_SESSION;
    }
    return global.__DALA_CASH_SESSION__ ?? null;
  },

  openCashSession(openedBy: string, initialBalance: number, notes?: string): CashSession {
    const session: CashSession = {
      id: `cash-${Date.now()}`,
      opened_by: openedBy,
      opened_at: new Date().toISOString(),
      initial_balance: initialBalance,
      total_sales: 0,
      total_cash: 0,
      total_pix: 0,
      total_card: 0,
      status: "open",
      notes: notes || null,
    };
    global.__DALA_CASH_SESSION__ = session;
    return session;
  },

  closeCashSession(closedBy: string, finalBalance: number, notes?: string): CashSession | null {
    const current = global.__DALA_CASH_SESSION__;
    if (!current) return null;

    const closed: CashSession = {
      ...current,
      closed_by: closedBy,
      closed_at: new Date().toISOString(),
      final_balance: finalBalance,
      status: "closed",
      notes: notes || current.notes,
    };

    global.__DALA_CASH_SESSION__ = closed;
    return closed;
  },

  getSales(): Sale[] {
    return global.__DALA_SALES__ || INITIAL_SALES;
  },

  getSaleById(id: string): Sale | null {
    const list = global.__DALA_SALES__ || INITIAL_SALES;
    return list.find((s) => s.id === id) || null;
  },

  checkoutSale(data: {
    customer_id?: string | null;
    customer_name?: string | null;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total_amount: number;
    payment_method: "money" | "pix" | "credit_card" | "debit_card" | "promissory";
    amount_received?: number | null;
    change_amount?: number | null;
    installments?: number;
    down_payment?: number | null;
    down_payment_method?: "money" | "pix" | "credit_card" | "debit_card" | null;
    first_due_date?: string | null;
  }): Sale {
    const newId = `sale-${Date.now()}`;
    const saleNumber = `VENDA-00${(global.__DALA_SALES__?.length || 0) + 103}`;
    const now = new Date().toISOString();

    const sale: Sale = {
      ...data,
      id: newId,
      sale_number: saleNumber,
      status: "completed",
      created_at: now,
    };

    if (!global.__DALA_SALES__) global.__DALA_SALES__ = [];
    global.__DALA_SALES__.unshift(sale);

    // 1. Dá baixa imediata no estoque das variações de tamanho/cor vendidas
    data.items.forEach((item) => {
      inventoryStore.recordMovement({
        variant_id: item.variant_id,
        type: "sale",
        quantity: item.quantity,
        reason: `Venda no PDV ${saleNumber}`,
        reference_id: newId,
      });
    });

    // 2. Se houver cliente vinculado, atualiza histórico e total gasto
    if (data.customer_id) {
      customersStore.registerPurchase(data.customer_id, data.total_amount);
    }

    const session = global.__DALA_CASH_SESSION__;

    // 3. Tratamento de Notinha Promissória vs. Venda à Vista
    if (data.payment_method === "promissory") {
      const downPayment = data.down_payment || 0;
      const installmentsCount = Math.max(1, data.installments || 1);
      const promissoryAmount = Number((data.total_amount - downPayment).toFixed(2));

      // Se houver valor de entrada, alimenta o caixa no turno
      if (downPayment > 0 && session && session.status === "open") {
        session.total_sales = Number((session.total_sales + downPayment).toFixed(2));
        const dpMethod = data.down_payment_method || "money";
        if (dpMethod === "money") {
          session.total_cash = Number((session.total_cash + downPayment).toFixed(2));
        } else if (dpMethod === "pix") {
          session.total_pix = Number((session.total_pix + downPayment).toFixed(2));
        } else {
          session.total_card = Number((session.total_card + downPayment).toFixed(2));
        }

        financeStore.createTransaction({
          type: "receivable",
          category: "Entrada Notinha",
          description: `Entrada Notinha ${saleNumber} - ${data.customer_name || "Cliente"}`,
          amount: downPayment,
          due_date: now.split("T")[0],
          paid_at: now,
          status: "paid",
          payment_method: dpMethod,
          customer_id: data.customer_id || null,
          customer_name: data.customer_name || null,
          reference_id: newId,
        });
      }

      // Gera as parcelas da notinha promissória
      const baseInstallment = Number((promissoryAmount / installmentsCount).toFixed(2));
      let currentDueDate = data.first_due_date
        ? new Date(data.first_due_date + "T12:00:00")
        : new Date(Date.now() + 86400000 * 30);

      for (let i = 1; i <= installmentsCount; i++) {
        const instAmount =
          i === installmentsCount
            ? Number((promissoryAmount - baseInstallment * (installmentsCount - 1)).toFixed(2))
            : baseInstallment;

        const dueStr = currentDueDate.toISOString().split("T")[0];

        financeStore.createTransaction({
          type: "receivable",
          category: "Notinha Promissória",
          description: `Notinha ${saleNumber} - Parcela ${i}/${installmentsCount} - ${data.customer_name || "Cliente"}`,
          amount: instAmount,
          due_date: dueStr,
          status: "pending",
          customer_id: data.customer_id || null,
          customer_name: data.customer_name || null,
          reference_id: newId,
          notes: JSON.stringify({
            installment: i,
            total_installments: installmentsCount,
            sale_id: newId,
          }),
        });

        // Adiciona 30 dias para a próxima parcela
        currentDueDate = new Date(currentDueDate.getTime() + 86400000 * 30);
      }
    } else {
      // Venda comum à vista (dinheiro, pix, cartao)
      if (session && session.status === "open") {
        session.total_sales = Number((session.total_sales + data.total_amount).toFixed(2));
        if (data.payment_method === "money") {
          session.total_cash = Number((session.total_cash + data.total_amount).toFixed(2));
        } else if (data.payment_method === "pix") {
          session.total_pix = Number((session.total_pix + data.total_amount).toFixed(2));
        } else {
          session.total_card = Number((session.total_card + data.total_amount).toFixed(2));
        }
      }

      // Registra transação no Financeiro (Entrada de Venda)
      financeStore.createTransaction({
        type: "receivable",
        category: "Vendas",
        description: `Venda no PDV ${saleNumber} (${data.items.length} ${data.items.length === 1 ? "peça" : "peças"})`,
        amount: data.total_amount,
        due_date: now.split("T")[0],
        paid_at: now,
        status: "paid",
        payment_method: data.payment_method,
        customer_id: data.customer_id || null,
        customer_name: data.customer_name || null,
        reference_id: newId,
      });
    }

    return sale;
  },
};
