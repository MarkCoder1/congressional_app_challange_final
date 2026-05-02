"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  CheckSquare,
  Menu,
  X,
  Plus,
  ListTodo,
} from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timeline", label: "Timeline", icon: BookOpen },
  { href: "#tasks", label: "Tasks", icon: CheckSquare, disabled: true },
  { href: "#assignments", label: "Assignments", icon: ListTodo, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-all duration-200 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-60 bg-card border-r border-border shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Branding */}
          <div className="px-6 py-8 border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">SF</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">StudyFlow AI</h1>
                <p className="text-xs text-muted-foreground">Learn better</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-6 mb-2 first:mt-0"
                  >
                    {item.label}
                  </div>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`sidebar-link w-full text-left ${
                      active ? "active" : ""
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Create Task Button */}
          <div className="px-4 py-6 border-t border-border">
            <Link href="/create-task">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                New Task
              </button>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center font-medium">
              © 2026 StudyFlow
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
