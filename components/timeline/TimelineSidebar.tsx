"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Target, Calendar, Gauge, BookOpen, Timer } from "lucide-react";
import type { StudyBlockResult } from "@/features/planner/types";

interface TimelineSidebarProps {
  block: StudyBlockResult | null;
  onClose: () => void;
  totalEstimatedMinutes?: number | null;
}

export function TimelineSidebar({ block, onClose, totalEstimatedMinutes }: TimelineSidebarProps) {
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

            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold mb-1">{block.title}</h4>
                <p className="text-muted-foreground">{block.subject}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge-accent capitalize">{block.type}</span>
                <span className="badge-default">{block.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Clock size={16} />} label="Session Duration" value={`${block.duration} min`} />
                <PriorityCard block={block} />
              </div>

              {totalEstimatedMinutes != null && totalEstimatedMinutes > 0 && totalEstimatedMinutes !== block.duration && (
                <div className="flex items-center gap-2 text-sm bg-secondary/30 rounded-xl p-3">
                  <Timer size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Total estimated time:</span>
                  <span className="font-semibold">{totalEstimatedMinutes} minutes</span>
                </div>
              )}

              <div className="card-inset p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-accent" />
                  <p className="text-sm font-semibold">Why This Task?</p>
                </div>
                <p className="text-sm text-muted-foreground">{block.reason}</p>
              </div>

              {block.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-semibold">{block.deadline}</span>
                </div>
              )}

              <div className="pt-4 border-t border-border space-y-3">
                <a
                  href={`/task/${block.taskId}`}
                  className="btn-primary w-full"
                >
                  <BookOpen size={16} />
                  Open Task
                </a>
                <button
                  onClick={onClose}
                  className="btn-secondary w-full"
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
    <div className="card-inset">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="caption">{label}</p>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function PriorityCard({ block }: { block: StudyBlockResult }) {
  const { label, score } = getPriorityDisplay(block);
  return (
    <div className="card-inset">
      <div className="flex items-center gap-2 mb-1">
        <Target size={16} />
        <p className="caption">Priority</p>
      </div>
      <p className="text-sm font-bold">{label}</p>
      {score != null && (
        <p className="caption">Score: {score}</p>
      )}
    </div>
  );
}

function getPriorityDisplay(block: StudyBlockResult): { label: string; score: string | null } {
  const score = block.priorityScore;

  if (score !== undefined && score !== null) {
    const rounded = Math.round(score);
    let label: string;
    if (rounded >= 90) label = "Critical";
    else if (rounded >= 70) label = "High";
    else if (rounded >= 40) label = "Medium";
    else label = "Low";

    return { label: `${label} (Score ${rounded})`, score: `${rounded}/100` };
  }

  if (block.priorityLevel) {
    return { label: capitalize(block.priorityLevel), score: null };
  }

  return { label: "N/A", score: null };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
