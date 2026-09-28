"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Shirt,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { productService } from "@/services/product";
import type { Category, Product } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filtros
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const activeFilter =
        selectedStatus === "all" ? undefined : selectedStatus === "active";

      const [prods, cats] = await Promise.all([
        productService.getProducts({
          search: search.trim() || undefined,
          categoryId: selectedCategory === "all" ? undefined : selectedCategory,
          active: activeFilter,
        }),
        productService.getCategories(),
      ]);

      setProducts(prods);
      setCategories(cats);
    } catch {
      toast.error("Não foi possível carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedStatus]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${name}"?`)) return;

    try {
      const ok = await productService.deleteProduct(id);
      if (ok) {
        toast.success(`Produto "${name}" excluído com sucesso.`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Erro ao excluir o produto.");
      }
    } catch {
      toast.error("Falha ao se comunicar com o servidor.");
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const nextActive = !product.active;
      const res = await productService.updateProduct(product.id, {
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        description: product.description,
        active: nextActive,
        variants: (product.variants || []).map((v) => ({
          size: v.size,
          color: v.color,
          sku_variant: v.sku_variant,
          barcode: v.barcode,
          active: v.active,
        })),
      });

      if (res.product) {
        toast.success(
          `Produto ${nextActive ? "ativado" : "inativado"} com sucesso.`
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? res.product! : p))
        );
      }
    } catch {
      toast.error("Erro ao alterar o status do produto.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerenciamento de peças, categorias e variações de grade (tamanhos e cores).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData()}
            title="Atualizar lista"
            aria-label="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button asChild className="gap-2">
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Campo de Pesquisa */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, referência ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por Categoria */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all" className="bg-background text-foreground">
                  Todas as Categorias
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-background text-foreground">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all" className="bg-background text-foreground">
                  Todos os Status
                </option>
                <option value="active" className="bg-background text-foreground">
                  Apenas Ativos
                </option>
                <option value="inactive" className="bg-background text-foreground">
                  Apenas Inativos
                </option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista / Tabela de Produtos */}
      <Card className="shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Peça / Referência</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço Venda</th>
                <th className="px-4 py-3">Preço Custo</th>
                <th className="px-4 py-3">Grade & Variações</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando catálogo de produtos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                        <Shirt className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">Nenhum produto encontrado</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Nenhum item corresponde aos filtros selecionados ou ainda não há peças cadastradas.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/products/new">Cadastrar Produto</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const variants = product.variants || [];
                  const distinctSizes = Array.from(new Set(variants.map((v) => v.size)));
                  const distinctColors = Array.from(new Set(variants.map((v) => v.color)));

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Peça e SKU */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">
                            REF: {product.sku}
                          </span>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <Badge variant="neutral" className="text-xs font-normal">
                          <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                          {product.category?.name || "Sem categoria"}
                        </Badge>
                      </td>

                      {/* Preço de Venda */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatCurrency(product.sale_price)}
                      </td>

                      {/* Preço de Custo */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatCurrency(product.cost_price)}
                      </td>

                      {/* Grade e Variações */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[11px] h-5">
                              {variants.length}{" "}
                              {variants.length === 1 ? "variação" : "variações"}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate" title={`Tamanhos: ${distinctSizes.join(", ")} | Cores: ${distinctColors.join(", ")}`}>
                            <span>Tam: {distinctSizes.join(", ") || "-"}</span>
                            <span className="mx-1">•</span>
                            <span>Cores: {distinctColors.join(", ") || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className="focus:outline-none"
                          title="Clique para alternar status"
                        >
                          {product.active ? (
                            <Badge variant="success" className="cursor-pointer">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="cursor-pointer">
                              Inativo
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Editar produto e grade"
                          >
                            <Link href={`/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Excluir produto"
                          >
                            <Trash2 className="h-4 w-4" />
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
