"use client";

import * as React from "react";
import {
  Boxes,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { inventoryService } from "@/services/inventory";
import type { StockLevel, StockMovement } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  const [stockLevels, setStockLevels] = React.useState<StockLevel[]>([]);
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [activeTab, setActiveTab] = React.useState<"levels" | "movements">("levels");
  const [loading, setLoading] = React.useState(true);

  // Filtros
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Modal de movimentação manual
  const [selectedVariant, setSelectedVariant] = React.useState<StockLevel | null>(null);
  const [movementType, setMovementType] = React.useState<"entry" | "exit" | "adjustment">("entry");
  const [movementQty, setMovementQty] = React.useState(1);
  const [movementReason, setMovementReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [levels, movs] = await Promise.all([
        inventoryService.getStockLevels({
          search: search.trim() || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        }),
        inventoryService.getMovements(),
      ]);
      setStockLevels(levels);
      setMovements(movs);
    } catch {
      toast.error("Erro ao carregar dados de estoque.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenMovementModal = (variant: StockLevel) => {
    setSelectedVariant(variant);
    setMovementType("entry");
    setMovementQty(1);
    setMovementReason("Entrada manual de reposição");
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    if (movementQty <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    if (!movementReason.trim()) {
      toast.error("Informe o motivo da movimentação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await inventoryService.recordMovement({
        variant_id: selectedVariant.variant_id,
        type: movementType,
        quantity: movementQty,
        reason: movementReason.trim(),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Estoque atualizado com sucesso!");
      setSelectedVariant(null);
      await loadData();
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos de resumo
  const totalPieces = stockLevels.reduce((acc, it) => acc + it.current_stock, 0);
  const totalCostValue = stockLevels.reduce((acc, it) => acc + it.current_stock * it.cost_price, 0);
  const totalSaleValue = stockLevels.reduce((acc, it) => acc + it.current_stock * it.sale_price, 0);
  const outOfStockCount = stockLevels.filter((it) => it.current_stock === 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saldos físicos por peça, tamanho e cor, e histórico de movimentações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadData()} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("levels")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === "levels" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Posição Atual
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === "movements" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total de Peças Físicas</CardDescription>
            <CardTitle className="text-2xl font-bold">{totalPieces} un</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Distribuídas em estoque</CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Custo Imobilizado</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{formatCurrency(totalCostValue)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Valor pago aos fornecedores</CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Valor Potencial de Venda</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalSaleValue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Preço de etiqueta em estoque</CardContent>
        </Card>

        <Card className={`shadow-sm ${outOfStockCount > 0 ? "border-rose-500/40 bg-rose-500/5" : ""}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
              Itens Esgotados
            </CardDescription>
            <CardTitle className={`text-2xl font-bold ${outOfStockCount > 0 ? "text-rose-600 dark:text-rose-400" : ""}`}>
              {outOfStockCount} {outOfStockCount === 1 ? "peça" : "peças"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Saldo zerado no catálogo</CardContent>
        </Card>
      </div>

      {/* Aba 1: Posição de Estoque por Grade */}
      {activeTab === "levels" && (
        <div className="space-y-4">
          <Card className="shadow-sm border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar peça, cor, tamanho ou código EAN-13..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="all">Todos os Produtos</option>
                    <option value="normal">Em Estoque (&gt; 0)</option>
                    <option value="out_of_stock">Esgotado (Zero)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Peça / Modelo</th>
                    <th className="px-4 py-3">Código EAN-13</th>
                    <th className="px-4 py-3 text-center">Tamanho</th>
                    <th className="px-4 py-3">Cor</th>
                    <th className="px-4 py-3 text-center">Saldo Atual</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                        Carregando estoque...
                      </td>
                    </tr>
                  ) : stockLevels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        Nenhum item localizado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    stockLevels.map((it) => (
                      <tr key={it.variant_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground">{it.product_name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {it.sku_variant}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="font-bold">
                            {it.size}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {it.color}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-base font-bold ${
                              it.current_stock === 0
                                ? "text-destructive"
                                : "text-foreground"
                            }`}
                          >
                            {it.current_stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {it.current_stock > 0 ? (
                            <Badge variant="success">Em Estoque</Badge>
                          ) : (
                            <Badge variant="destructive">Esgotado</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleOpenMovementModal(it)}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Ajustar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Aba 2: Histórico de Movimentações */}
      {activeTab === "movements" && (
        <Card className="shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Peça & Variação</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-center">Quantidade</th>
                  <th className="px-4 py-3 text-center">Anterior &rarr; Novo</th>
                  <th className="px-4 py-3">Motivo / Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhuma movimentação registrada até o momento.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(m.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{m.product_name}</span>
                          <span className="text-xs text-muted-foreground">
                            Tam {m.size} • {m.color} • EAN: {m.sku_variant}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.type === "entry" || m.type === "purchase" ? (
                          <Badge variant="success" className="gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Entrada
                          </Badge>
                        ) : m.type === "sale" ? (
                          <Badge variant="secondary" className="gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            Venda PDV
                          </Badge>
                        ) : m.type === "exit" ? (
                          <Badge variant="destructive" className="gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            Saída
                          </Badge>
                        ) : (
                          <Badge variant="neutral">Ajuste</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {m.type === "exit" || m.type === "sale" ? `-${m.quantity}` : `+${m.quantity}`}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                        {m.previous_stock} &rarr; {m.new_stock}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {m.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal / Diálogo de Movimentação Manual */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg">Ajuste de Estoque</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedVariant.product_name} • Tam: {selectedVariant.size} • Cor: {selectedVariant.color}
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Atual: {selectedVariant.current_stock} un
              </Badge>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="movType">Tipo de Movimentação</Label>
                <select
                  id="movType"
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="entry">Entrada (Adicionar peças ao saldo)</option>
                  <option value="exit">Saída (Subtrair peças por avaria / perda)</option>
                  <option value="adjustment">Inventário (Substituir pelo saldo contado)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">
                  {movementType === "adjustment" ? "Novo Saldo Contado" : "Quantidade de Peças"}
                </Label>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  value={movementQty}
                  onChange={(e) => setMovementQty(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo do Ajuste</Label>
                <Input
                  id="reason"
                  placeholder="Ex: Contagem física de prateleira / Reposição rápida"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedVariant(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Gravando..." : "Confirmar Movimentação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
