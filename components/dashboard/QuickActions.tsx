"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, Calendar, BarChart3, ArrowRight } from "lucide-react";

interface QuickActionsProps {
  hasTasks: boolean;
  topTaskId?: string;
}

export function QuickActions({ hasTasks, topTaskId }: QuickActionsProps) {
  const actions = [
    {
      label: "Continue Learning",
      description: "Resume your highest priority task",
      icon: PlayCircle,
      href: topTaskId ? `/task/${topTaskId}` : "/create-task",
      color: "bg-accent/10 text-accent hover:bg-accent/20",
      enabled: hasTasks,
    },
    {
      label: "View Timeline",
      description: "See your study schedule",
      icon: Calendar,
      href: "/timeline",
      color: "bg-accent/10 text-accent hover:bg-accent/20",
      enabled: true,
    },
    {
      label: "Review Progress",
      description: "Check your learning insights",
      icon: BarChart3,
      href: "/insights",
      color: "bg-accent/10 text-accent hover:bg-accent/20",
      enabled: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card-dashboard"
    >
      <h3 className="card-title mb-4">
        <BarChart3 size={18} className="text-accent" />
        Quick Actions
      </h3>

      <div className="space-y-2.5">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <Link
                href={action.enabled ? action.href : "#"}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-3 transition-all group ${
                  action.enabled
                    ? `${action.color} cursor-pointer`
                    : "bg-secondary/30 text-muted-foreground cursor-not-allowed opacity-50"
                }`}
                onClick={(e) => {
                  if (!action.enabled) e.preventDefault();
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                    {action.label}
                  </p>
                  <p className="caption opacity-70">{action.description}</p>
                </div>
                {action.enabled && (
                  <ArrowRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
