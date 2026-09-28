"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // Previne scroll do body quando o menu mobile estiver aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop com animação suave */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteúdo da Sidebar gaveta */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card shadow-2xl transition-transform animate-in slide-in-from-left duration-200 flex flex-col">
        <div className="absolute right-3 top-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Sidebar onItemClick={onClose} />
      </div>
    </div>
  );
}
