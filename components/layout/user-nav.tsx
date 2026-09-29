"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function UserNav() {
  const { profile, signOut } = useAuth();

  const name = profile?.full_name || "Administrador DALA";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  return (
    <div className="flex items-center gap-3 pl-1">
      <div className="text-right hidden sm:block">
        <div className="text-xs font-semibold text-luxury-title dark:text-foreground leading-tight truncate max-w-[150px]">
          {name}
        </div>
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-100 via-rose-100 to-amber-50 border border-brand-200/80 flex items-center justify-center text-brand-800 font-semibold text-sm shadow-xs ring-2 ring-brand-50 dark:ring-brand-950/40 font-sans shrink-0">
        {initials}
      </div>

      <button
        onClick={signOut}
        className="p-2 text-luxury-muted dark:text-muted-foreground hover:text-brand-800 dark:hover:text-brand-400 transition-colors rounded-full hover:bg-brand-50 dark:hover:bg-muted/40"
        title="Sair do sistema"
        type="button"
      >
        <LogOut className="w-4 h-4 stroke-[1.8]" />
      </button>
    </div>
  );
}
