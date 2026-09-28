"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Shirt,
  Boxes,
  Users,
  Truck,
  Receipt,
  DollarSign,
  BarChart3,
  Store,
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
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Operacional & Vendas",
    items: [
      {
        title: "PDV Balcão",
        href: "/pos",
        icon: ShoppingBag,
      },
      {
        title: "Movimento de Caixa",
        href: "/cash",
        icon: Store,
      },
      {
        title: "Catálogo de Peças",
        href: "/products",
        icon: Shirt,
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
        icon: Receipt,
      },
      {
        title: "Financeiro",
        href: "/finance",
        icon: DollarSign,
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
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Topo / Logo */}
      <div className="h-16 flex items-center px-6 border-b shrink-0 gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-base leading-none">DALA</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">Boutique & Gestão</span>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h4 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </h4>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t shrink-0 text-center">
        <p className="text-[11px] text-muted-foreground font-medium">
          DALA Sistema Integrado • 2026
        </p>
      </div>
    </div>
  );
}
