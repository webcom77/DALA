"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Settings,
  Store,
  Shirt,
  Boxes,
  Users,
  Truck,
  ClipboardList,
  CircleDollarSign,
  BarChart3,
  WalletCards,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Central de Módulos",
        href: "/dashboard",
        icon: LayoutGrid,
      },
    ],
  },
  {
    title: "Operacional & Vendas",
    items: [
      {
        title: "PDV Balcão",
        href: "/pos",
        icon: Store,
      },
      {
        title: "Movimento de Caixa",
        href: "/cash",
        icon: WalletCards,
      },
      {
        title: "Controle de Estoque",
        href: "/inventory",
        icon: Boxes,
      },
    ],
  },
  {
    title: "Cadastros",
    items: [
      {
        title: "Catálogo de Peças",
        href: "/products",
        icon: Shirt,
      },
      {
        title: "Clientes",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Fornecedores",
        href: "/suppliers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Gestão & Estratégia",
    items: [
      {
        title: "Pedidos de Compra",
        href: "/purchases",
        icon: ClipboardList,
      },
      {
        title: "Financeiro",
        href: "/finance",
        icon: CircleDollarSign,
      },
      {
        title: "Relatórios & DRE",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configurações",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function Sidebar({ onItemClick, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col h-full max-h-screen bg-[#9d174d] text-white shadow-xl select-none relative overflow-hidden",
        className
      )}
    >
      {/* Detalhe de iluminação sutil de fundo */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Topo / Logo da Boutique (Compacto e sem ocupar espaço excessivo) */}
      <div className="h-14 flex items-center px-4 shrink-0 gap-2.5 border-b border-white/10">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          {/* Símbolo Arredondado Branco */}
          <div className="h-8 w-8 rounded-xl bg-white text-[#9d174d] flex items-center justify-center font-black text-base shadow-sm transition-transform group-hover:scale-105">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-base leading-none text-white flex items-center gap-1">
              DALA
              <Sparkles className="h-2.5 w-2.5 text-pink-300" />
            </span>
            <span className="text-[10px] text-pink-200/80 font-medium tracking-wide mt-0.5">
              Boutique & Gestão
            </span>
          </div>
        </Link>
      </div>

      {/* Navegação por Módulos - Compacta e SEM Barra de Rolagem */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <h4 className="px-2 text-[9px] font-bold uppercase tracking-wider text-pink-200/60 leading-tight">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group",
                      isActive
                        ? "bg-white text-[#9d174d] shadow-sm font-bold"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        isActive ? "text-[#9d174d]" : "text-pink-200 group-hover:text-white"
                      )}
                    />
                    <span className="truncate leading-normal">{item.title}</span>

                    {/* Indicador de item ativo */}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#9d174d]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar - Compacto */}
      <div className="py-2 px-3 border-t border-white/10 shrink-0 text-center bg-black/10">
        <p className="text-[10px] text-pink-200/70 font-medium leading-tight">
          DALA ERP • Central Rosa
        </p>
      </div>
    </div>
  );
}
