"use client";

import { CalendarX, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyTimelineProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyTimeline({
  title = "No study sessions scheduled",
  description = "Add tasks to see your AI-generated study plan here.",
  actionLabel = "Create First Task",
  actionHref = "/create-task",
}: EmptyTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 lg:p-8"
    >
      <div className="bg-card border border-border rounded-2xl shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6"
          >
            <CalendarX size={48} className="text-muted-foreground" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {description}
            </p>

            {/* Action Button */}
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              {actionLabel}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
