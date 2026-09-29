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
  Search,
  Filter,
  Sparkles,
  Command,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleCard, type ModuleAccent } from "@/components/dashboard/module-card";

interface ModuleDefinition {
  id: string;
  title: string;
  categoryLabel: string;
  highlightText: string;
  description: string;
  icon: React.ElementType;
  href: string;
  accent: ModuleAccent;
  shortcut: string;
  status: "active" | "development";
}

const ALL_MODULES: ModuleDefinition[] = [
  // OPERACIONAL & VENDAS
  {
    id: "pos",
    title: "PDV Balcão",
    categoryLabel: "Operacional & Vendas",
    highlightText: "Frente de Loja • Vendas Balcão",
    description: "Vendas rápidas, leitor de código de barras, seleção de grade e emissão de comprovantes.",
    icon: Store,
    href: "/pos",
    accent: "blue",
    shortcut: "F2",
    status: "active",
  },
  {
    id: "cash",
    title: "Movimento de Caixa",
    categoryLabel: "Operacional & Vendas",
    highlightText: "Turnos • Gaveta de Dinheiro",
    description: "Abertura de turno com fundo de troco, suprimentos, sangrias e conferência de valores.",
    icon: WalletCards,
    href: "/cash",
    accent: "amber",
    shortcut: "F3",
    status: "active",
  },
  {
    id: "inventory",
    title: "Controle de Estoque",
    categoryLabel: "Operacional & Vendas",
    highlightText: "Grade por Tamanho & Cor",
    description: "Saldos físicos em tempo real por variação, reposição de coleção e histórico de movimentações.",
    icon: Boxes,
    href: "/inventory",
    accent: "purple",
    shortcut: "F4",
    status: "active",
  },

  // CADASTROS
  {
    id: "products",
    title: "Catálogo de Peças",
    categoryLabel: "Cadastros",
    highlightText: "Vestuário • Matriz de Grade",
    description: "Cadastro de roupas, precificação de venda, custo fabril, matriz de grade e referências SKU.",
    icon: Shirt,
    href: "/products",
    accent: "rose",
    shortcut: "F5",
    status: "active",
  },
  {
    id: "customers",
    title: "Clientes",
    categoryLabel: "Cadastros",
    highlightText: "Fidelidade • CRM de Vendas",
    description: "Base de consumidores, histórico de compras, ticket acumulado, contatos e preferências.",
    icon: Users,
    href: "/customers",
    accent: "emerald",
    shortcut: "F6",
    status: "active",
  },
  {
    id: "suppliers",
    title: "Fornecedores",
    categoryLabel: "Cadastros",
    highlightText: "Confecções • Tecelagens",
    description: "Fábricas de confecção, tecelagens, prazos médios de entrega e histórico de reposição.",
    icon: Truck,
    href: "/suppliers",
    accent: "teal",
    shortcut: "F7",
    status: "active",
  },

  // GESTÃO & ESTRATÉGIA
  {
    id: "purchases",
    title: "Pedidos de Compra",
    categoryLabel: "Gestão & Estratégia",
    highlightText: "Reposição de Coleção",
    description: "Emissão de pedidos fabris, cotações com confecções e entrada automática em estoque.",
    icon: ClipboardList,
    href: "/purchases",
    accent: "rose",
    shortcut: "F8",
    status: "active",
  },
  {
    id: "finance",
    title: "Financeiro",
    categoryLabel: "Gestão & Estratégia",
    highlightText: "Contas a Pagar & Receber",
    description: "Controle de contas a pagar, recebíveis do PDV, liquidações e fluxo de caixa.",
    icon: CircleDollarSign,
    href: "/finance",
    accent: "emerald",
    shortcut: "F9",
    status: "active",
  },
  {
    id: "reports",
    title: "Relatórios & DRE",
    categoryLabel: "Gestão & Estratégia",
    highlightText: "Inteligência & Lucratividade",
    description: "Demonstrativo do resultado (DRE), ranking ABC de peças campeãs e análise de margem.",
    icon: BarChart3,
    href: "/reports",
    accent: "indigo",
    shortcut: "F10",
    status: "active",
  },

  // SISTEMA
  {
    id: "settings",
    title: "Configurações",
    categoryLabel: "Sistema",
    highlightText: "Parâmetros & Segurança",
    description: "Parâmetros gerais da boutique, controle de acesso, tributos e personalização.",
    icon: Settings,
    href: "/settings",
    accent: "slate",
    shortcut: "F11",
    status: "active",
  },
];

