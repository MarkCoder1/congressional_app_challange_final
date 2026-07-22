"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlannerTask } from "@/features/planner/types";

interface CompletedTasksProps {
  tasks: PlannerTask[];
}

export function CompletedTasks({ tasks }: CompletedTasksProps) {
  if (tasks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <CollapsibleHeader count={tasks.length} />
      <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 pt-2 space-y-3 max-h-[420px] overflow-auto"
        >
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/task/${task.id}`}
              className="block bg-secondary/50 hover:bg-secondary rounded-xl p-4 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium group-hover:text-accent transition-colors">
                    {task.title}
                  </h5>
                  <p className="text-sm text-muted-foreground">{task.subject}</p>
                </div>
                <div className="text-green-600 font-semibold">100%</div>
              </div>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function CollapsibleHeader({ count }: { count: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        <Trophy className="text-yellow-500" size={22} />
        <span className="font-semibold">Completed Tasks ({count})</span>
      </div>
      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );
}