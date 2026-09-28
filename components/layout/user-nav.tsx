"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLE_LABELS } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const { profile, signOut } = useAuth();

  const name = profile?.full_name || "Usuário";
  const role = profile?.role || "admin";
  const roleLabel = USER_ROLE_LABELS[role] || role;

  const roleBadgeVariant =
    role === "admin"
      ? "default"
      : role === "manager"
      ? "secondary"
      : "outline";

  return (
    <div className="flex items-center gap-3">
      {/* Informações textuais do usuário */}
      <div className="hidden sm:flex flex-col items-end leading-none">
        <span className="text-sm font-medium">{name}</span>
        <div className="mt-1">
          <Badge variant={roleBadgeVariant} className="text-[10px] py-0 px-1.5 h-4">
            {roleLabel}
          </Badge>
        </div>
      </div>

      {/* Avatar */}
      <Avatar name={name} size="md" />

      {/* Botão de Logout */}
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 ml-1"
        title="Encerrar sessão"
        aria-label="Sair do sistema"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
