"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
  status?: "active" | "development";
  blobClass?: string;
  iconBoxClass?: string;
  iconClass?: string;
  className?: string;
}

export function ModuleCard({
  title,
  subtitle,
  icon: Icon,
  href,
  status = "active",
  blobClass = "from-brand-50/70",
  iconBoxClass = "bg-[#EEF5FF] text-[#3B6EB5] border-[#DEEBFF]",
  iconClass = "w-4 h-4 stroke-[1.6]",
  className,
}: ModuleCardProps) {
  const isDev = status === "development";

  const cardContent = (
    <article
      className={cn(
        "group bg-white dark:bg-card rounded-2xl border border-[#F0E4E8] dark:border-border/60 shadow-soft hover:shadow-card-hover hover:border-brand-300/70 dark:hover:border-brand-700/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden p-5 h-full select-none cursor-pointer",
        isDev && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {/* Top right gradient accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110",
          blobClass
        )}
      />

      <div>
        {/* Header Card: Title + Subtitle on Left, Tinted Icon on Right */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-normal text-luxury-title dark:text-foreground group-hover:text-brand-800 dark:group-hover:text-brand-400 transition-colors font-sans">
              {title}
            </h3>
            <p className="text-xs text-brand-700/90 dark:text-brand-400 font-medium tracking-wide mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Delicately Tinted Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105",
              iconBoxClass
            )}
          >
            <Icon className={iconClass} />
          </div>
        </div>
      </div>

      {/* Card Footer: Border + Round Bordeaux Arrow CTA Button on Bottom Left */}
      <div className="flex items-center justify-between mt-4 border-t border-[#F8F1F3] dark:border-border/40 pt-2.5">
        <div className="w-8 h-8 rounded-full bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );

  if (isDev) {
    return cardContent;
  }

  return (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-2xl">
      {cardContent}
    </Link>
  );
}
