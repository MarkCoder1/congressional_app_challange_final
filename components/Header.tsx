"use client";

import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpMenu } from "@/components/HelpMenu";

export function Header() {
  const pathname = usePathname();

  let title = "Dashboard";
  if (pathname === "/") {
    title = "Dashboard";
  } else if (pathname === "/timeline") {
    title = "Timeline";
  } else if (pathname.startsWith("/task/")) {
    title = "Task Workspace";
  } else if (pathname.startsWith("/assignments/")) {
    title = "Assignment Workspace";
  } else if (pathname === "/create-task") {
    title = "Create Task";
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="hidden lg:block">
          <h2 className="page-title text-lg">{title}</h2>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="relative">
            <HelpMenu />
          </div>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings size={20} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="User profile" className="rounded-full bg-accent text-white hover:bg-accent/90 hover:text-white w-10 h-10">
            <User size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
