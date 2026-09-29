import type { CashSession, Sale, SaleItem } from "@/types";
import { inventoryStore } from "./inventory-store";
import { customersStore } from "./customers-store";
import { financeStore } from "./finance-store";

export const INITIAL_SALES: Sale[] = [
  {
    id: "sale-1",
    sale_number: "VENDA-00101",
    customer_id: "cust-1",
    customer_name: "Mariana Albuquerque",
    subtotal: 189.90,
    discount: 0,
    total_amount: 189.90,
    payment_method: "pix",
    items: [
      {
        variant_id: "var-1-1",
        product_id: "prod-1",
        product_name: "Vestido Midi Floral Evasê",
        sku_variant: "VEST-001-P-PRETO",
        size: "P",
        color: "Preto",
        quantity: 1,
        unit_price: 189.90,
        discount: 0,
        total_price: 189.90,
      },
    ],
    status: "completed",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sale-2",
    sale_number: "VENDA-00102",
    customer_id: "cust-2",
    customer_name: "Beatriz Nogueira",
    subtotal: 378.90,
    discount: 20.00,
    total_amount: 358.90,
    payment_method: "credit_card",
    installments: 3,
    items: [
      {
        variant_id: "var-2-1",
        product_id: "prod-2",
        product_name: "Camisa Linho Manga Longa",
        sku_variant: "CAM-002-P-BRANCO",
        size: "P",
        color: "Branco",
        quantity: 1,
        unit_price: 159.00,
        discount: 0,
        total_price: 159.00,
      },
      {
        variant_id: "var-3-2",
        product_id: "prod-3",
        product_name: "Calça Jeans Wide Leg Cintura Alta",
        sku_variant: "CALC-003-38-AZUL",
        size: "38",
        color: "Azul Marinho",
        quantity: 1,
        unit_price: 219.90,
        discount: 20.00,
        total_price: 199.90,
      },
    ],
    status: "completed",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_CASH_SESSION: CashSession = {
  id: "cash-1",
  opened_by: "Administrador DALA",
  opened_at: new Date().toISOString(),
  initial_balance: 200.00, // R$ 200 de fundo de troco
  total_sales: 548.80,
  total_cash: 0,
  total_pix: 189.90,
  total_card: 358.90,
  status: "open",
  notes: "Turno da manhã aberto regularmente.",
};

declare global {
  // eslint-disable-next-line no-var
  var __DALA_SALES__: Sale[] | undefined;
  // eslint-disable-next-line no-var
  var __DALA_CASH_SESSION__: CashSession | null | undefined;
}

if (!global.__DALA_SALES__) {
  global.__DALA_SALES__ = [...INITIAL_SALES];
}

if (global.__DALA_CASH_SESSION__ === undefined) {
  global.__DALA_CASH_SESSION__ = { ...INITIAL_CASH_SESSION };
}

export const posStore = {
  getActiveCashSession(): CashSession | null {
    if (global.__DALA_CASH_SESSION__ === undefined) {
      global.__DALA_CASH_SESSION__ = { ...INITIAL_CASH_SESSION };
    }
    return global.__DALA_CASH_SESSION__;
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
