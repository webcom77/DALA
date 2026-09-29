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
      <div className="relative min-h-screen bg-[#f4f6fa] dark:bg-[#0c0d12] flex flex-col font-sans">
        {/* Sidebar Fixa Desktop Rosa no Estilo Jobie */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col h-screen max-h-screen overflow-hidden">
          <Sidebar />
        </aside>

        {/* Drawer Lateral Mobile */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Área Principal de Conteúdo com fundo suave */}
        <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
          <Header onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
