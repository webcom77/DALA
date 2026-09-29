"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Truck, Phone, Mail, User, Edit, Trash2, RefreshCw, Tag } from "lucide-react";
import { toast } from "sonner";

import { supplierService } from "@/services/supplier";
import type { Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const loadSuppliers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await supplierService.getSuppliers(search.trim() || undefined);
      setSuppliers(data);
    } catch {
      toast.error("Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o fornecedor "${name}"?`)) return;
    const ok = await supplierService.deleteSupplier(id);
    if (ok) {
      toast.success("Fornecedor removido com sucesso.");
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error("Erro ao excluir fornecedor.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores & Fabricantes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de confecções, tecelagens e distribuidores de vestuário.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadSuppliers()} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild className="gap-2">
            <Link href="/suppliers/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Novo Fornecedor</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome fantasia, razão social, CNPJ ou linha de produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Linha / Categoria</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Contato & Responsável</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando fornecedores...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                        <Truck className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">Nenhum fornecedor cadastrado</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Cadastre confecções para gerenciar pedidos de compra e reposição.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/suppliers/new">Cadastrar Fornecedor</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{s.trade_name}</span>
                        <span className="text-xs text-muted-foreground">{s.corporate_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral" className="text-xs font-normal">
                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                        {s.category || "Geral"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {s.cnpj || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {s.contact_person && (
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <User className="h-3 w-3 text-primary" />
                            {s.contact_person}
                          </span>
                        )}
                        {s.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {s.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.address?.city ? `${s.address.city} - ${s.address.state || ""}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.active ? "success" : "neutral"}>
                        {s.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/suppliers/${s.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id, s.trade_name)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
