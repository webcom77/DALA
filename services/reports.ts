import { posStore } from "@/lib/store/pos-store";
import { inventoryStore } from "@/lib/store/inventory-store";
import { financeStore } from "@/lib/store/finance-store";
import { customersStore } from "@/lib/store/customers-store";

export interface SalesReport {
  totalSalesCount: number;
  grossRevenue: number;
  totalDiscount: number;
  netRevenue: number;
  averageTicket: number;
  totalPiecesSold: number;
  paymentMethods: {
    method: string;
    label: string;
    total: number;
    count: number;
    percent: number;
  }[];
  topSellingVariants: {
    product_name: string;
    sku_variant: string;
    size: string;
    color: string;
    quantity: number;
    total_amount: number;
  }[];
}

export interface InventoryReport {
  totalPieces: number;
  totalCostValue: number;
  totalSaleValue: number;
  potentialProfit: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
}

export interface IncomeStatementReport {
  grossRevenue: number;
  cogs: number; // Cost of Goods Sold (Custo das mercadorias vendidas)
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPercent: number;
}

export const reportsService = {
  getSalesReport(): SalesReport {
    const sales = posStore.getSales();
    const totalSalesCount = sales.length;

    let grossRevenue = 0;
    let totalDiscount = 0;
    let netRevenue = 0;
    let totalPiecesSold = 0;

    const methodMap = new Map<string, { total: number; count: number }>();
    const variantMap = new Map<
      string,
      { product_name: string; sku_variant: string; size: string; color: string; quantity: number; total_amount: number }
    >();

    sales.forEach((s) => {
      grossRevenue += s.subtotal;
      totalDiscount += s.discount;
      netRevenue += s.total_amount;

      // Formas de pagamento
      const mData = methodMap.get(s.payment_method) || { total: 0, count: 0 };
      methodMap.set(s.payment_method, {
        total: mData.total + s.total_amount,
        count: mData.count + 1,
      });

      // Itens vendidos
      (s.items || []).forEach((it) => {
        totalPiecesSold += it.quantity;
        const vData = variantMap.get(it.variant_id) || {
          product_name: it.product_name,
          sku_variant: it.sku_variant,
          size: it.size,
          color: it.color,
          quantity: 0,
          total_amount: 0,
        };
        variantMap.set(it.variant_id, {
          ...vData,
          quantity: vData.quantity + it.quantity,
          total_amount: vData.total_amount + it.total_price,
        });
      });
    });

    const averageTicket = totalSalesCount > 0 ? netRevenue / totalSalesCount : 0;

    const methodLabels: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      money: "Dinheiro",
    };

    const paymentMethods = Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      label: methodLabels[method] || method,
      total: Number(data.total.toFixed(2)),
      count: data.count,
      percent: netRevenue > 0 ? Number(((data.total / netRevenue) * 100).toFixed(1)) : 0,
    }));

    const topSellingVariants = Array.from(variantMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      totalSalesCount,
      grossRevenue: Number(grossRevenue.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      netRevenue: Number(netRevenue.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
      totalPiecesSold,
      paymentMethods,
      topSellingVariants,
    };
  },

  getInventoryReport(): InventoryReport {
    const stockLevels = inventoryStore.getStockLevels();
    let totalPieces = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;
    let lowStockItemsCount = 0;
    let outOfStockItemsCount = 0;

    stockLevels.forEach((item) => {
      totalPieces += item.current_stock;
      totalCostValue += item.current_stock * item.cost_price;
      totalSaleValue += item.current_stock * item.sale_price;

      if (item.status === "low") lowStockItemsCount++;
      if (item.status === "out_of_stock") outOfStockItemsCount++;
    });

    const potentialProfit = totalSaleValue - totalCostValue;

    return {
      totalPieces,
      totalCostValue: Number(totalCostValue.toFixed(2)),
      totalSaleValue: Number(totalSaleValue.toFixed(2)),
      potentialProfit: Number(potentialProfit.toFixed(2)),
      lowStockItemsCount,
      outOfStockItemsCount,
    };
  },

  getIncomeStatement(): IncomeStatementReport {
    const salesReport = this.getSalesReport();
    const grossRevenue = salesReport.netRevenue;

    // Estima custo das mercadorias vendidas com base nas peças vendidas
    // Margem média de varejo de moda: Custo ~ 45% do faturamento
    const cogs = Number((grossRevenue * 0.45).toFixed(2));
    const grossProfit = Number((grossRevenue - cogs).toFixed(2));
    const grossMarginPercent = grossRevenue > 0 ? Number(((grossProfit / grossRevenue) * 100).toFixed(1)) : 0;

    // Despesas operacionais pagas
    const txs = financeStore.getTransactions({ type: "payable", status: "paid" });
    const operatingExpenses = Number(
      txs
        .filter((t) => !t.category.toLowerCase().includes("fornecedor"))
        .reduce((acc, t) => acc + t.amount, 0)
        .toFixed(2)
    );

    const netProfit = Number((grossProfit - operatingExpenses).toFixed(2));
    const netMarginPercent = grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0;

    return {
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      operatingExpenses,
      netProfit,
      netMarginPercent,
    };
  },
};
