"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSidebar } from "@/hooks/useSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-sunken">
      {/* Sidebar — part of the flex flow on desktop, hidden on mobile */}
      <div
        className="hidden lg:block flex-shrink-0 transition-all duration-300"
        style={{ width: isExpanded ? "18rem" : "5rem" }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main id="main-content" className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
