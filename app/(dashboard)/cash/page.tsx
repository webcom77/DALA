"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  Lock,
  Unlock,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  AlertCircle,
  Clock,
  User,
  ShoppingBag,
  RefreshCw,
  LayoutGrid,
  History as HistoryIcon,
  CheckCircle2,
  Calendar,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import type { CashSession } from "@/types";
import { posService } from "@/services/pos";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CashRegisterPage() {
  const [session, setSession] = React.useState<CashSession | null>(null);
  const [history, setHistory] = React.useState<CashSession[]>([]);
  const [activeTab, setActiveTab] = React.useState<"active" | "history">("active");
  const [loading, setLoading] = React.useState(true);

  // History search & filter
  const [historySearch, setHistorySearch] = React.useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = React.useState("all");

  // Open modal
  const [isOpenModalActive, setIsOpenModalActive] = React.useState(false);
  const [initialFloat, setInitialFloat] = React.useState("200.00");
  const [openNotes, setOpenNotes] = React.useState("");

  // Close modal
  const [isCloseModalActive, setIsCloseModalActive] = React.useState(false);
  const [finalCount, setFinalCount] = React.useState("");
  const [closeNotes, setCloseNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sess, hist] = await Promise.all([
        posService.getActiveSession(),
        posService.getSessionHistory(),
      ]);
      setSession(sess);
      setHistory(hist);
    } catch {
      toast.error("Erro ao carregar dados do caixa.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCash = async () => {
    const floatVal = parseFloat(initialFloat.replace(",", ".")) || 0;
    if (floatVal < 0) {
      toast.error("O fundo de caixa não pode ser negativo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await posService.openSession({
        initial_balance: floatVal,
        notes: openNotes || "Abertura regular de turno",
      });

      if (res.session) {
        setSession(res.session);
        setIsOpenModalActive(false);
        setOpenNotes("");
        toast.success("Caixa aberto com sucesso!");
        await loadData();
      } else {
        toast.error(res.error || "Erro ao abrir o caixa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCash = async () => {
    const countVal = parseFloat(finalCount.replace(",", ".")) || 0;
    setIsSubmitting(true);
    try {
      const res = await posService.closeSession({
        final_balance: countVal,
        notes: closeNotes || undefined,
      });

      if (res.session) {
        setSession(null);
        setIsCloseModalActive(false);
        setFinalCount("");
        setCloseNotes("");
        toast.success("Caixa fechado com sucesso!");
        await loadData();
      } else {
        toast.error(res.error || "Erro ao fechar caixa.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSessionOpen = session && session.status === "open";

  // Expected cash in drawer = Initial Balance + Cash Sales
  const expectedCashInDrawer = React.useMemo(() => {
    if (!session) return 0;
    return Number((session.initial_balance + session.total_cash).toFixed(2));
  }, [session]);

  const finalCountNum = parseFloat(finalCount.replace(",", ".")) || 0;
  const cashDifference = finalCount ? Number((finalCountNum - expectedCashInDrawer).toFixed(2)) : 0;

  // Filtered History
  const filteredHistory = React.useMemo(() => {
    return history.filter((s) => {
      const matchSearch =
        !historySearch ||
        s.opened_by.toLowerCase().includes(historySearch.toLowerCase()) ||
        (s.closed_by && s.closed_by.toLowerCase().includes(historySearch.toLowerCase())) ||
        (s.notes && s.notes.toLowerCase().includes(historySearch.toLowerCase()));

      const matchStatus =
        historyStatusFilter === "all" || s.status === historyStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [history, historySearch, historyStatusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb de Navegação */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Central de Módulos</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Movimento de Caixa</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Movimento de Caixa
            </h1>
            <Badge
              variant={isSessionOpen ? "secondary" : "outline"}
              className={
                isSessionOpen
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-muted text-muted-foreground border-border"
              }
            >
              {isSessionOpen ? "Turno Aberto" : "Caixa Fechado"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gerenciamento de turnos, abertura, fechamento e conferência de valores do PDV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadData()} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {/* Abas de visualização */}
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === "active"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Turno Atual
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>Histórico ({history.length})</span>
            </button>
          </div>

          <Link href="/pos">
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Ir para o PDV
            </Button>
          </Link>

          {isSessionOpen ? (
            <Button
              variant="destructive"
              className="gap-2 bg-red-600 hover:bg-red-700 font-semibold"
              onClick={() => setIsCloseModalActive(true)}
            >
              <Lock className="w-4 h-4" />
              Fechar Caixa
            </Button>
          ) : (
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => setIsOpenModalActive(true)}
            >
              <Unlock className="w-4 h-4" />
              Abrir Caixa
            </Button>
          )}
        </div>
      </div>

      {/* ABA 1: TURNO ATUAL */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {session ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border shadow-xs">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium flex items-center justify-between">
                          <span>Fundo de Caixa (Abertura)</span>
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold">
                          {formatCurrency(session.initial_balance)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Iniciado às {formatDateTime(session.opened_at)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-xs">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium flex items-center justify-between">
                          <span>Total em Dinheiro (Espécie)</span>
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(session.total_cash)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Na gaveta: <strong>{formatCurrency(expectedCashInDrawer)}</strong>
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-xs">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium flex items-center justify-between">
                          <span>Vendas no PIX</span>
                          <QrCode className="w-4 h-4 text-teal-600" />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-teal-700">
                          {formatCurrency(session.total_pix)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Entrada direta em conta bancária</p>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-xs">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-medium flex items-center justify-between">
                          <span>Vendas em Cartão (TEF)</span>
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-indigo-700">
                          {formatCurrency(session.total_card)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Crédito e Débito processados</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Resumo do Turno Atual */}
                  <Card className="border shadow-xs">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary" />
                        Resumo do Turno Atual
                      </CardTitle>
                      <CardDescription>
                        Identificação do operador e somatório das movimentações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-xl border text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">Operador Responsável:</span>
                          <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {session.opened_by}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Aberto em:</span>
                          <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {formatDateTime(session.opened_at)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Faturamento Total do Turno:</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {formatCurrency(session.total_sales)}
                          </p>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="p-3 bg-background border rounded-lg text-xs text-muted-foreground">
                          <strong className="text-foreground">Observações: </strong>
                          {session.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="p-8 text-center bg-muted/20 border">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground text-base">Nenhum caixa aberto no momento</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Para começar a registrar vendas no PDV e receber pagamentos, abra um novo turno de caixa.
                  </p>
                  <Button
                    onClick={() => setIsOpenModalActive(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Abrir Caixa Agora
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE ABERTURAS E FECHAMENTOS */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <Card className="border shadow-xs">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por operador, observação..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div>
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="all">Todos os Turnos</option>
                    <option value="open">Apenas Abertos</option>
                    <option value="closed">Apenas Fechados</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Abertura</th>
                    <th className="px-4 py-3">Fechamento</th>
                    <th className="px-4 py-3">Operador</th>
                    <th className="px-4 py-3 text-right">Fundo Inicial</th>
                    <th className="px-4 py-3 text-right">Total Vendas</th>
                    <th className="px-4 py-3 text-right">Saldo Final</th>
                    <th className="px-4 py-3 text-right">Diferença</th>
                    <th className="px-4 py-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        Carregando histórico de caixas...
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                        Nenhum registro de turno localizado.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((s) => {
                      const isOpen = s.status === "open";
                      const expected = Number(((s.initial_balance || 0) + (s.total_cash || 0)).toFixed(2));
                      const diff = s.final_balance !== null && s.final_balance !== undefined
                        ? Number((Number(s.final_balance) - expected).toFixed(2))
                        : null;

                      return (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            {isOpen ? (
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Aberto
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Fechado
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="font-semibold block">{formatDateTime(s.opened_at)}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {s.closed_at ? formatDateTime(s.closed_at) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="font-medium text-foreground">{s.opened_by}</span>
                            {s.closed_by && s.closed_by !== s.opened_by && (
                              <span className="text-muted-foreground block text-[10px]">
                                Fechado por: {s.closed_by}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-medium">
                            {formatCurrency(s.initial_balance)}
                          </td>
                          <td className="px-4 py-3 text-xs text-right">
                            <span className="font-bold text-foreground block">
                              {formatCurrency(s.total_sales)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              Espécie: {formatCurrency(s.total_cash)} | PIX: {formatCurrency(s.total_pix)} | Cartão: {formatCurrency(s.total_card)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-semibold">
                            {s.final_balance !== null && s.final_balance !== undefined
                              ? formatCurrency(s.final_balance)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-medium">
                            {diff === null ? (
                              <span className="text-muted-foreground">—</span>
                            ) : diff === 0 ? (
                              <span className="text-emerald-600 font-semibold">Exato (R$ 0)</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600 font-semibold">+{formatCurrency(diff)} (Sobra)</span>
                            ) : (
                              <span className="text-destructive font-semibold">{formatCurrency(diff)} (Falta)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate" title={s.notes || ""}>
                            {s.notes || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ABERTURA DE CAIXA MODAL */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Abertura de Caixa</h3>
                <p className="text-xs text-muted-foreground">Informe o saldo em dinheiro disponível para troco.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Fundo de Troco Inicial (R$):
                </label>
                <Input
                  type="text"
                  value={initialFloat}
                  onChange={(e) => setInitialFloat(e.target.value)}
                  placeholder="200.00"
                  className="h-10 text-base font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Observações (Opcional):
                </label>
                <Input
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  placeholder="Ex: Turno da manhã aberto com notas trocadas"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpenModalActive(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleOpenCash}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Abrindo..." : "Confirmar Abertura"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FECHAMENTO DE CAIXA MODAL */}
      {isCloseModalActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Fechamento de Caixa</h3>
                <p className="text-xs text-muted-foreground">Faça a contagem física do dinheiro na gaveta.</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fundo Inicial:</span>
                <span className="font-semibold">{formatCurrency(session?.initial_balance || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Vendas em Dinheiro:</span>
                <span className="font-semibold text-emerald-600">+{formatCurrency(session?.total_cash || 0)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t font-bold text-foreground">
                <span>Valor Esperado na Gaveta:</span>
                <span className="text-sm">{formatCurrency(expectedCashInDrawer)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Valor Total Contado na Gaveta (R$):
                </label>
                <Input
                  type="text"
                  value={finalCount}
                  onChange={(e) => setFinalCount(e.target.value)}
                  placeholder="0.00"
                  className="h-10 text-base font-bold"
                  autoFocus
                />
              </div>

              {finalCount && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${
                    cashDifference === 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : cashDifference > 0
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <span>
                    {cashDifference === 0
                      ? "Conferência Exata (Sem quebra)"
                      : cashDifference > 0
                      ? "Sobra de Caixa:"
                      : "Falta / Quebra de Caixa:"}
                  </span>
                  <span className="font-bold">{formatCurrency(Math.abs(cashDifference))}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Observações de Fechamento:
                </label>
                <Input
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Ex: Todas as notas conferidas sem pendências"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCloseModalActive(false)}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleCloseCash}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Fechando..." : "Confirmar Fechamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
