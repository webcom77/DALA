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
  iconClass = "w-4 h-4 stroke-[1.8]",
  className,
}: ModuleCardProps) {
  const isDev = status === "development";

  const cardContent = (
    <article
      className={cn(
        "group bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border/60 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(224,107,103,0.10)] hover:border-[#E06B67]/30 transition-all duration-200 flex flex-col justify-between relative overflow-hidden p-5 h-36 min-h-[140px] select-none cursor-pointer",
        isDev && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {/* Top right gradient accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl to-transparent rounded-bl-full pointer-events-none opacity-50 transition-transform group-hover:scale-110",
          blobClass
        )}
      />

      <div>
        {/* Header Card: Title + Subtitle on Left, Tinted Icon on Right */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground group-hover:text-[#E06B67] dark:group-hover:text-brand-300 transition-colors tracking-tight font-sans">
              {title}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-normal mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Delicately Tinted Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105",
              iconBoxClass
            )}
          >
            <Icon className={iconClass} />
          </div>
        </div>
      </div>

      {/* Card Footer: Round #E06B67 Arrow CTA Button on Bottom Left */}
      <div className="flex items-center justify-start mt-2">
        <div className="w-8 h-8 rounded-full bg-[#E06B67] hover:bg-[#ce5753] text-white flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
      </div>
    </article>
  );

  if (isDev) {
    return cardContent;
  }

  return (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E06B67] rounded-2xl">
      {cardContent}
    </Link>
  );
}
