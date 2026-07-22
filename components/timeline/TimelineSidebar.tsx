"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Target, Calendar, Gauge, BookOpen } from "lucide-react";
import type { StudyBlockResult } from "@/features/planner/types";

interface TimelineSidebarProps {
  block: StudyBlockResult | null;
  onClose: () => void;
}

export function TimelineSidebar({ block, onClose }: TimelineSidebarProps) {
  return (
    <AnimatePresence>
      {block && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Study Block Details</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Title & Subject */}
              <div>
                <h4 className="text-xl font-bold mb-1">{block.title}</h4>
                <p className="text-muted-foreground">{block.subject}</p>
              </div>

              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-semibold capitalize">
                  {block.type}
                </span>
                <span className="px-3 py-1 bg-secondary rounded-lg text-sm font-semibold">
                  {block.date}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Clock size={16} />} label="Duration" value={`${block.duration} min`} />
                <StatCard icon={<Target size={16} />} label="Priority" value={block.priorityScore?.toFixed(1) ?? "N/A"} />
              </div>

              {/* Reason */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-accent" />
                  <p className="text-sm font-semibold">Why This Task?</p>
                </div>
                <p className="text-sm text-muted-foreground">{block.reason}</p>
              </div>

              {/* Deadline */}
              {block.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-semibold">{block.deadline}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                <a
                  href={`/task/${block.taskId}`}
                  className="flex items-center justify-center gap-2 w-full bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                >
                  <BookOpen size={16} />
                  Open Task
                </a>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 rounded-xl font-semibold border border-border hover:bg-secondary transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
