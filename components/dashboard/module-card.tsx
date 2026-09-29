"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ModuleAccent =
  | "emerald"
  | "blue"
  | "amber"
  | "purple"
  | "teal"
  | "rose"
  | "indigo"
  | "slate";

export interface ModuleCardProps {
  title: string;
  categoryLabel?: string;
  highlightText?: string;
  description: string;
  icon: React.ElementType;
  href: string;
  status?: "active" | "development";
  badge?: string;
  accent?: ModuleAccent;
  actionText?: string;
  shortcut?: string;
  className?: string;
}

const accentIconStyles: Record<
  ModuleAccent,
  {
    container: string;
    icon: string;
  }
> = {
  emerald: {
    container: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/40",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    container: "bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-800/40",
    icon: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    container: "bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:border-amber-800/40",
    icon: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    container: "bg-pink-50 border-pink-100 dark:bg-pink-950/40 dark:border-pink-800/40",
    icon: "text-pink-600 dark:text-pink-400",
  },
  teal: {
    container: "bg-teal-50 border-teal-100 dark:bg-teal-950/40 dark:border-teal-800/40",
    icon: "text-teal-600 dark:text-teal-400",
  },
  rose: {
    container: "bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-800/40",
    icon: "text-rose-600 dark:text-rose-400",
  },
  indigo: {
    container: "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800/40",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  slate: {
    container: "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
    icon: "text-slate-700 dark:text-slate-300",
  },
};

export function ModuleCard({
  title,
  categoryLabel,
  highlightText,
  description,
  icon: Icon,
  href,
  status = "active",
  badge,
  accent = "rose",
  actionText = "Acessar",
  shortcut,
  className,
}: ModuleCardProps) {
  const isDev = status === "development";
  const iconStyle = accentIconStyles[accent] || accentIconStyles.rose;

  const cardInner = (
    <div
      className={cn(
        "group relative flex flex-col justify-between h-full min-h-[220px] p-6 rounded-3xl bg-white dark:bg-card border border-border/80 shadow-xs transition-all duration-300 select-none",
        isDev
          ? "opacity-60 cursor-not-allowed bg-muted/30 border-dashed"
          : "cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-pink-300 dark:hover:border-pink-500/40",
        className
      )}
    >
      {/* Topo do Card (Referência Jobie: Categoria na esquerda + Ícone Arredondado colorido na direita) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {categoryLabel && (
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {categoryLabel}
            </span>
          )}
          <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-pink-600 transition-colors mt-0.5">
            {title}
          </h3>
          {highlightText && (
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 mt-0.5 block">
              {highlightText}
            </span>
          )}
        </div>

        {/* Ícone Arredondado Colorido (Estilo Jobie) */}
        <div
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-2xl border transition-transform duration-200 group-hover:scale-110 shrink-0",
            iconStyle.container
          )}
        >
          <Icon className={cn("h-6 w-6", iconStyle.icon)} />
        </div>
      </div>

      {/* Descrição Central */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 my-2 flex-1">
        {description}
      </p>

      {/* Rodapé do Card: Tags em Pill e Botão Rosa */}
      <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          {shortcut && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink-50 text-pink-700 border border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60">
              {shortcut}
            </span>
          )}
          {badge && (
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Botão de Ação Rosa Arredondado (Estilo Jobie) */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs",
            isDev
              ? "bg-muted text-muted-foreground"
              : "bg-pink-600 hover:bg-pink-700 text-white group-hover:shadow-pink-500/25 group-hover:scale-105"
          )}
        >
          <span>{actionText}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );

  if (isDev) {
    return cardInner;
  }

  return (
    <Link
      href={href}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      {cardInner}
    </Link>
  );
}
