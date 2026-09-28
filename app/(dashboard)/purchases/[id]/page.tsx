"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Truck, Calendar, RefreshCw, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { purchaseService } from "@/services/purchase";
import type { PurchaseOrder } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function PurchaseDetailPage({ params }: { params: { id: string } }) {
  const [purchase, setPurchase] = React.useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isReceiving, setIsReceiving] = React.useState(false);

  const loadPurchase = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await purchaseService.getPurchaseById(params.id);
      setPurchase(data);
    } catch {
      toast.error("Erro ao carregar detalhes do pedido.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    loadPurchase();
  }, [loadPurchase]);

  const handleReceive = async () => {
    if (!purchase) return;
    if (!confirm(`Confirmar recebimento das mercadorias do pedido ${purchase.order_number}?`)) return;

    setIsReceiving(true);
    try {
      const res = await purchaseService.markAsReceived(purchase.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Mercadorias recebidas! O estoque e o contas a pagar foram atualizados.");
      await loadPurchase();
    } catch {
      toast.error("Erro ao processar recebimento.");
    } finally {
      setIsReceiving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Carregando pedido de compra...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold">Pedido não encontrado</h2>
        <Button asChild variant="outline">
          <Link href="/purchases">Voltar para Pedidos</Link>
        </Button>
      </div>
    );
  }

  const totalPieces = (purchase.items || []).reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/purchases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Pedido {purchase.order_number}</h1>
              <Badge variant={purchase.status === "received" ? "success" : "warning"}>
                {purchase.status === "received" ? "Mercadorias Recebidas" : "Aguardando Entrega"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Emitido em {formatDateTime(purchase.created_at)}
            </p>
          </div>
        </div>

        {purchase.status === "pending" && (
          <Button onClick={handleReceive} disabled={isReceiving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <PackageCheck className="h-4 w-4" />
            {isReceiving ? "Processando..." : "Confirmar Recebimento de Mercadorias"}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-foreground text-base">{purchase.supplier_name}</p>
            {purchase.expected_delivery && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Previsão de Entrega: {formatDate(purchase.expected_delivery)}
              </p>
            )}
            {purchase.received_at && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Recebido em: {formatDateTime(purchase.received_at)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo Financeiro do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Volume de Peças</span>
              <p className="text-lg font-bold">{totalPieces} unidades</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Custo Total Faturado</span>
              <p className="text-lg font-bold text-primary">{formatCurrency(purchase.total_amount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Itens */}
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Grade de Peças do Pedido</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Peça / Modelo</th>
                <th className="px-4 py-3">SKU Variação</th>
                <th className="px-4 py-3 text-center">Tamanho</th>
                <th className="px-4 py-3">Cor</th>
                <th className="px-4 py-3 text-center">Quantidade</th>
                <th className="px-4 py-3">Custo Unitário</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchase.items?.map((it, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-semibold text-foreground">{it.product_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{it.sku_variant}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="font-bold">{it.size}</Badge>
                  </td>
                  <td className="px-4 py-3">{it.color}</td>
                  <td className="px-4 py-3 text-center font-bold">{it.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(it.unit_cost)}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {formatCurrency(it.total_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
