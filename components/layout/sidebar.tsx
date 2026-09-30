"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
        "w-72 bg-white dark:bg-card border-r border-gray-200/80 dark:border-border/60 flex flex-col justify-between shrink-0 shadow-xs min-h-screen sticky top-0 selection:bg-brand-100 selection:text-brand-800",
        className
      )}
      data-purpose="main-navigation"
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Gradient Banner with DaLa Logo (#E06B67 -> #F48884) */}
        <div className="w-full h-24 bg-gradient-to-r from-[#E06B67] to-[#F48884] flex items-center justify-center px-4 shrink-0 shadow-xs select-none">
          <Link
            href="/dashboard"
            onClick={onItemClick}
            className="flex items-center justify-center focus:outline-none transition-transform hover:scale-105"
          >
            <Image
              src="/dala-logo.png"
              alt="DALA Lingeries e Acessórios"
              width={160}
              height={70}
              className="h-16 w-auto object-contain drop-shadow-sm"
              priority
            />
          </Link>
        </div>

        {/* Navigation Hierarchy */}
        <div className="px-3.5 py-4 flex flex-col gap-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex flex-col gap-4 text-xs" data-purpose="sidebar-links">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-muted-foreground/70 block">
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
                          "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group",
                          isActive
                            ? "bg-[#FDF2F1] dark:bg-brand-950/40 text-[#E06B67] dark:text-brand-300 font-semibold"
                            : "text-gray-600 dark:text-muted-foreground hover:text-[#E06B67] dark:hover:text-brand-300 hover:bg-[#FDF2F1]/50 dark:hover:bg-brand-950/20 font-normal"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              isActive
                                ? "text-[#E06B67] stroke-[2]"
                                : "text-gray-400 stroke-[1.6] group-hover:text-[#E06B67]"
                            )}
                          />
                          <span className="tracking-wide truncate">{item.title}</span>
                        </div>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E06B67] shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div
        className="p-3.5 border-t border-gray-100 dark:border-border/50 bg-[#FCF9FA] dark:bg-muted/20 text-[11px] text-gray-400 dark:text-muted-foreground flex items-center justify-between shrink-0"
        data-purpose="sidebar-footer"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium tracking-wider uppercase text-[10px] text-gray-700 dark:text-foreground">
            DALA ERP
          </span>
        </div>
        <span className="text-[10px] tracking-widest opacity-60">v3.5</span>
      </div>
    </aside>
  );
}
