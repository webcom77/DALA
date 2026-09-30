"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Truck, Receipt, Calendar } from "lucide-react";
import { toast } from "sonner";

import { supplierService } from "@/services/supplier";
import { productService } from "@/services/product";
import { purchaseService } from "@/services/purchase";
import type { Supplier, Product } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface OrderItemRow {
  product_id: string;
  variant_id: string;
  product_name: string;
  sku_variant: string;
  size: string;
  color: string;
  quantity: number;
  unit_cost: number;
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Formulário
  const [supplierId, setSupplierId] = React.useState("");
  const [expectedDelivery, setExpectedDelivery] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<OrderItemRow[]>([]);

  // Linha temporária de adição
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [selectedVariantId, setSelectedVariantId] = React.useState("");
  const [addQuantity, setAddQuantity] = React.useState(10);
  const [addCost, setAddCost] = React.useState(0);

  React.useEffect(() => {
    Promise.all([supplierService.getSuppliers(), productService.getProducts()]).then(([supps, prods]) => {
      setSuppliers(supps);
      setProducts(prods);
      if (supps.length > 0) setSupplierId(supps[0].id);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
        if (prods[0].variants && prods[0].variants.length > 0) {
          setSelectedVariantId(prods[0].variants[0].id);
          setAddCost(prods[0].cost_price);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.variants && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
      setAddCost(prod.cost_price);
    }
  };

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    const variant = prod.variants?.find((v) => v.id === selectedVariantId);
    if (!variant) {
      toast.error("Selecione uma variação de tamanho e cor.");
      return;
    }

    if (addQuantity <= 0 || addCost <= 0) {
      toast.error("Informe quantidade e custo unitário válidos.");
      return;
    }

    const existingIdx = items.findIndex((it) => it.variant_id === variant.id);
    if (existingIdx >= 0) {
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === existingIdx
            ? { ...it, quantity: it.quantity + addQuantity, unit_cost: addCost }
            : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          product_id: prod.id,
          variant_id: variant.id,
          product_name: prod.name,
          sku_variant: variant.sku_variant,
          size: variant.size,
          color: variant.color,
          quantity: addQuantity,
          unit_cost: addCost,
        },
      ]);
    }

    toast.success(`Adicionado: ${prod.name} (${variant.size} • ${variant.color})`);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalOrder = items.reduce((acc, it) => acc + it.quantity * it.unit_cost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Selecione um fornecedor.");
      return;
    }

    if (items.length === 0) {
      toast.error("Adicione pelo menos um item ao pedido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await purchaseService.createPurchase({
        supplier_id: supplierId,
        expected_delivery: expectedDelivery || undefined,
        notes: notes || undefined,
        items: items.map((it) => ({
          ...it,
          total_cost: it.quantity * it.unit_cost,
        })),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Pedido de compra criado com sucesso!");
      router.push("/purchases");
      router.refresh();
    } catch {
      toast.error("Erro ao emitir pedido de compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSelectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/purchases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Pedido de Compra</h1>
            <p className="text-xs text-muted-foreground">
              Emita pedidos de reposição para confecções e registre novas entradas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/purchases">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || items.length === 0} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Emitindo..." : "Salvar Pedido de Compra"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Dados do Fornecedor */}
        <Card className="shadow-sm border md:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Fornecedor & Prazos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor / Confecção *</Label>
              <select
                id="supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trade_name} ({s.category || "Geral"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery">Previsão de Entrega</Label>
              <Input
                id="delivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações do Pedido</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Ex: Entrega fracionada em caixas identificadas..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Adicionar Itens ao Pedido */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Adicionar Peças à Grade do Pedido</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Modelo / Peça</Label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (EAN: {p.ean13 || p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Variação (Tam • Cor)</Label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  >
                    {currentSelectedProduct?.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        Tam: {v.size} • Cor: {v.color} (EAN: {v.barcode || v.sku_variant})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(parseInt(e.target.value) || 0)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Custo Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={addCost}
                    onChange={(e) => setAddCost(parseFloat(e.target.value) || 0)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <Button type="button" onClick={handleAddItem} className="w-full gap-2 h-9 text-xs">
                    <Plus className="h-4 w-4" />
                    Inserir no Pedido
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Itens do Pedido */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Peças Selecionadas no Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Peça</th>
                      <th className="px-3 py-2">Tamanho</th>
                      <th className="px-3 py-2">Cor</th>
                      <th className="px-3 py-2 text-center">Quantidade</th>
                      <th className="px-3 py-2">Custo Unit.</th>
                      <th className="px-3 py-2">Subtotal</th>
                      <th className="px-3 py-2 text-right">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum item adicionado ao pedido. Selecione acima para incluir peças.
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {it.product_name}
                            <div className="font-mono text-[10px] text-muted-foreground">EAN: {it.sku_variant}</div>
                          </td>
                          <td className="px-3 py-2 font-bold">{it.size}</td>
                          <td className="px-3 py-2">{it.color}</td>
                          <td className="px-3 py-2 text-center font-bold text-base">{it.quantity}</td>
                          <td className="px-3 py-2">{formatCurrency(it.unit_cost)}</td>
                          <td className="px-3 py-2 font-bold text-foreground">
                            {formatCurrency(it.quantity * it.unit_cost)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(idx)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t py-4 text-sm font-semibold">
              <span>Total de Peças: {items.reduce((acc, it) => acc + it.quantity, 0)}</span>
              <span className="text-lg text-primary">Valor Total: {formatCurrency(totalOrder)}</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
