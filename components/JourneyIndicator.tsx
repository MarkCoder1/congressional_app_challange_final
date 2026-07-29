"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface Stage {
  key: string;
  label: string;
  status: "completed" | "current" | "locked";
  reason?: string;
}

interface JourneyIndicatorProps {
  stages: Stage[];
}

export function JourneyIndicator({ stages }: JourneyIndicatorProps) {
  const currentIdx = stages.findIndex((s) => s.status === "current");

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const isCurrent = stage.status === "current";
        const isCompleted = stage.status === "completed";
        const isLocked = stage.status === "locked";

        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.2 }}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              isCurrent
                ? "bg-accent/5 border border-accent/10"
                : isCompleted
                  ? "bg-success/5"
                  : "opacity-50"
            }`}
          >
            <div className="mt-0.5">
              {isCompleted ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : isCurrent ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Circle size={18} className="text-accent fill-accent/20" />
                </motion.div>
              ) : (
                <Circle size={18} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-accent"
                      : isCompleted
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              {isLocked && stage.reason && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stage.reason}
                </p>
              )}
              {isCurrent && (
                <p className="text-xs text-accent mt-0.5 font-medium">
                  You are here
                </p>
              )}
            </div>
            {idx < stages.length - 1 && !isCompleted && (
              <ArrowRight
                size={14}
                className={`shrink-0 mt-1 ${isCurrent ? "text-accent/40" : "text-border"}`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
