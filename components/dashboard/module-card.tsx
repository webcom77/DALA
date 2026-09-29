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

const accentStyles: Record<
  ModuleAccent,
  {
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    hoverShadow: string;
    actionColor: string;
  }
> = {
  emerald: {
    iconBg: "bg-emerald-50 border-emerald-100/80 dark:bg-emerald-950/40 dark:border-emerald-800/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-500/50 dark:hover:border-emerald-400/40",
    hoverShadow: "hover:shadow-emerald-500/5",
    actionColor: "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700",
  },
  blue: {
    iconBg: "bg-blue-50 border-blue-100/80 dark:bg-blue-950/40 dark:border-blue-800/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-500/50 dark:hover:border-blue-400/40",
    hoverShadow: "hover:shadow-blue-500/5",
    actionColor: "text-blue-600 dark:text-blue-400 group-hover:text-blue-700",
  },
  amber: {
    iconBg: "bg-amber-50 border-amber-100/80 dark:bg-amber-950/40 dark:border-amber-800/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-500/50 dark:hover:border-amber-400/40",
    hoverShadow: "hover:shadow-amber-500/5",
    actionColor: "text-amber-600 dark:text-amber-400 group-hover:text-amber-700",
  },
  purple: {
    iconBg: "bg-purple-50 border-purple-100/80 dark:bg-purple-950/40 dark:border-purple-800/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    hoverBorder: "hover:border-purple-500/50 dark:hover:border-purple-400/40",
    hoverShadow: "hover:shadow-purple-500/5",
    actionColor: "text-purple-600 dark:text-purple-400 group-hover:text-purple-700",
  },
  teal: {
    iconBg: "bg-teal-50 border-teal-100/80 dark:bg-teal-950/40 dark:border-teal-800/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    hoverBorder: "hover:border-teal-500/50 dark:hover:border-teal-400/40",
    hoverShadow: "hover:shadow-teal-500/5",
    actionColor: "text-teal-600 dark:text-teal-400 group-hover:text-teal-700",
  },
  rose: {
    iconBg: "bg-rose-50 border-rose-100/80 dark:bg-rose-950/40 dark:border-rose-800/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-500/50 dark:hover:border-rose-400/40",
    hoverShadow: "hover:shadow-rose-500/5",
    actionColor: "text-rose-600 dark:text-rose-400 group-hover:text-rose-700",
  },
  indigo: {
    iconBg: "bg-indigo-50 border-indigo-100/80 dark:bg-indigo-950/40 dark:border-indigo-800/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-500/50 dark:hover:border-indigo-400/40",
    hoverShadow: "hover:shadow-indigo-500/5",
    actionColor: "text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700",
  },
  slate: {
    iconBg: "bg-slate-100 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/60",
    iconColor: "text-slate-700 dark:text-slate-300",
    hoverBorder: "hover:border-slate-500/50 dark:hover:border-slate-400/40",
    hoverShadow: "hover:shadow-slate-500/5",
    actionColor: "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white",
  },
};

export function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  status = "active",
  badge,
  accent = "slate",
  actionText = "Acessar",
  shortcut,
  className,
}: ModuleCardProps) {
  const isDev = status === "development";
  const styles = accentStyles[accent] || accentStyles.slate;

  const content = (
    <div
      className={cn(
        "group relative flex flex-col justify-between h-full min-h-[200px] p-6 rounded-2xl bg-card border border-border/70 shadow-xs transition-all duration-200 select-none",
        isDev
          ? "opacity-60 cursor-not-allowed bg-muted/30 border-dashed"
          : cn(
              "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:bg-card/95",
              styles.hoverBorder,
              styles.hoverShadow
            ),
        className
      )}
    >
      {/* Topo do Card: Ícone e Badges */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Container do Ícone Grande */}
        <div
          className={cn(
            "flex items-center justify-center h-14 w-14 rounded-xl border transition-transform duration-200 group-hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-7 w-7 transition-colors", styles.iconColor)} />
        </div>

        {/* Badges / Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {shortcut && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-muted text-muted-foreground border border-border/50">
              {shortcut}
            </span>
          )}

          {isDev ? (
            <Badge
              variant="outline"
              className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
            >
              Em desenvolvimento
            </Badge>
          ) : badge ? (
            <Badge
              variant="secondary"
              className="text-[11px] px-2 py-0.5 font-medium"
            >
              {badge}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Conteúdo Central: Título e Descrição */}
      <div className="space-y-1.5 flex-1">
        <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-foreground">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Rodapé do Card: Indicador de Ação / Seta */}
      <div className="pt-4 mt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold">
        <span
          className={cn(
            "transition-colors flex items-center gap-1.5",
            isDev ? "text-muted-foreground" : styles.actionColor
          )}
        >
          {isDev ? "Indisponível" : actionText}
          {!isDev && (
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          )}
        </span>

        {/* Indicador visual de toque / módulo */}
        <span className="text-[11px] text-muted-foreground/60 font-mono">
          Módulo
        </span>
      </div>
    </div>
  );

  if (isDev) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
    >
      {content}
    </Link>
  );
}
