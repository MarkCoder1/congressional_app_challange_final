"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpMenu } from "@/components/HelpMenu";
import { SettingsModal } from "@/components/SettingsModal";

export function Header() {
  const pathname = usePathname();
  const [isSettingsOpen, setSettingsOpen] = useState(false);

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
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <h2 className="page-title truncate max-w-[160px] sm:max-w-none">{title}</h2>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="relative">
            <HelpMenu />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={20} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="User profile" className="rounded-full bg-accent text-white hover:bg-accent/90 hover:text-white w-10 h-10">
            <User size={20} />
          </Button>
        </div>
      </div>
      <SettingsModal open={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
