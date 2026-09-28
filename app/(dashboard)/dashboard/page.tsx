"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  ShoppingBag,
  DollarSign,
  Shirt,
  Boxes,
  ShieldCheck,
  Server,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS } from "@/types";
import { formatDateLong, formatTime } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const userName = profile?.full_name || "Usuário";
  const userRole = profile?.role || "admin";
  const roleLabel = USER_ROLE_LABELS[userRole] || userRole;

  // Cards de métricas futuras (estritamente marcados como não implementados, sem números falsos)
  const placeholderMetrics = [
    {
      title: "Vendas do Dia (PDV)",
      module: "Módulo ainda não implementado",
      description: "Total de vendas e cupons fiscais emitidos no turno atual.",
      icon: ShoppingBag,
    },
    {
      title: "Faturamento Mensal",
      module: "Módulo ainda não implementado",
      description: "Consolidação de receitas e despesas da competência.",
      icon: DollarSign,
    },
    {
      title: "Catálogo de Produtos",
      module: "Módulo Ativo",
      description: "Controle de peças, matriz de grade (tamanhos e cores) e preços.",
      icon: Shirt,
      href: "/products",
      active: true,
    },
    {
      title: "Posição de Estoque",
      module: "Módulo ainda não implementado",
      description: "Alertas de peças em ponto de pedido e reposição.",
      icon: Boxes,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho de Boas-Vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isLoading ? "Carregando..." : `Bem-vindo(a), ${userName}`}
            </h1>
            <Badge variant="default" className="text-xs capitalize">
              {roleLabel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="capitalize">
              {currentDate ? formatDateLong(currentDate) : "Carregando data..."}
            </span>
            {currentDate && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(currentDate)}</span>
              </>
            )}
          </p>
        </div>

        {/* Status rápido do sistema */}
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 text-xs shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Fundação Ativa</span>
            <span className="text-muted-foreground">Arquitetura v0.1.0</span>
          </div>
        </div>
      </div>

      {/* Seção de Métricas Futuras (Cards sem números inventados) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Painel de Operações</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral dos módulos planejados para a gestão da loja.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {placeholderMetrics.map((metric) => {
            const Icon = metric.icon;
            const content = (
              <Card
                className={`transition-all ${
                  metric.active
                    ? "border-primary/40 bg-card shadow-sm hover:border-primary cursor-pointer hover:shadow-md"
                    : "border-dashed bg-card/60 hover:bg-card shadow-none"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.active ? "text-primary" : "text-muted-foreground/70"}`} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="py-2">
                    <Badge
                      variant={metric.active ? "success" : "neutral"}
                      className="text-[11px] font-normal"
                    >
                      {metric.module}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            );

            if (metric.href) {
              return (
                <Link key={metric.title} href={metric.href} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={metric.title}>{content}</div>;
          })}
        </div>
      </div>

      {/* Informações da Fundação Técnica do Sistema */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Status do Sistema e Conectividade</CardTitle>
            </div>
            <CardDescription>
              Diagnóstico dos serviços integrados nesta etapa de fundação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Ambiente de Execução</span>
              <span className="font-medium">Next.js App Router (SSR)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Banco de Dados</span>
              <span className="font-medium flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                PostgreSQL (Supabase)
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Autenticação & Sessão</span>
              <span className="font-medium flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Supabase Auth + Cookies SSR
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Fuso Horário Oficial</span>
              <span className="font-medium">America/Sao_Paulo (pt-BR)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Módulos da Fundação Técnica</CardTitle>
            </div>
            <CardDescription>
              Status de implementação por componente nesta primeira etapa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Arquitetura & Layout SaaS</span>
              <Badge variant="success">Concluído</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Autenticação & Recuperação de Senha</span>
              <Badge variant="success">Concluído</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Proteção de Rotas com Middleware</span>
              <Badge variant="success">Concluído</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Configurações Gerais da Loja</span>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Catálogo de Produtos & Grade</span>
              <Badge variant="success">Concluído</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
