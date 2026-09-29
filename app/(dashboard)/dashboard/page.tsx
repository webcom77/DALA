"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  Banknote,
  Boxes,
  Shirt,
  Sparkles,
  Factory,
  ClipboardList,
  Coins,
  TrendingUp,
  SlidersHorizontal,
  Search,
} from "lucide-react";

import { ModuleCard } from "@/components/dashboard/module-card";

interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ElementType;
  href: string;
  blobClass: string;
  iconBoxClass: string;
  shortcut: string;
}

const MODULES: ModuleItem[] = [
  // OPERACIONAL & VENDAS
  {
    id: "pos",
    title: "PDV Balcão",
    subtitle: "Frente de Loja • Vendas Balcão",
    category: "Operacional & Vendas",
    icon: Store,
    href: "/pos",
    blobClass: "from-blue-50/70",
    iconBoxClass: "bg-[#EEF5FF] text-[#3B6EB5] border-[#DEEBFF]",
    shortcut: "F2",
  },
  {
    id: "cash",
    title: "Movimento de Caixa",
    subtitle: "Turnos • Gaveta de Dinheiro",
    category: "Operacional & Vendas",
    icon: Banknote,
    href: "/cash",
    blobClass: "from-amber-50/50",
    iconBoxClass: "bg-[#FFF9ED] text-[#C48C28] border-[#FCEECF]",
    shortcut: "F3",
  },
  {
    id: "inventory",
    title: "Controle de Estoque",
    subtitle: "Grade por Tamanho & Cor",
    category: "Operacional & Vendas",
    icon: Boxes,
    href: "/inventory",
    blobClass: "from-rose-50/60",
    iconBoxClass: "bg-[#FFF0F4] text-brand-700 border-[#FDDCE5]",
    shortcut: "F4",
  },

  // CADASTROS
  {
    id: "products",
    title: "Catálogo de Peças",
    subtitle: "Vestuário • Matriz de Grade",
    category: "Cadastros",
    icon: Shirt,
    href: "/products",
    blobClass: "from-pink-50/60",
    iconBoxClass: "bg-[#FFF1F6] text-[#C94D74] border-[#FCE1EB]",
    shortcut: "F5",
  },
  {
    id: "customers",
    title: "Clientes & Fidelidade",
    subtitle: "Programa VIP • CRM de Vendas",
    category: "Cadastros",
    icon: Sparkles,
    href: "/customers",
    blobClass: "from-teal-50/50",
    iconBoxClass: "bg-[#EFFCF6] text-[#29956D] border-[#D7F5E7]",
    shortcut: "F6",
  },
  {
    id: "suppliers",
    title: "Fornecedores",
    subtitle: "Confecções • Tecelagens",
    category: "Cadastros",
    icon: Factory,
    href: "/suppliers",
    blobClass: "from-cyan-50/50",
    iconBoxClass: "bg-[#F0FAFA] text-[#2C95A3] border-[#DAF2F4]",
    shortcut: "F7",
  },

  // GESTÃO & ESTRATÉGIA
  {
    id: "purchases",
    title: "Pedidos de Compra",
    subtitle: "Reposição de Coleção",
    category: "Gestão & Estratégia",
    icon: ClipboardList,
    href: "/purchases",
    blobClass: "from-purple-50/50",
    iconBoxClass: "bg-[#F7F2FE] text-[#7E42BD] border-[#EDE0FA]",
    shortcut: "F8",
  },
  {
    id: "finance",
    title: "Financeiro",
    subtitle: "Contas a Pagar & Receber",
    category: "Gestão & Estratégia",
    icon: Coins,
    href: "/finance",
    blobClass: "from-emerald-50/50",
    iconBoxClass: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
    shortcut: "F9",
  },
  {
    id: "reports",
    title: "Relatórios & DRE",
    subtitle: "Inteligência & Lucratividade",
    category: "Gestão & Estratégia",
    icon: TrendingUp,
    href: "/reports",
    blobClass: "from-rose-50/50",
    iconBoxClass: "bg-[#FFF1F2] text-[#9C2A4A] border-[#FFE4E6]",
    shortcut: "F10",
  },

  // SISTEMA
  {
    id: "settings",
    title: "Configurações",
    subtitle: "Parâmetros & Segurança",
    category: "Sistema",
    icon: SlidersHorizontal,
    href: "/settings",
    blobClass: "from-slate-50/50",
    iconBoxClass: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
    shortcut: "F11",
  },
];

const CATEGORIES = [
  "Todos os Módulos",
  "Operacional & Vendas",
  "Cadastros",
  "Gestão & Estratégia",
  "Sistema",
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = React.useState("Todos os Módulos");

  // Teclas de atalho no estilo ERP Desktop (F2 a F11)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const match = MODULES.find(
        (m) => m.shortcut.toUpperCase() === e.key.toUpperCase()
      );
      if (match) {
        e.preventDefault();
        router.push(match.href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Filtragem dos módulos
  const filteredModules = React.useMemo(() => {
    let list = MODULES;

    if (activeCategory !== "Todos os Módulos") {
      list = list.filter((m) => m.category === activeCategory);
    }

    if (urlSearch.trim()) {
      const q = urlSearch.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.shortcut.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, urlSearch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 selection:bg-brand-100 selection:text-brand-800">
      {/* Header Section: Category Pills & Title (Exato Stitch Design) */}
      <section className="space-y-6" data-purpose="modules-header">
        {/* Category Filter Tabs (Pills) */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-700 text-white shadow-pill"
                    : "bg-white dark:bg-card border border-[#F0E6EA] dark:border-border/60 text-luxury-body dark:text-muted-foreground hover:bg-brand-50 hover:text-brand-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EFE5E9] dark:border-border/50 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 text-xs uppercase tracking-[0.2em] font-medium mb-1">
              <span>Boutique &amp; Gestão</span>
              <span className="w-1 h-1 rounded-full bg-brand-400"></span>
              <span>Painel Central</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal text-luxury-title dark:text-foreground tracking-tight font-sans">
              Central de Módulos DALA
            </h2>
          </div>

          {urlSearch && (
            <div className="flex items-center gap-2 text-xs text-luxury-muted">
              <span>Buscando por: &quot;{urlSearch}&quot;</span>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-brand-700 hover:underline font-semibold"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modules Cards Grid (Exato Stitch: 3 colunas em desktop, cards brancos com ícone colorido e botão bordeaux) */}
      {filteredModules.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-card rounded-2xl border border-dashed border-[#F0E4E8] dark:border-border/60">
          <Search className="h-10 w-10 text-brand-500 mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-lg text-luxury-title dark:text-foreground">
            Nenhum módulo encontrado
          </h3>
          <p className="text-xs text-luxury-muted mt-1">
            Não encontramos módulos para os critérios selecionados.
          </p>
          <button
            onClick={() => {
              setActiveCategory("Todos os Módulos");
              router.push("/dashboard");
            }}
            className="mt-4 px-4 py-2 rounded-full bg-brand-700 text-white text-xs font-medium hover:bg-brand-800 transition-colors"
          >
            Ver todos os módulos
          </button>
        </div>
      ) : (
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-purpose="modules-grid"
        >
          {filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              title={mod.title}
              subtitle={mod.subtitle}
              icon={mod.icon}
              href={mod.href}
              blobClass={mod.blobClass}
              iconBoxClass={mod.iconBoxClass}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px] text-xs text-luxury-muted">
          Carregando módulos...
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}

