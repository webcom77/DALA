"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutGrid, Search, Bell } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-border/50 bg-white/95 dark:bg-card/95 px-4 md:px-8 backdrop-blur-md">
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full border border-pink-100 dark:border-pink-900/40 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-600"></span>
          </span>
          <span className="hidden sm:inline">Loja Operacional</span>
          <span className="sm:hidden">Online</span>
        </div>

        {/* Atalho Rápido para a Central de Módulos (quando em subpáginas) */}
        {!isHome && (
          <Link href="/dashboard" className="hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-full gap-1.5 transition-colors font-medium"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-pink-600" />
              <span>Central de Módulos</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Direita: Notificações, ThemeToggle e UserNav (Estilo Jobie) */}
      <div className="flex items-center gap-3">
        {/* Notificações com badge rosa */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-pink-50/50"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-600" />
        </div>

        <ThemeToggle />
        <div className="h-6 w-[1px] bg-border/60 hidden sm:block" />
        <UserNav />
      </div>
    </header>
  );
}
