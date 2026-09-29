"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Receipt, Truck, Calendar, CheckCircle2, Clock, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { purchaseService } from "@/services/purchase";
import type { PurchaseOrder } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PurchasesPage() {
  const [purchases, setPurchases] = React.useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadPurchases = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await purchaseService.getPurchases();
      setPurchases(data);
    } catch {
      toast.error("Erro ao carregar pedidos de compra.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleReceive = async (id: string, orderNumber: string) => {
    if (!confirm(`Confirmar o recebimento das mercadorias do pedido ${orderNumber}?\nIsso atualizará os saldos em estoque e gerará a conta a pagar correspondente.`)) {
      return;
    }

    try {
      const res = await purchaseService.markAsReceived(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Pedido ${orderNumber} recebido! Estoque e financeiro integrados.`);
      await loadPurchases();
    } catch {
      toast.error("Erro ao processar recebimento.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pedidos de Compra</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entrada de mercadorias, pedidos com confecções e reposição de coleção.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadPurchases()} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild className="gap-2">
            <Link href="/purchases/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Novo Pedido de Compra</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Número / Data</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3 text-center">Itens / Peças</th>
                <th className="px-4 py-3">Valor Total</th>
                <th className="px-4 py-3">Previsão Entrega</th>
                <th className="px-4 py-3">Status do Pedido</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando pedidos de compra...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Receipt className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">Nenhum pedido de compra emitido</p>
                    <p className="text-xs mt-1 mb-4">Crie pedidos para controlar a entrada de novas coleções.</p>
                    <Button asChild size="sm">
                      <Link href="/purchases/new">Criar Pedido</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                purchases.map((p) => {
                  const totalPieces = (p.items || []).reduce((acc, it) => acc + it.quantity, 0);

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground font-mono">{p.order_number}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {formatDate(p.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">{p.supplier_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {totalPieces} peças ({p.items?.length || 0} variações)
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {formatCurrency(p.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.expected_delivery ? formatDate(p.expected_delivery) : "Imediata"}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === "received" ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Recebido
                          </Badge>
                        ) : p.status === "pending" ? (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Aguardando
                          </Badge>
                        ) : (
                          <Badge variant="neutral">{p.status}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                              onClick={() => handleReceive(p.id, p.order_number)}
                            >
                              Receber
                            </Button>
                          )}
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/purchases/${p.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
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
  );
}
