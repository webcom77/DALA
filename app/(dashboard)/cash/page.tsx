"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  Lock,
  Unlock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShoppingBag,
  RotateCcw,
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
  const [loading, setLoading] = React.useState(true);

  // Open modal
  const [isOpenModalActive, setIsOpenModalActive] = React.useState(false);
  const [initialFloat, setInitialFloat] = React.useState("200.00");
  const [openNotes, setOpenNotes] = React.useState("");

  // Close modal
  const [isCloseModalActive, setIsCloseModalActive] = React.useState(false);
  const [finalCount, setFinalCount] = React.useState("");
  const [closeNotes, setCloseNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadSession = React.useCallback(async () => {
    setLoading(true);
    try {
      const sess = await posService.getActiveSession();
      setSession(sess);
    } catch {
      toast.error("Erro ao carregar sessão do caixa.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSession();
  }, [loadSession]);

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
        setSession(res.session);
        setIsCloseModalActive(false);
        setFinalCount("");
        setCloseNotes("");
        toast.success("Caixa fechado com sucesso!");
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Controle de Caixa</h1>
            <Badge
              variant={isSessionOpen ? "secondary" : "outline"}
              className={
                isSessionOpen
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }
            >
              {isSessionOpen ? "Turno Aberto" : "Caixa Fechado"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciamento de turnos, sangrias, suprimentos e conferência de valores do PDV.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Status & Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Active Session Overview */}
          {session ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium text-gray-500 flex items-center justify-between">
                    <span>Fundo de Caixa (Abertura)</span>
                    <Banknote className="w-4 h-4 text-gray-400" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-gray-900">
                    {formatCurrency(session.initial_balance)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    Iniciado às {formatDateTime(session.opened_at)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium text-gray-500 flex items-center justify-between">
                    <span>Total em Dinheiro (Espécie)</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-emerald-600">
                    {formatCurrency(session.total_cash)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    Na gaveta: <strong>{formatCurrency(expectedCashInDrawer)}</strong>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium text-gray-500 flex items-center justify-between">
                    <span>Vendas no PIX</span>
                    <QrCode className="w-4 h-4 text-teal-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-teal-700">
                    {formatCurrency(session.total_pix)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">Entrada direta em conta bancária</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-medium text-gray-500 flex items-center justify-between">
                    <span>Vendas em Cartão (TEF)</span>
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-black text-indigo-700">
                    {formatCurrency(session.total_card)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">Crédito e Débito processados</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center bg-gray-50 border-gray-200">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 text-base">Nenhum caixa aberto no momento</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Para começar a registrar vendas no balcão e receber pagamentos, abra um novo turno de caixa.
              </p>
              <Button
                onClick={() => setIsOpenModalActive(true)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Abrir Caixa Agora
              </Button>
            </Card>
          )}

          {/* Session Details Card */}
          {session && (
            <Card className="border-gray-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-700" />
                  Resumo do Turno Atual
                </CardTitle>
                <CardDescription>
                  Identificação do operador e somatório das movimentações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Operador Responsável:</span>
                    <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {session.opened_by}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Aberto em:</span>
                    <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateTime(session.opened_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Faturamento Total do Turno:</span>
                    <p className="text-sm font-black text-gray-950 mt-0.5">
                      {formatCurrency(session.total_sales)}
                    </p>
                  </div>
                </div>

                {session.notes && (
                  <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                    <strong className="text-gray-700">Observações: </strong>
                    {session.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ABERTURA DE CAIXA MODAL */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Abertura de Caixa</h3>
                <p className="text-xs text-gray-500">Informe o saldo em dinheiro disponível para troco.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
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
                <label className="text-xs font-semibold text-gray-700 block mb-1">
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

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Fechamento de Caixa</h3>
                <p className="text-xs text-gray-500">Conferência dos valores apurados na gaveta.</p>
              </div>
            </div>

            {/* Expected Summary */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Fundo Inicial:</span>
                <span>{formatCurrency(session?.initial_balance || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Vendas em Espécie (Dinheiro):</span>
                <span>+ {formatCurrency(session?.total_cash || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Saldo Esperado em Gaveta:</span>
                <span>{formatCurrency(expectedCashInDrawer)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Valor Contado Fisicamente (R$):
                </label>
                <Input
                  type="text"
                  value={finalCount}
                  onChange={(e) => setFinalCount(e.target.value)}
                  placeholder={expectedCashInDrawer.toFixed(2)}
                  className="h-10 text-base font-bold"
                  autoFocus
                />
              </div>

              {/* Difference Preview */}
              {finalCount && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                    cashDifference === 0
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : cashDifference > 0
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-red-50 text-red-800 border border-red-200"
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
                <label className="text-xs font-semibold text-gray-700 block mb-1">
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

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
