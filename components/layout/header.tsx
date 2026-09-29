"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header
      className="h-20 bg-white/90 dark:bg-card/90 backdrop-blur-md border-b border-[#F0E6EA] dark:border-border/60 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20"
      data-purpose="topbar"
    >
      {/* Left Topbar: Unit Selector & Status */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden text-luxury-muted hover:text-luxury-title"
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Status Pill */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium tracking-wide"
          data-purpose="operational-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl mx-4 sm:mx-6 hidden md:flex"
        data-purpose="search-container"
      >
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-luxury-muted absolute left-4 pointer-events-none stroke-[1.8]" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-24 py-2.5 text-xs bg-[#FAF7F8] dark:bg-muted/30 border border-[#ECDDE2] dark:border-border/60 rounded-full focus:bg-white dark:focus:bg-card focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-luxury-title dark:text-foreground placeholder:text-luxury-muted/70 transition-all shadow-inner"
            placeholder="Pesquisar por título, função ou atalho (ex: PDV, Caixa, F2)..."
            type="text"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal("")}
                className="p-1 rounded-full text-luxury-muted hover:text-luxury-title hover:bg-brand-50 transition-colors"
                title="Resetar busca"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-1 rounded-full bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-medium tracking-wider shadow-sm transition-all flex items-center gap-1"
            >
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Right Profile & Utilities */}
      <div className="flex items-center gap-4" data-purpose="user-utilities">
        {/* Notifications Button */}
        <button
          type="button"
          className="relative p-2.5 rounded-full text-luxury-body dark:text-muted-foreground hover:bg-brand-50 hover:text-brand-800 transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4 stroke-[1.8]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-700 rounded-full ring-2 ring-white dark:ring-card"></span>
        </button>

        {/* Light/Dark subtle toggle */}
        <ThemeToggle />

        <div className="h-6 w-px bg-[#EFE4E8] dark:bg-border/60 hidden sm:block"></div>

        {/* User Info & Avatar */}
        <UserNav />
      </div>
    </header>
  );
}
