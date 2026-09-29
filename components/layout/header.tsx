"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Esquerda: Botão hambúrguer no mobile, status do sistema e link de retorno */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Indicador de Status do Sistema */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">Sistema Operacional</span>
          <span className="sm:hidden">Online</span>
        </div>

        {/* Atalho Rápido para a Central de Módulos (quando em subpáginas) */}
        {!isHome && (
          <Link href="/dashboard" className="hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
              <span>Central de Módulos</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Direita: ThemeToggle, Separador e UserNav */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-6 w-[1px] bg-border hidden sm:block" />
        <UserNav />
      </div>
    </header>
  );
}
