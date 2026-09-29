"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  ShoppingBag,
  Edit,
  Trash2,
  RefreshCw,
  Receipt,
  AlertTriangle,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { customerService } from "@/services/customer";
import type { Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type DebtFilter = "all" | "with_debt" | "overdue" | "no_debt";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<DebtFilter>("all");
  const [loading, setLoading] = React.useState(true);

  const loadCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers(search.trim() || undefined, filter);
      setCustomers(data);
    } catch {
      toast.error("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

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

  const handleQuickWhatsApp = (customer: Customer) => {
    const phone = (customer.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.warning("Cliente não possui telefone cadastrado.");
      return;
    }

    const firstName = customer.name.split(" ")[0];
    const totalDebt = customer.total_debt || 0;
    const overdueDebt = customer.overdue_debt || 0;

    const overdueText =
      overdueDebt > 0
        ? `Você possui um valor em aberto de ${formatCurrency(totalDebt)} (com parcela em atraso de ${formatCurrency(overdueDebt)}).`
        : `Você possui um saldo em notinhas de ${formatCurrency(totalDebt)}.`;

    const msg = encodeURIComponent(
      `Olá, ${firstName}! Tudo bem? Esperamos que esteja tudo ótimo por aí! 🌸\n\nPassando com carinho da DALA Boutique para enviar o resumo das suas notinhas:\n${overdueText}\n\nPara facilitar, aceitamos pagamento via PIX. Qualquer dúvida estamos à total disposição!`
    );

    const waPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${waPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 selection:bg-brand-100 selection:text-brand-800">
      {/* 1. CABEÇALHO DA TELA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EFE5E9] dark:border-border/60">
        <div>
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 text-xs uppercase tracking-[0.2em] font-medium mb-1">
            <span>Cadastros &amp; Relacionamento</span>
            <span className="w-1 h-1 rounded-full bg-brand-400"></span>
            <span>Clientes &amp; VIPs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-normal text-luxury-title dark:text-foreground font-sans tracking-tight">
            Clientes &amp; Fidelidade
          </h1>
          <p className="text-xs text-luxury-muted mt-0.5">
            Gestão de cadastro, histórico de compras, limite de crédito e carnê de notinhas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadCustomers()}
            className="rounded-full h-9 w-9 border-[#EFE5E9] text-luxury-muted hover:text-brand-800"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button asChild className="rounded-full bg-brand-700 hover:bg-brand-800 text-white text-xs font-medium px-4 shadow-sm gap-1.5">
            <Link href="/customers/new">
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. FILTROS RÁPIDOS (Pills) & BARRA DE BUSCA */}
      <div className="space-y-3">
        {/* Pills de Filtro de Notinhas / Dívidas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "Todas as Clientes" },
            { id: "with_debt", label: "Com Débito em Aberto" },
            { id: "overdue", label: "Em Atraso (Cobrança)" },
            { id: "no_debt", label: "Sem Débitos" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as DebtFilter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filter === item.id
                  ? "bg-brand-700 text-white shadow-pill"
                  : "bg-white dark:bg-card border border-[#F0E6EA] dark:border-border/60 text-luxury-body dark:text-muted-foreground hover:bg-brand-50 hover:text-brand-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted" />
              <Input
                placeholder="Buscar por nome da cliente, telefone, CPF ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-full border-0 bg-[#FAF7F8] dark:bg-muted/30 text-xs focus-visible:ring-2 focus-visible:ring-brand-700 text-luxury-title placeholder:text-luxury-muted/70"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. TABELA DE CLIENTES */}
      <Card className="rounded-2xl border-[#F0E6EA] dark:border-border/60 shadow-soft bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F6] dark:bg-muted/40 border-b border-[#F0E6EA] text-luxury-muted font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Contato</th>
                <th className="px-4 py-3.5">Total em Compras</th>
                <th className="px-4 py-3.5">Saldo Devedor / Notinhas</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F1F3] dark:divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-luxury-muted">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-700" />
                    Carregando base de clientes...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-luxury-muted">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3 text-brand-700">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-luxury-title">Nenhuma cliente encontrada</p>
                      <p className="text-xs text-luxury-muted mt-1 mb-4">
                        Tente ajustar os termos de busca ou filtros de débito.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const totalDebt = c.total_debt || 0;
                  const overdueDebt = c.overdue_debt || 0;
                  const hasOverdue = overdueDebt > 0;
                  const hasDebt = totalDebt > 0;

                  return (
                    <tr key={c.id} className="hover:bg-brand-50/30 transition-colors group">
                      {/* Cliente (Nome + Cidade) */}
                      <td className="px-4 py-3.5">
                        <Link href={`/customers/${c.id}`} className="flex items-center gap-3 group-hover:underline">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 via-rose-100 to-amber-50 border border-brand-200 flex items-center justify-center text-brand-800 font-bold text-xs shadow-xs shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-luxury-title dark:text-foreground block">
                              {c.name}
                            </span>
                            {c.cpf_cnpj ? (
                              <span className="text-[10px] font-mono text-luxury-muted block">
                                CPF: {c.cpf_cnpj}
                              </span>
                            ) : null}
                          </div>
                        </Link>
                      </td>

                      {/* Contato (Telefone + Email) */}
                      <td className="px-4 py-3.5 text-luxury-body">
                        {c.phone && (
                          <div className="flex items-center gap-1.5 font-mono text-luxury-title font-medium">
                            <Phone className="w-3 h-3 text-brand-700" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-luxury-muted text-[11px] truncate max-w-[160px]">
                            <Mail className="w-3 h-3" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Total em Compras */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-luxury-title font-mono">
                          {formatCurrency(c.total_spent)}
                        </div>
                        <span className="text-[10px] text-luxury-muted">
                          {c.orders_count} {c.orders_count === 1 ? "compra" : "compras"}
                        </span>
                      </td>

                      {/* Saldo Devedor / Notinhas (NOVA COLUNA) */}
                      <td className="px-4 py-3.5">
                        {hasOverdue ? (
                          <div>
                            <Badge variant="destructive" className="rounded-full text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              {formatCurrency(totalDebt)}
                            </Badge>
                            <span className="text-[10px] text-destructive font-medium block mt-0.5">
                              {formatCurrency(overdueDebt)} em atraso!
                            </span>
                          </div>
                        ) : hasDebt ? (
                          <div>
                            <Badge className="bg-amber-50 text-amber-800 hover:bg-amber-50 border-amber-200 rounded-full text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-700" />
                              {formatCurrency(totalDebt)}
                            </Badge>
                            <span className="text-[10px] text-luxury-muted block mt-0.5">
                              Parcela(s) a vencer
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sem débitos
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge variant={c.active ? "success" : "neutral"} className="rounded-full text-[10px]">
                          {c.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botão de WhatsApp se tiver dívida */}
                          {hasDebt && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuickWhatsApp(c)}
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
                              title="Cobrar via WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Ver Ficha / Extrato */}
                          <Button asChild size="sm" variant="outline" className="rounded-full h-7 text-[11px] px-2.5 border-[#EFE5E9] hover:bg-brand-50 text-brand-800">
                            <Link href={`/customers/${c.id}`}>
                              <span>Ver Ficha</span>
                              <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Link>
                          </Button>

                          {/* Editar */}
                          <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-luxury-muted hover:text-luxury-title rounded-full">
                            <Link href={`/customers/${c.id}/edit`}>
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          </Button>

                          {/* Excluir */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="h-7 w-7 text-luxury-muted hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
