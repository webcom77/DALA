"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  FileText,
  PieChart,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/formatters";
import type { SalesReport, InventoryReport, IncomeStatementReport } from "@/services/reports";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  const [salesReport, setSalesReport] = React.useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = React.useState<InventoryReport | null>(null);
  const [incomeStatement, setIncomeStatement] = React.useState<IncomeStatementReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"sales" | "dre" | "inventory" | "ranking">("sales");

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao buscar relatórios.");
      const data = await res.json();
      setSalesReport(data.sales);
      setInventoryReport(data.inventory);
      setIncomeStatement(data.incomeStatement);
    } catch {
      toast.error("Erro ao carregar relatórios gerenciais.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Relatórios & Inteligência</h1>
          <p className="text-sm text-gray-500 mt-1">
            Indicadores de vendas, DRE financeiro, curva ABC de produtos e posição de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl max-w-fit">
        {[
          { id: "sales", label: "Desempenho de Vendas", icon: ShoppingBag },
          { id: "dre", label: "DRE & Lucratividade", icon: TrendingUp },
          { id: "ranking", label: "Peças Mais Vendidas", icon: Shirt },
          { id: "inventory", label: "Avaliação de Estoque", icon: Package },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                active ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: DESEMPENHO DE VENDAS */}
          {activeTab === "sales" && salesReport && (
            <div className="space-y-6">
              {/* Sales KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Faturamento Líquido</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-gray-900">
                      {formatCurrency(salesReport.netRevenue)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">
                      Bruto: {formatCurrency(salesReport.grossRevenue)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Total de Pedidos</span>
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-indigo-700">
                      {salesReport.totalSalesCount}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Vendas concluídas no PDV</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Ticket Médio</span>
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-teal-700">
                      {formatCurrency(salesReport.averageTicket)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Valor médio por atendimento</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Peças Faturadas</span>
                      <Shirt className="w-4 h-4 text-purple-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-purple-700">
                      {salesReport.totalPiecesSold}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Unidades de roupas vendidas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Methods Breakdown */}
              <Card className="border-gray-200 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-700" />
                    Distribuição por Forma de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Participação percentual de cada método de recebimento no faturamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {salesReport.paymentMethods.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">
                      Nenhuma venda registrada até o momento.
                    </p>
                  ) : (
                    salesReport.paymentMethods.map((pm) => (
                      <div key={pm.method} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-800">{pm.label}</span>
                          <span className="text-gray-600 font-mono">
                            {formatCurrency(pm.total)} ({pm.percent}%) • {pm.count} vendas
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-900 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, pm.percent))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: DRE SIMPLIFICADO */}
          {activeTab === "dre" && incomeStatement && (
            <Card className="border-gray-200 shadow-xs max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-700" />
                  DRE - Demonstrativo do Resultado do Exercício
                </CardTitle>
                <CardDescription>
                  Visão executiva do resultado operacional líquido da boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="divide-y divide-gray-100 text-sm">
                  {/* Receita Bruta */}
                  <div className="py-3 flex justify-between items-center font-bold text-gray-900">
                    <span>(+) Receita Operacional Líquida de Vendas</span>
                    <span className="font-mono text-base">
                      {formatCurrency(incomeStatement.grossRevenue)}
                    </span>
                  </div>

                  {/* CMV */}
                  <div className="py-3 flex justify-between items-center text-red-600">
                    <div>
                      <span className="font-medium">(-) Custo das Mercadorias Vendidas (CMV)</span>
                      <p className="text-[11px] text-gray-400">
                        Custo de aquisição junto aos fornecedores de confecção
                      </p>
                    </div>
                    <span className="font-mono font-bold">- {formatCurrency(incomeStatement.cogs)}</span>
                  </div>

                  {/* Lucro Bruto */}
                  <div className="py-3 flex justify-between items-center bg-gray-50/80 px-3 rounded-lg font-bold text-gray-900">
                    <div>
                      <span>(=) Lucro Bruto da Loja</span>
                      <span className="text-xs text-emerald-700 ml-2 font-semibold">
                        (Margem Bruta: {incomeStatement.grossMarginPercent}%)
                      </span>
                    </div>
                    <span className="font-mono text-emerald-700 text-base">
                      {formatCurrency(incomeStatement.grossProfit)}
                    </span>
                  </div>

                  {/* Despesas Operacionais */}
                  <div className="py-3 flex justify-between items-center text-red-600">
                    <div>
                      <span className="font-medium">(-) Despesas Operacionais & Administrativas</span>
                      <p className="text-[11px] text-gray-400">
                        Aluguel, contas de luz, internet, sistemas e manutenção
                      </p>
                    </div>
                    <span className="font-mono font-bold">
                      - {formatCurrency(incomeStatement.operatingExpenses)}
                    </span>
                  </div>

                  {/* Lucro Líquido */}
                  <div className="py-4 flex justify-between items-center bg-gray-950 text-white px-4 rounded-xl font-black mt-2">
                    <div>
                      <span className="text-base tracking-wide">(=) RESULTADO LÍQUIDO FINAL</span>
                      <span className="text-xs text-gray-400 ml-2 font-normal">
                        (Margem Líquida: {incomeStatement.netMarginPercent}%)
                      </span>
                    </div>
                    <span
                      className={`text-xl font-mono ${
                        incomeStatement.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(incomeStatement.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: RANKING DE PEÇAS MAIS VENDIDAS */}
          {activeTab === "ranking" && salesReport && (
            <Card className="border-gray-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-gray-700" />
                  Curva ABC de Roupas & Peças Mais Vendidas
                </CardTitle>
                <CardDescription>
                  Ranking das peças por volume de saída e faturamento gerado
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Posição</th>
                        <th className="py-3 px-4">Peça / Produto</th>
                        <th className="py-3 px-4">SKU da Variação</th>
                        <th className="py-3 px-4 text-center">Tamanho</th>
                        <th className="py-3 px-4 text-center">Cor</th>
                        <th className="py-3 px-4 text-center">Peças Vendidas</th>
                        <th className="py-3 px-4 text-right">Faturamento Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {salesReport.topSellingVariants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            Nenhuma peça vendida ainda.
                          </td>
                        </tr>
                      ) : (
                        salesReport.topSellingVariants.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                  idx === 0
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : idx === 1
                                    ? "bg-gray-200 text-gray-800"
                                    : idx === 2
                                    ? "bg-orange-100 text-orange-900"
                                    : "bg-gray-50 text-gray-500"
                                }`}
                              >
                                {idx + 1}º
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">{item.product_name}</td>
                            <td className="py-3 px-4 font-mono text-gray-500">{item.sku_variant}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 bg-gray-100 rounded font-bold text-gray-800">
                                {item.size}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-700">{item.color}</td>
                            <td className="py-3 px-4 text-center font-bold text-gray-900">
                              {item.quantity} un
                            </td>
                            <td className="py-3 px-4 text-right font-black text-gray-900">
                              {formatCurrency(item.total_amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: AVALIAÇÃO DE ESTOQUE */}
          {activeTab === "inventory" && inventoryReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Total de Peças em Estoque</span>
                      <Package className="w-4 h-4 text-blue-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-gray-900">
                      {inventoryReport.totalPieces} un
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Unidades físicas nas araras e depósito</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Custo Total Imobilizado</span>
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-amber-700">
                      {formatCurrency(inventoryReport.totalCostValue)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Capital investido em mercadorias</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Valor de Venda Potencial</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-emerald-700">
                      {formatCurrency(inventoryReport.totalSaleValue)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Projeção na venda integral</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                      <span>Lucro Bruto Projetado</span>
                      <Percent className="w-4 h-4 text-purple-600" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-black text-purple-700">
                      {formatCurrency(inventoryReport.potentialProfit)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">Diferença Venda x Custo</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stock Health Card */}
              <Card className="border-gray-200 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Diagnóstico de Reposição e Giro
                  </CardTitle>
                  <CardDescription>
                    Identificação de rupturas e itens em ponto de reposição
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">
                        Itens com Estoque Baixo (Alerta):
                      </span>
                      <span className="text-xl font-black text-amber-900">
                        {inventoryReport.lowStockItemsCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Variações de tamanho/cor que atingiram a quantidade mínima de segurança.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-800">
                        Itens Esgotados (Ruptura Total):
                      </span>
                      <span className="text-xl font-black text-red-900">
                        {inventoryReport.outOfStockItemsCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 mt-1">
                      Peças com 0 unidades em estoque que necessitam novo pedido de compra.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
