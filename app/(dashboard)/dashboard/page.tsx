"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  WalletCards,
  Boxes,
  Shirt,
  Users,
  Truck,
  ClipboardList,
  CircleDollarSign,
  BarChart3,
  Settings,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Command,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS } from "@/types";
import { formatDateLong, formatTime } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ModuleCard, type ModuleAccent } from "@/components/dashboard/module-card";

interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  accent: ModuleAccent;
  shortcut: string;
  status: "active" | "development";
}

interface ModuleSection {
  title: string;
  description: string;
  modules: ModuleDefinition[];
}

const moduleSections: ModuleSection[] = [
  {
    title: "Operacional & Vendas",
    description: "Atendimento no balcão, caixa e movimentações de mercadorias",
    modules: [
      {
        id: "pos",
        title: "PDV Balcão",
        description: "Vendas rápidas, leitor de código de barras e emissão de comprovantes.",
        icon: Store,
        href: "/pos",
        accent: "emerald",
        shortcut: "F2",
        status: "active",
      },
      {
        id: "cash",
        title: "Movimento de Caixa",
        description: "Abertura de turno, suprimentos, sangrias e conferência de valores.",
        icon: WalletCards,
        href: "/cash",
        accent: "blue",
        shortcut: "F3",
        status: "active",
      },
      {
        id: "inventory",
        title: "Controle de Estoque",
        description: "Grade por tamanho/cor, saldos físicos e histórico de movimentações.",
        icon: Boxes,
        href: "/inventory",
        accent: "amber",
        shortcut: "F4",
        status: "active",
      },
    ],
  },
  {
    title: "Cadastros",
    description: "Gestão dos registros fundamentais da loja física",
    modules: [
      {
        id: "products",
        title: "Catálogo de Peças",
        description: "Cadastro de roupas, precificação, matriz de grade e referências.",
        icon: Shirt,
        href: "/products",
        accent: "indigo",
        shortcut: "F5",
        status: "active",
      },
      {
        id: "customers",
        title: "Clientes",
        description: "Base de consumidores, histórico de compras, fidelidade e contatos.",
        icon: Users,
        href: "/customers",
        accent: "purple",
        shortcut: "F6",
        status: "active",
      },
      {
        id: "suppliers",
        title: "Fornecedores",
        description: "Fábricas de confecção, tecelagens, prazos de entrega e contatos.",
        icon: Truck,
        href: "/suppliers",
        accent: "teal",
        shortcut: "F7",
        status: "active",
      },
    ],
  },
  {
    title: "Gestão & Estratégia",
    description: "Compras industriais, saúde financeira e relatórios de inteligência",
    modules: [
      {
        id: "purchases",
        title: "Pedidos de Compra",
        description: "Emissão de pedidos fabris, reposição de estoque e recebimento.",
        icon: ClipboardList,
        href: "/purchases",
        accent: "rose",
        shortcut: "F8",
        status: "active",
      },
      {
        id: "finance",
        title: "Financeiro",
        description: "Contas a pagar, contas a receber, liquidações e fluxo de caixa.",
        icon: CircleDollarSign,
        href: "/finance",
        accent: "emerald",
        shortcut: "F9",
        status: "active",
      },
      {
        id: "reports",
        title: "Relatórios & DRE",
        description: "Demonstrativo do resultado, desempenho de vendas e curva ABC de peças.",
        icon: BarChart3,
        href: "/reports",
        accent: "indigo",
        shortcut: "F10",
        status: "active",
      },
    ],
  },
  {
    title: "Sistema",
    description: "Configurações gerais e segurança",
    modules: [
      {
        id: "settings",
        title: "Configurações",
        description: "Parâmetros gerais da boutique, usuários, tributação e preferências.",
        icon: Settings,
        href: "/settings",
        accent: "slate",
        shortcut: "F11",
        status: "active",
      },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Relógio do sistema
  React.useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Atalhos de teclado no estilo ERP Desktop (F2 a F11)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const allModules = moduleSections.flatMap((s) => s.modules);
      const matched = allModules.find((m) => m.shortcut.toUpperCase() === e.key.toUpperCase());
      if (matched && matched.status === "active") {
        e.preventDefault();
        router.push(matched.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const userName = profile?.full_name || "Operador";
  const userRole = profile?.role || "admin";
  const roleLabel = USER_ROLE_LABELS[userRole] || userRole;

  // Filtragem rápida de módulos se o usuário digitar na busca
  const filteredSections = React.useMemo(() => {
    if (!searchTerm.trim()) return moduleSections;
    const term = searchTerm.toLowerCase().trim();

    return moduleSections
      .map((section) => ({
        ...section,
        modules: section.modules.filter(
          (m) =>
            m.title.toLowerCase().includes(term) ||
            m.description.toLowerCase().includes(term) ||
            m.shortcut.toLowerCase().includes(term)
        ),
      }))
      .filter((section) => section.modules.length > 0);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Cabeçalho Superior: Título Principal & Faixa de Boas-Vindas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Menu Operacional
            </span>
            <Badge variant="outline" className="text-[11px] capitalize font-medium">
              {roleLabel}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Central de Módulos
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Acesse rapidamente as principais funções do sistema.
          </p>
        </div>

        {/* Data, Horário e Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Localizar módulo..."
              className="pl-8 h-9 text-xs bg-card border-border/70 focus:bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-semibold"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/70 px-3 py-2 rounded-xl shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize">
              {currentDate ? formatDateLong(currentDate) : "Carregando..."}
            </span>
            {currentDate && (
              <>
                <span className="text-border">•</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(currentDate)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grade de Seções com os Cards Grandes */}
      {filteredSections.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border/80">
          <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-base text-foreground">Nenhum módulo encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Não encontramos nenhum módulo com o termo &quot;{searchTerm}&quot;.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredSections.map((section) => (
            <section key={section.title} className="space-y-4">
              {/* Título da Seção */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                    {section.title}
                  </h2>
                  <p className="text-xs text-muted-foreground/60 hidden sm:block">
                    {section.description}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/60">
                  {section.modules.length} {section.modules.length === 1 ? "módulo" : "módulos"}
                </span>
              </div>

              {/* Grid Responsivo de Cards Grandes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {section.modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    href={module.href}
                    accent={module.accent}
                    shortcut={module.shortcut}
                    status={module.status}
                    actionText="Acessar"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Dica de Rodapé no Estilo ERP Desktop */}
      <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Command className="h-3.5 w-3.5 text-primary" />
          <span>
            Dica rápida: Pressione as teclas <strong className="text-foreground">F2</strong> a <strong className="text-foreground">F11</strong> no teclado para abrir os módulos instantaneamente.
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground/70 font-mono">
          DALA Sistema Integrado • 2026
        </span>
      </div>
    </div>
  );
}
