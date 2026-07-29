"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel = "Create Task",
  actionHref = "/create-task",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 lg:py-24 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
        {title}
      </h3>
      <p className="caption text-center mb-8 max-w-md">
        {description}
      </p>
      {actionHref && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Link href={actionHref}>
            <button className="btn-primary">
              <Plus size={18} />
              {actionLabel}
            </button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
