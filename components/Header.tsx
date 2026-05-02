"use client";

import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/timeline": "Timeline",
  "/task/1": "Task Workspace",
};

export function Header() {
  const pathname = usePathname();

  // For dynamic routes like /task/[id]
  let title = "Dashboard";
  if (pathname === "/") {
    title = "Dashboard";
  } else if (pathname === "/timeline") {
    title = "Timeline";
  } else if (pathname.startsWith("/task/")) {
    title = "Task Workspace";
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Title */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Settings size={20} className="text-muted-foreground" />
          </button>

          <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
