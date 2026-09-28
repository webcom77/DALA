"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Esquerda: Botão hambúrguer no mobile e status do sistema */}
      <div className="flex items-center gap-4">
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
