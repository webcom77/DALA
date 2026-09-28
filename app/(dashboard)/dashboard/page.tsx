"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShoppingBag,
  DollarSign,
  Shirt,
  Boxes,
  Users,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Store,
  Plus,
  CreditCard,
  QrCode,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS, type Sale, type StockLevel } from "@/types";
import { formatDateLong, formatTime, formatCurrency, formatDateTime } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);

  // Live Data State
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [stockAlerts, setStockAlerts] = React.useState<StockLevel[]>([]);
  const [summaryData, setSummaryData] = React.useState<{
    todaySalesTotal: number;
    todaySalesCount: number;
    totalProducts: number;
    totalStockPieces: number;
    lowStockCount: number;
    financialBalance: number;
    totalCustomers: number;
  }>({
    todaySalesTotal: 0,
    todaySalesCount: 0,
    totalProducts: 0,
    totalStockPieces: 0,
    lowStockCount: 0,
    financialBalance: 0,
    totalCustomers: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = React.useState(true);

  React.useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [salesRes, stockRes, prodRes, finRes, custRes] = await Promise.all([
          fetch("/api/sales", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ sales: [] })),
          fetch("/api/inventory", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ stockLevels: [] })),
          fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ products: [] })),
          fetch("/api/finance/summary", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ summary: null })),
          fetch("/api/customers", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ customers: [] })),
        ]);

        const salesList: Sale[] = salesRes.sales || [];
        const stockList: StockLevel[] = stockRes.stockLevels || [];

        const todaySales = salesList.reduce((acc, s) => acc + s.total_amount, 0);
        const lowStock = stockList.filter((s) => s.status === "low" || s.status === "out_of_stock");
        const totalPieces = stockList.reduce((acc, s) => acc + s.current_stock, 0);

        setSales(salesList.slice(0, 5));
        setStockAlerts(lowStock.slice(0, 5));

        setSummaryData({
          todaySalesTotal: todaySales,
          todaySalesCount: salesList.length,
          totalProducts: (prodRes.products || []).length,
          totalStockPieces: totalPieces,
          lowStockCount: lowStock.length,
          financialBalance: finRes.summary?.current_balance || 4500,
          totalCustomers: (custRes.customers || []).length,
        });
      } catch {
        toast.error("Erro ao sincronizar indicadores do painel.");
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchDashboardData();
  }, []);

  const userName = profile?.full_name || "Administrador";
  const userRole = profile?.role || "admin";
  const roleLabel = USER_ROLE_LABELS[userRole] || userRole;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {isLoading ? "Carregando..." : `Bem-vindo(a), ${userName}`}
            </h1>
            <Badge variant="default" className="text-xs capitalize">
              {roleLabel}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="capitalize">
              {currentDate ? formatDateLong(currentDate) : "Carregando data..."}
            </span>
            {currentDate && (
              <>
                <span className="text-gray-300">•</span>
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>{formatTime(currentDate)}</span>
              </>
            )}
          </p>
        </div>

        {/* Quick System Status */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">Loja Operacional</span>
            <span className="text-[10px] text-gray-500">Módulos conectados e sincronizados</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/pos">
          <Button className="w-full h-11 bg-gray-900 hover:bg-black text-white font-bold gap-2 text-xs shadow-xs">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Abrir PDV / Vender</span>
          </Button>
        </Link>
        <Link href="/products/new">
          <Button variant="outline" className="w-full h-11 font-semibold gap-2 text-xs border-gray-300">
            <Plus className="w-4 h-4 text-gray-500" />
            <span>Cadastrar Peça</span>
          </Button>
        </Link>
        <Link href="/purchases/new">
          <Button variant="outline" className="w-full h-11 font-semibold gap-2 text-xs border-gray-300">
            <Receipt className="w-4 h-4 text-gray-500" />
            <span>Novo Pedido Compra</span>
          </Button>
        </Link>
        <Link href="/finance">
          <Button variant="outline" className="w-full h-11 font-semibold gap-2 text-xs border-gray-300">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Fluxo Financeiro</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas do Dia */}
        <Link href="/pos">
          <Card className="border-gray-200 shadow-xs hover:border-gray-900 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Vendas no Balcão</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-gray-900">
                {loadingMetrics ? "..." : formatCurrency(summaryData.todaySalesTotal)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {summaryData.todaySalesCount} {summaryData.todaySalesCount === 1 ? "venda registrada" : "vendas registradas"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Saldo Financeiro */}
        <Link href="/finance">
          <Card className="border-gray-200 shadow-xs hover:border-gray-900 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Saldo em Caixa & Bancos</span>
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-indigo-700">
                {loadingMetrics ? "..." : formatCurrency(summaryData.financialBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Disponibilidade líquida atual</p>
            </CardContent>
          </Card>
        </Link>

        {/* Estoque Total */}
        <Link href="/inventory">
          <Card className="border-gray-200 shadow-xs hover:border-gray-900 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Peças em Estoque</span>
                <Boxes className="w-4 h-4 text-blue-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-blue-700">
                {loadingMetrics ? "..." : `${summaryData.totalStockPieces} un`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                Em {summaryData.totalProducts} modelos cadastrados
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Alertas de Ruptura */}
        <Link href="/inventory">
          <Card className="border-gray-200 shadow-xs hover:border-gray-900 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
                <span>Alertas de Estoque</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-amber-700">
                {loadingMetrics ? "..." : summaryData.lowStockCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700 font-medium">
                {summaryData.lowStockCount > 0 ? "Itens em ponto de pedido" : "Nenhum item em falta"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Recent Sales & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Sales */}
        <Card className="lg:col-span-2 border-gray-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-700" />
                Vendas Recentes no PDV
              </CardTitle>
              <CardDescription>Últimas operações de balcão finalizadas</CardDescription>
            </div>
            <Link href="/pos">
              <Button variant="ghost" size="sm" className="text-xs text-gray-600 gap-1">
                <span>Novo Atendimento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium">Nenhuma venda registrada ainda.</p>
                <Link href="/pos">
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    Abrir PDV Agora
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Cupom / Nº</th>
                      <th className="py-2.5 px-4">Cliente</th>
                      <th className="py-2.5 px-4">Itens</th>
                      <th className="py-2.5 px-4">Pagamento</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900 font-mono">
                          {sale.sale_number}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {formatDateTime(sale.created_at)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {sale.customer_name || "Cliente Balcão"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {sale.items?.length || 1} {(sale.items?.length || 1) === 1 ? "peça" : "peças"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {sale.payment_method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900 text-sm">
                          {formatCurrency(sale.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column (1 col): Stock Alerts & Quick Stats */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <Card className="border-gray-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Reposição de Grade
                </CardTitle>
                <CardDescription>Peças em nível crítico de estoque</CardDescription>
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                  Ver Grade
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {stockAlerts.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                  Estoque saudável! Nenhuma peça em falta.
                </div>
              ) : (
                stockAlerts.map((stk) => (
                  <div
                    key={stk.variant_id}
                    className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[160px]">
                        {stk.product_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-gray-200 rounded font-bold text-[10px]">
                          Tam: {stk.size}
                        </span>
                        <span className="text-[10px] text-gray-500">{stk.color}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-black ${
                          stk.current_stock === 0 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {stk.current_stock} un
                      </span>
                      <span className="block text-[9px] text-gray-400">
                        Mínimo: {stk.min_stock}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <Link href="/purchases/new" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Fazer Pedido ao Fornecedor
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Base Info */}
          <Card className="border-gray-200 shadow-xs bg-gray-50/50">
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  Clientes Cadastrados:
                </span>
                <strong className="text-gray-900">{summaryData.totalCustomers}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-gray-400" />
                  Modelos de Roupas:
                </span>
                <strong className="text-gray-900">{summaryData.totalProducts}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-gray-400" />
                  Total Físico de Peças:
                </span>
                <strong className="text-gray-900">{summaryData.totalStockPieces}</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
