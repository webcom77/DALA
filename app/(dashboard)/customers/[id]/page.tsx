"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  MessageCircle,
  Edit,
  RefreshCw,
  Receipt,
  FileText,
  User,
  Sparkles,
  ChevronRight,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { customerService, type CustomerDebtDetails, type PaymentReceipt } from "@/services/customer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import type { FinancialTransaction, Sale } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [data, setData] = React.useState<CustomerDebtDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"promissory" | "purchases">("promissory");

  // Modal de Baixa de Parcela
  const [selectedTx, setSelectedTx] = React.useState<FinancialTransaction | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("money");
  const [isSubmittingPayment, setIsSubmittingPayment] = React.useState(false);

  // Recibo Emitido
  const [lastReceipt, setLastReceipt] = React.useState<PaymentReceipt | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomerDebtDetails(id);
      setData(res);
    } catch {
      toast.error("Erro ao carregar dados do cliente.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Abre modal de recebimento
  const handleOpenPaymentModal = (tx: FinancialTransaction) => {
    setSelectedTx(tx);
    setPaymentAmount(tx.amount);
    setPaymentMethod("money");
  };

  // Confirma baixa no pagamento
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || paymentAmount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await customerService.receivePayment({
        customerId: id,
        transactionId: selectedTx.id,
        amount: paymentAmount,
        paymentMethod,
      });

      if (!res.success) {
        toast.error(res.error || "Erro ao registrar pagamento.");
        return;
      }

      toast.success("Pagamento registrado com sucesso! Recibo gerado.");
      setLastReceipt(res.receipt || null);
      setSelectedTx(null);
      await loadData();
    } catch {
      toast.error("Erro ao processar baixa.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Gera link amigável do WhatsApp com cobrança suave e chave PIX
  const handleOpenWhatsApp = () => {
    if (!data?.customer) return;
    const phone = (data.customer.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.warning("Cliente não possui número de telefone cadastrado.");
      return;
    }

    const customerFirstName = data.customer.name.split(" ")[0];
    const overdueText =
      data.overdueDebt > 0
        ? `Você possui um valor em aberto de ${formatCurrency(data.totalDebt)} (sendo ${formatCurrency(data.overdueDebt)} com vencimento recente).`
        : `Você possui parcelas a vencer no total de ${formatCurrency(data.totalDebt)}.`;

    const message = encodeURIComponent(
      `Olá, ${customerFirstName}! Tudo bem com você? Esperamos que esteja tendo um ótimo dia! 🌸\n\nPassando com todo carinho da DALA Boutique para enviar o extrato das suas notinhas:\n${overdueText}\n\nSe desejar efetuar o pagamento via PIX, nossa chave é o CNPJ/telefone da loja.\nQualquer dúvida, estamos sempre à disposição!`
    );

    const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${waPhone}?text=${message}`, "_blank");
  };

  // Impressão da Ficha de Notinha
  const handlePrintStatement = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="h-7 w-7 animate-spin text-brand-700 mb-2" />
        <p className="text-xs text-luxury-muted">Carregando ficha e histórico da cliente...</p>
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-normal text-luxury-title font-sans">Cliente não encontrada</h2>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/customers" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Lista de Clientes
          </Link>
        </Button>
      </div>
    );
  }

  const { customer, transactions, sales, totalDebt, overdueDebt, paidDebt, nextDueDate } = data;

  const hasOverdue = overdueDebt > 0;
  const hasDebt = totalDebt > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 selection:bg-brand-100 selection:text-brand-800">
      {/* 1. TOPO DE NAVEGAÇÃO E AÇÕES VIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E9] dark:border-border/60">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full h-9 w-9 text-luxury-muted hover:text-brand-800">
            <Link href="/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-normal text-luxury-title dark:text-foreground font-sans tracking-tight">
                {customer.name}
              </h1>
              {hasOverdue ? (
                <Badge variant="destructive" className="rounded-full text-[10px] px-2 py-0.5">
                  Débito em Atraso
                </Badge>
              ) : hasDebt ? (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 rounded-full text-[10px] px-2 py-0.5">
                  Notinha em Aberto
                </Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 rounded-full text-[10px] px-2 py-0.5">
                  Em Dia / Sem Débito
                </Badge>
              )}
            </div>
            <p className="text-xs text-luxury-muted mt-0.5">
              Cliente cadastrada em {formatDate(customer.created_at)} • {customer.orders_count} compras realizadas
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasDebt && (
            <Button
              type="button"
              onClick={handleOpenWhatsApp}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5 shadow-sm"
              title="Enviar extrato e chave PIX por WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Cobrar no WhatsApp</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handlePrintStatement}
            className="rounded-full text-xs font-medium gap-1.5 border-[#EFE5E9] hover:bg-brand-50"
            title="Imprimir ficha de notinhas do cliente"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Extrato</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-full text-xs font-medium gap-1.5 border-[#EFE5E9] hover:bg-brand-50"
          >
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="h-3.5 w-3.5" />
              <span>Editar</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. DOSSIÊ DO CLIENTE (Card de Contato & Informações) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Card de Dados de Contato */}
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-100 via-rose-100 to-amber-50 border border-brand-200 flex items-center justify-center text-brand-800 font-bold text-sm shadow-xs font-sans">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-luxury-title dark:text-foreground truncate max-w-[170px]">
                {customer.name}
              </p>
              <p className="text-[11px] text-luxury-muted">
                {customer.cpf_cnpj ? `CPF: ${customer.cpf_cnpj}` : "Sem CPF cadastrado"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F8F1F3] dark:border-border/40 space-y-2 text-xs text-luxury-body dark:text-muted-foreground">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span className="font-mono">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-luxury-muted shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.address?.city && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-luxury-muted shrink-0 mt-0.5" />
                <span>
                  {customer.address.street ? `${customer.address.street}, ${customer.address.number || "S/N"}` : ""}
                  {customer.address.neighborhood ? ` - ${customer.address.neighborhood}` : ""}
                  {customer.address.city ? ` (${customer.address.city}/${customer.address.state || ""})` : ""}
                </span>
              </div>
            )}
            {customer.birth_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-luxury-muted shrink-0" />
                <span>Aniversário: {formatDate(customer.birth_date)}</span>
              </div>
            )}
            {customer.notes && (
              <div className="pt-2 border-t border-[#F8F1F3] text-[11px] italic text-luxury-muted">
                &ldquo;{customer.notes}&rdquo;
              </div>
            )}
          </div>
        </Card>

        {/* 3 CARDS DE KPI FINANCEIRO */}
        {/* Total Devedor em Notinhas */}
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-muted">
                Saldo Devedor Notinhas
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F4] text-brand-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-sans mt-2 ${hasOverdue ? "text-destructive" : hasDebt ? "text-brand-800" : "text-emerald-700"}`}>
              {formatCurrency(totalDebt)}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#F8F1F3] text-[11px] text-luxury-muted flex items-center justify-between">
            <span>{nextDueDate ? `Próximo: ${formatDate(nextDueDate)}` : "Sem parcelas pendentes"}</span>
            {hasOverdue && <span className="text-destructive font-bold">Vencido!</span>}
          </div>
        </Card>

        {/* Parcelas Vencidas em Atraso */}
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-muted">
                Parcelas em Atraso
              </span>
              <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-sans text-destructive mt-2">
              {formatCurrency(overdueDebt)}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#F8F1F3] text-[11px] text-luxury-muted">
            {hasOverdue ? (
              <span className="text-destructive font-semibold">Necessita cobrança</span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Nenhuma parcela vencida
              </span>
            )}
          </div>
        </Card>

        {/* Total Histórico em Compras */}
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-muted">
                Total Comprado na Loja
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-sans text-luxury-title dark:text-foreground mt-2">
              {formatCurrency(customer.total_spent)}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#F8F1F3] text-[11px] text-luxury-muted flex items-center justify-between">
            <span>{sales.length} vendas registradas</span>
            <span className="text-emerald-700 font-medium">Pago: {formatCurrency(paidDebt)}</span>
          </div>
        </Card>
      </div>

      {/* 3. SELETOR DE ABAS: NOTINHAS VS HISTÓRICO DE COMPRAS */}
      <div className="flex items-center gap-2 border-b border-[#EFE5E9] dark:border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("promissory")}
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "promissory"
              ? "bg-brand-700 text-white shadow-pill"
              : "text-luxury-body hover:text-brand-800 hover:bg-brand-50"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Notinhas &amp; Promissórias ({transactions.length})</span>
          {hasOverdue && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === "purchases"
              ? "bg-brand-700 text-white shadow-pill"
              : "text-luxury-body hover:text-brand-800 hover:bg-brand-50"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Histórico de Compras ({sales.length})</span>
        </button>
      </div>

      {/* 4. ABA 1: NOTINHAS & PROMISSÓRIAS */}
      {activeTab === "promissory" && (
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-[#F8F1F3] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-luxury-title dark:text-foreground font-sans">
                Carnê de Notinhas da Cliente
              </CardTitle>
              <CardDescription className="text-xs text-luxury-muted">
                Acompanhamento de vencimentos, parcelas pendentes e quitações efetuadas.
              </CardDescription>
            </div>
            {hasDebt && (
              <span className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Saldo Devedor: {formatCurrency(totalDebt)}
              </span>
            )}
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F6] dark:bg-muted/40 border-b border-[#F0E6EA] text-luxury-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Descrição da Notinha</th>
                  <th className="px-4 py-3">Valor da Parcela</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quitação</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F1F3] dark:divide-border/40">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-luxury-muted">
                      Nenhuma notinha ou parcela gerada para esta cliente.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPaid = tx.status === "paid";
                    const isOverdue = tx.status === "overdue";
                    return (
                      <tr key={tx.id} className="hover:bg-brand-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isOverdue && <Clock className="w-3.5 h-3.5 text-destructive" />}
                            <span className={isOverdue ? "text-destructive font-bold" : "text-luxury-title"}>
                              {formatDate(tx.due_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-luxury-body">
                          <p className="font-semibold text-luxury-title">{tx.description}</p>
                          <p className="text-[10px] text-luxury-muted">Origem: {tx.category}</p>
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono text-sm text-luxury-title">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          {isPaid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 rounded-full text-[10px] font-medium">
                              Pago
                            </Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive" className="rounded-full text-[10px] font-bold">
                              Em Atraso
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50 border-amber-200 rounded-full text-[10px] font-medium">
                              A Vencer
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-luxury-muted text-[11px]">
                          {tx.paid_at ? (
                            <span>
                              Pago em {formatDate(tx.paid_at)} via {tx.payment_method?.toUpperCase()}
                            </span>
                          ) : (
                            <span>Em aberto</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {!isPaid ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenPaymentModal(tx)}
                              className="rounded-full bg-brand-700 hover:bg-brand-800 text-white text-[11px] h-7 px-3 font-medium shadow-xs"
                            >
                              Receber Parcela
                            </Button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Liquidada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. ABA 2: HISTÓRICO COMPLETO DE COMPRAS */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          {sales.length === 0 ? (
            <Card className="rounded-2xl border-[#F0E6EA] p-12 text-center text-luxury-muted">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma compra realizada no PDV por esta cliente até o momento.</p>
            </Card>
          ) : (
            sales.map((sale) => (
              <Card key={sale.id} className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card overflow-hidden">
                <CardHeader className="p-4 bg-[#FAF8F6] dark:bg-muted/30 border-b border-[#F0E6EA] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                      {sale.sale_number}
                    </span>
                    <span className="text-xs text-luxury-muted">
                      {formatDateTime(sale.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {sale.payment_method === "promissory" ? "Notinha Promissória" : sale.payment_method.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-bold font-mono text-luxury-title">
                      {formatCurrency(sale.total_amount)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-luxury-muted font-medium border-b pb-1">
                        <tr>
                          <th className="py-1">Peça / Produto</th>
                          <th className="py-1">Grade</th>
                          <th className="py-1 text-center">Qtd</th>
                          <th className="py-1 text-right">Preço Unit.</th>
                          <th className="py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8F1F3]">
                        {sale.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-2 font-medium text-luxury-title">
                              {item.product_name}
                              <span className="block text-[10px] font-mono text-luxury-muted">EAN: {item.sku_variant}</span>
                            </td>
                            <td className="py-2">
                              <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-semibold">
                                Tam: {item.size} • Cor: {item.color}
                              </span>
                            </td>
                            <td className="py-2 text-center font-bold">{item.quantity}</td>
                            <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="py-2 text-right font-bold text-brand-800">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sale.discount > 0 && (
                    <div className="mt-2 text-right text-xs text-luxury-muted">
                      Desconto aplicado: <span className="text-destructive font-semibold">-{formatCurrency(sale.discount)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 6. MODAL DE RECEBIMENTO DE PARCELA */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-card rounded-2xl border border-[#F0E6EA] shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-luxury-title font-sans">
                  Receber Pagamento de Notinha
                </h3>
                <p className="text-xs text-luxury-muted">
                  Cliente: <strong className="text-luxury-title">{customer.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-full hover:bg-muted text-luxury-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="p-3 bg-[#FAF8F6] rounded-xl text-xs space-y-1">
                <p className="text-luxury-muted">Detalhes da Parcela:</p>
                <p className="font-semibold text-luxury-title">{selectedTx.description}</p>
                <p className="text-luxury-muted">Vencimento: {formatDate(selectedTx.due_date)}</p>
                <p className="font-bold text-brand-800 text-sm mt-1">
                  Valor Total da Parcela: {formatCurrency(selectedTx.amount)}
                </p>
              </div>

              {/* Valor a Pagar (permite quitação integral ou amortização parcial) */}
              <div className="space-y-1.5">
                <Label htmlFor="payAmount" className="text-xs font-semibold">
                  Valor a Pagar (R$) *
                </Label>
                <Input
                  id="payAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedTx.amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="font-mono font-bold text-base"
                  required
                />
                {paymentAmount < selectedTx.amount && (
                  <p className="text-[11px] text-amber-700">
                    Atenção: Pagamento parcial. O saldo restante de {formatCurrency(selectedTx.amount - paymentAmount)} continuará pendente.
                  </p>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Forma de Pagamento Recebida *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "money", label: "Dinheiro" },
                    { id: "pix", label: "PIX" },
                    { id: "credit_card", label: "Cartão de Crédito" },
                    { id: "debit_card", label: "Cartão de Débito" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        paymentMethod === m.id
                          ? "bg-brand-50 border-brand-700 text-brand-800 font-bold shadow-xs"
                          : "border-border text-luxury-muted hover:border-brand-200"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTx(null)}
                  disabled={isSubmittingPayment}
                  className="rounded-full text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs"
                >
                  {isSubmittingPayment ? "Processando..." : "Confirmar Recebimento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL DE RECIBO DE PAGAMENTO (Para impressão imediata) */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div id="dala-receipt" className="bg-white rounded-2xl border shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="text-center border-b pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-sans">
                Recibo de Pagamento de Notinha
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{lastReceipt.receiptNumber}</p>
            </div>

            <div className="space-y-2 text-xs border-b pb-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold">{lastReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data/Hora:</span>
                <span>{formatDateTime(lastReceipt.paidAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Forma:</span>
                <span className="uppercase font-semibold">{lastReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Descrição:</span>
                <span className="text-right truncate max-w-[180px]">{lastReceipt.installmentDescription}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1 border-t">
                <span>Valor Pago:</span>
                <span>{formatCurrency(lastReceipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Saldo Restante:</span>
                <span>{formatCurrency(lastReceipt.remainingDebt)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLastReceipt(null)}
                className="w-full rounded-full text-xs"
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