const CATEGORY_SUGGESTIONS = [
  "Todos os Módulos",
  "Operacional & Vendas",
  "Cadastros",
  "Gestão & Estratégia",
  "Sistema",
];

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos os Módulos");

  // Atalhos de teclado no estilo ERP Desktop (F2 a F11)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const matched = ALL_MODULES.find(
        (m) => m.shortcut.toUpperCase() === e.key.toUpperCase()
      );
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

  // Filtro de Módulos
  const filteredModules = React.useMemo(() => {
    let list = ALL_MODULES;

    if (selectedCategory !== "Todos os Módulos") {
      list = list.filter((m) => m.categoryLabel === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.categoryLabel.toLowerCase().includes(q) ||
          m.shortcut.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. BARRA SUPERIOR DE BUSCA E FILTROS (Referência Jobie com botões rosas) */}
      <div className="bg-white dark:bg-card rounded-3xl p-3 sm:p-4 shadow-sm border border-border/60 flex flex-col md:flex-row items-center gap-3">
        {/* Dropdown de Unidade / Loja */}
        <div className="flex items-center gap-2 px-4 py-2 bg-pink-50/60 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 rounded-full border border-pink-100 dark:border-pink-900/40 text-xs font-bold w-full md:w-auto shrink-0 justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-pink-600" />
            DALA Matriz
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </div>

        {/* Input de Busca Central Arredondado */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por título, função ou atalho (ex: PDV, Caixa, F2)..."
            className="pl-11 pr-20 h-12 rounded-full border-0 bg-[#f4f6fa] dark:bg-muted/40 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-pink-500 placeholder:text-muted-foreground/70"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Botões de Ação Rosas (Estilo Jobie: FILTER + FIND) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("Todos os Módulos");
            }}
            className="rounded-full h-11 px-5 text-xs font-bold border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>RESET</span>
          </Button>

          <Button
            className="rounded-full h-11 px-7 text-xs font-black tracking-wider uppercase bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-500/20 gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>BUSCAR</span>
          </Button>
        </div>
      </div>

      {/* 2. PILLS DE SUGESTÃO / CATEGORIAS (Referência Jobie com pills rosas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <span className="text-xs font-bold text-muted-foreground/80 shrink-0 mr-1 hidden sm:inline">
          Categorias:
        </span>
        {CATEGORY_SUGGESTIONS.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-pink-600 text-white shadow-sm shadow-pink-500/30 scale-102"
                  : "bg-white dark:bg-card text-muted-foreground hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30 border border-border/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. SUBHEADER / CONTROLE DE RESULTADOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Central de Módulos DALA
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Exibindo <strong>{filteredModules.length}</strong> {filteredModules.length === 1 ? "módulo disponível" : "módulos disponíveis"} • Operador: <strong className="text-foreground">{userName}</strong> ({roleLabel})
          </p>
        </div>

        {/* Badge de Atalho F2-F11 */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40">
            <Command className="h-3 w-3 text-pink-600" />
            Atalhos F2 a F11 ativos
          </span>
        </div>
      </div>

      {/* 4. GRADE DE CARDS GRANDES (Referência visual do Jobie com ícones coloridos e botões rosas) */}
      {filteredModules.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-card rounded-3xl border border-dashed border-border/80">
          <Search className="h-12 w-12 text-pink-400 mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-foreground">Nenhum módulo encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Não encontramos resultados para a busca &quot;{searchTerm}&quot;.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("Todos os Módulos");
            }}
            className="mt-4 rounded-full bg-pink-600 text-white text-xs font-bold"
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              categoryLabel={module.categoryLabel}
              highlightText={module.highlightText}
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
      )}

      {/* 5. RODAPÉ DE APOIO */}
      <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium">
          DALA Sistema Integrado • Moda Feminina & Masculina
        </span>
        <span className="text-[11px] font-mono text-muted-foreground/70">
          Design Inspirado em ERP Moderno 2026
        </span>
      </div>
    </div>
  );
}
