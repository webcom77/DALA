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
    <div className={cn("flex flex-col h-full bg-card/95 border-r border-border/70 backdrop-blur-xs select-none", className)}>
      {/* Topo / Logo da Boutique */}
      <div className="h-16 flex items-center px-5 border-b border-border/60 shrink-0 gap-2.5">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
            <Store className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none text-foreground">
              DALA
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide">
              Moda & Gestão
            </span>
          </div>
        </Link>
      </div>

      {/* Navegação Secundária Compacta */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      isActive
                        ? "bg-muted text-foreground font-semibold shadow-2xs border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-3 border-t border-border/60 shrink-0 text-center bg-muted/20">
        <p className="text-[10px] text-muted-foreground font-medium">
          DALA ERP • Central de Módulos
        </p>
      </div>
    </div>
  );
}
