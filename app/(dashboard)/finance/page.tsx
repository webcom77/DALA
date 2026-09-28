"use client";

import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Trash2,
  CreditCard,
  Building,
  Tag,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

import type { FinancialSummary, FinancialTransaction } from "@/types";
import { financeService } from "@/services/finance";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancePage() {
  const [summary, setSummary] = React.useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = React.useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [activeTab, setActiveTab] = React.useState<"all" | "payable" | "receivable">("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  // Modal: New Transaction
  const [isNewTxModalOpen, setIsNewTxModalOpen] = React.useState(false);
  const [newType, setNewType] = React.useState<"payable" | "receivable">("payable");
  const [newCategory, setNewCategory] = React.useState("Despesas Fixas");
  const [newDescription, setNewDescription] = React.useState("");
  const [newAmount, setNewAmount] = React.useState("");
  const [newDueDate, setNewDueDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [newEntityName, setNewEntityName] = React.useState("");
  const [newPaymentMethod, setNewPaymentMethod] = React.useState("pix");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Modal: Mark as Paid
  const [payingTx, setPayingTx] = React.useState<FinancialTransaction | null>(null);
  const [settlementMethod, setSettlementMethod] = React.useState("pix");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sum, list] = await Promise.all([
        financeService.getSummary(),
        financeService.getTransactions({
          type: activeTab === "all" ? undefined : activeTab,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
        }),
      ]);
      setSummary(sum);
      setTransactions(list);
    } catch {
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount.replace(",", ".")) || 0;
    if (amountNum <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }
    if (!newDescription.trim()) {
      toast.error("Informe uma descrição para o lançamento.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await financeService.createTransaction({
        type: newType,
        category: newCategory,
        description: newDescription.trim(),
        amount: amountNum,
        due_date: newDueDate,
        status: "pending",
        payment_method: newPaymentMethod as any,
        customer_name: newType === "receivable" ? newEntityName.trim() || undefined : undefined,
        supplier_name: newType === "payable" ? newEntityName.trim() || undefined : undefined,
      });

      if (res.transaction) {
        toast.success(
          newType === "payable" ? "Conta a pagar registrada!" : "Conta a receber registrada!"
        );
        setIsNewTxModalOpen(false);
        setNewDescription("");
        setNewAmount("");
        setNewEntityName("");
        loadData();
      } else {
        toast.error(res.error || "Erro ao criar lançamento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = async () => {
    if (!payingTx) return;
    setIsSubmitting(true);
    try {
      const res = await financeService.markAsPaid(payingTx.id, settlementMethod);
      if (res.transaction) {
        toast.success(
          payingTx.type === "payable"
            ? "Baixa realizada! Pagamento registrado."
            : "Baixa realizada! Recebimento confirmado."
        );
        setPayingTx(null);
        loadData();
      } else {
        toast.error(res.error || "Erro ao realizar baixa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDeleteTx = async (id: string) => {
    if (confirm("Deseja realmente excluir este lançamento financeiro?")) {
      const ok = await financeService.deleteTransaction(id);
      if (ok) {
        toast.success("Lançamento excluído com sucesso.");
        loadData();
      } else {
        toast.error("Erro ao excluir lançamento.");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Módulo Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de contas a pagar, contas a receber, baixas e fluxo de caixa da boutique.
          </p>
        </div>

        <Button
          onClick={() => setIsNewTxModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
              <span>Saldo em Caixa & Bancos</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-gray-900">
              {summary ? formatCurrency(summary.current_balance) : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Disponibilidade imediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
              <span>Total a Receber (Pendente)</span>
              <ArrowDownLeft className="w-4 h-4 text-teal-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-teal-700">
              {summary ? formatCurrency(summary.total_receivable_pending) : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Recebido no mês:{" "}
              <strong className="text-gray-900 font-bold">
                {summary ? formatCurrency(summary.total_received_month) : "..."}
              </strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
              <span>Total a Pagar (Pendente)</span>
              <ArrowUpRight className="w-4 h-4 text-red-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-red-700">
              {summary ? formatCurrency(summary.total_payable_pending) : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Pago no mês:{" "}
              <strong className="text-gray-900 font-bold">
                {summary ? formatCurrency(summary.total_paid_month) : "..."}
              </strong>
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 flex items-center justify-between">
              <span>Contas Atrasadas</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-amber-700">
              {summary ? summary.overdue_count : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {summary?.overdue_count && summary.overdue_count > 0
                ? "Atenção: pendências com data vencida"
                : "Nenhum título em atraso"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-gray-200 shadow-xs">
        {/* Navigation Tabs & Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "all", label: "Fluxo de Caixa Geral" },
              { id: "payable", label: "Contas a Pagar" },
              { id: "receivable", label: "Contas a Receber" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === t.id ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por descrição, fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos / Recebidos</option>
              <option value="overdue">Atrasados</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">Nenhum lançamento encontrado</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Altere os filtros acima ou crie um novo lançamento.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição & Categoria</th>
                  <th className="py-3 px-4">Pessoa / Origem</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {transactions.map((tx) => {
                  const isPayable = tx.type === "payable";
                  const isPaid = tx.status === "paid";
                  const isOverdue = tx.status === "overdue";

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            isPayable
                              ? "bg-red-50 text-red-700 border-red-200 gap-1 font-semibold"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold"
                          }
                        >
                          {isPayable ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> A Pagar
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3" /> A Receber
                            </>
                          )}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{tx.description}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {tx.category}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-gray-700">
                        {tx.supplier_name || tx.customer_name || "—"}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(tx.due_date)}</span>
                        </div>
                        {isPaid && tx.paid_at && (
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Baixado em {formatDate(tx.paid_at)}
                          </span>
                        )}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-black text-sm ${
                          isPayable ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {isPayable ? `- ${formatCurrency(tx.amount)}` : `+ ${formatCurrency(tx.amount)}`}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={isPaid ? "secondary" : "outline"}
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : isOverdue
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {isPaid ? "Liquidado" : isOverdue ? "Atrasado" : "Pendente"}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPayingTx(tx)}
                              className="h-7 text-[11px] bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border-emerald-300 font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Dar Baixa
                            </Button>
                          )}

                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* MODAL: NOVO LANÇAMENTO */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Novo Lançamento Financeiro</h3>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setNewType("payable");
                    setNewCategory("Despesas Fixas");
                  }}
                  className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    newType === "payable"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Conta a Pagar (Despesa)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewType("receivable");
                    setNewCategory("Vendas");
                  }}
                  className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    newType === "receivable"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Conta a Receber (Receita)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Descrição do Título:
                </label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={
                    newType === "payable"
                      ? "Ex: Fatura Internet Loja, Aluguel ou Compra de Tecidos"
                      : "Ex: Recebimento de Venda no Crediário / Acordo"
                  }
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Valor (R$):</label>
                  <Input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0,00"
                    required
                    className="h-10 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Vencimento:</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Categoria:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700"
                  >
                    {newType === "payable" ? (
                      <>
                        <option value="Fornecedores">Fornecedores (Compras)</option>
                        <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
                        <option value="Energia / Água">Energia / Água / Utilidades</option>
                        <option value="Salários & Folha">Salários & Pró-labore</option>
                        <option value="Marketing & Anúncios">Marketing & Divulgação</option>
                        <option value="Impostos & Tributos">Impostos & Simples Nacional</option>
                        <option value="Outras Despesas">Outras Despesas</option>
                      </>
                    ) : (
                      <>
                        <option value="Vendas">Vendas / Balcão</option>
                        <option value="Vendas a Prazo / Crediário">Crediário Próprio</option>
                        <option value="Comissões / Bonificação">Bonificação / Entradas Diversas</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {newType === "payable" ? "Nome do Fornecedor:" : "Nome do Cliente:"}
                  </label>
                  <Input
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    placeholder="Opcional"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTxModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gray-900 hover:bg-black text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Lançamento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAR BAIXA / LIQUIDAR TÍTULO */}
      {payingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {payingTx.type === "payable" ? "Baixar Pagamento" : "Baixar Recebimento"}
                </h3>
                <p className="text-xs text-gray-500">Confirme a liquidação deste título.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <p className="font-bold text-gray-900">{payingTx.description}</p>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Valor Total:</span>
                <span className="font-black text-gray-950 text-sm">{formatCurrency(payingTx.amount)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Forma de Pagamento Utilizada:
              </label>
              <select
                value={settlementMethod}
                onChange={(e) => setSettlementMethod(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="money">Dinheiro (Espécie)</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayingTx(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleMarkAsPaid}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Confirmar Baixa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
