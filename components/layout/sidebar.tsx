"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  Receipt,
  Package,
  Shirt,
  HeartHandshake,
  Truck,
  ClipboardList,
  Coins,
  TrendingUp,
  SlidersHorizontal,
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
        icon: ShoppingBag,
      },
      {
        title: "Movimento de Caixa",
        href: "/cash",
        icon: Receipt,
      },
      {
        title: "Controle de Estoque",
        href: "/inventory",
        icon: Package,
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
        title: "Clientes & VIPs",
        href: "/customers",
        icon: HeartHandshake,
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
        icon: Coins,
      },
      {
        title: "Relatórios & DRE",
        href: "/reports",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configurações",
        href: "/settings",
        icon: SlidersHorizontal,
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
    <aside
      className={cn(
        "w-72 bg-white dark:bg-card border-r border-[#F0E6EA] dark:border-border/60 flex flex-col justify-between shrink-0 shadow-sm min-h-screen sticky top-0 selection:bg-brand-100 selection:text-brand-800",
        className
      )}
      data-purpose="main-navigation"
    >
      {/* Top Branding & Nav Links Container */}
      <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Brand Logo */}
        <div className="flex flex-col border-b border-[#F6EEF1] dark:border-border/50 pb-5" data-purpose="brand-header">
          <Link
            href="/dashboard"
            onClick={onItemClick}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-700 via-brand-800 to-brand-500 flex items-center justify-center text-white shadow-sm ring-4 ring-brand-50 dark:ring-brand-950/40 shrink-0 transition-transform group-hover:scale-105">
              <span className="text-xl font-normal tracking-wide font-sans">D</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl tracking-[0.2em] font-semibold text-luxury-title dark:text-foreground font-sans leading-none">
                  DALA
                </h1>
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
              </div>
              <p className="text-[10px] uppercase font-light text-luxury-muted dark:text-muted-foreground tracking-[0.25em] mt-1">
                Boutique &amp; Gestão
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Hierarchy */}
        <nav className="flex flex-col gap-5 text-[13px]" data-purpose="sidebar-links">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-luxury-muted/80 dark:text-muted-foreground/70 block">
                {section.title}
              </span>

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
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200 group",
                        isActive
                          ? "bg-brand-50/90 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 font-medium border border-brand-100/80 dark:border-brand-900/50 shadow-xs"
                          : "text-luxury-body dark:text-muted-foreground hover:text-brand-800 dark:hover:text-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 font-normal"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive
                              ? "text-brand-700 dark:text-brand-400 stroke-[1.8]"
                              : "text-luxury-muted dark:text-muted-foreground stroke-[1.6] group-hover:text-brand-700"
                          )}
                        />
                        <span className="tracking-wide truncate">{item.title}</span>
                      </div>

                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-700 dark:bg-brand-400 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div
        className="p-4 border-t border-[#F5EBF0] dark:border-border/50 bg-[#FCF9FA] dark:bg-muted/20 text-[11px] text-luxury-muted dark:text-muted-foreground flex items-center justify-between shrink-0"
        data-purpose="sidebar-footer"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium tracking-wider uppercase text-[10px] text-luxury-body dark:text-foreground">
            DALA Cloud ERP
          </span>
        </div>
        <span className="text-[10px] tracking-widest opacity-60">v3.4 Lux</span>
      </div>
    </aside>
  );
}
