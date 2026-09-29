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
      <div className="relative min-h-screen bg-[#FAF8F6] dark:bg-[#121013] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-800">
        {/* Sidebar Fixa Desktop no Estilo Stitch Luxury */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col h-screen max-h-screen overflow-hidden">
          <Sidebar />
        </aside>

        {/* Drawer Lateral Mobile */}
        <MobileSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Área Principal de Conteúdo */}
        <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
          <Header onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1580px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
