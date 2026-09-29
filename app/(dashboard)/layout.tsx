"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AuthProvider } from "@/components/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-muted/20 flex flex-col">
        {/* Sidebar Fixa Desktop Compacta (Secundária) */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col">
          <Sidebar />
        </aside>

        {/* Drawer Lateral Mobile */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Área Principal de Conteúdo - Central de Módulos */}
        <div className="lg:pl-60 flex flex-col flex-1 min-h-screen">
          <Header onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
