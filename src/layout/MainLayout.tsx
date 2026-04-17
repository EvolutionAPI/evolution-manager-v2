import React from "react";

import { Header } from "@/components/header";
import { MainSidebar } from "@/components/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <MainSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export { MainLayout };
