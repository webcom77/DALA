"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Users, Phone, Mail, ShoppingBag, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { customerService } from "@/services/customer";
import type { Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers(search.trim() || undefined);
      setCustomers(data);
    } catch {
      toast.error("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o cadastro de "${name}"?`)) return;
    const ok = await customerService.deleteCustomer(id);
    if (ok) {
      toast.success("Cliente removido com sucesso.");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error("Erro ao excluir cliente.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de cadastro, contatos e histórico de compras dos clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadCustomers()} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild className="gap-2">
            <Link href="/customers/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Novo Cliente</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, CPF ou e-mail..."
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
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">CPF / Documento</th>
                <th className="px-4 py-3">Total em Compras</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando clientes...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">Nenhum cliente cadastrado</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Cadastre clientes para vincular vendas no PDV e acompanhar fidelidade.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/customers/new">Cadastrar Cliente</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{c.name}</span>
                        {c.address?.city && c.address?.state && (
                          <span className="text-xs text-muted-foreground">
                            {c.address.city} - {c.address.state}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {c.phone && (
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <Phone className="h-3 w-3 text-primary" />
                            {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.cpf_cnpj || "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        {c.orders_count}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.active ? "success" : "neutral"}>
                        {c.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/customers/${c.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id, c.name)}
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
