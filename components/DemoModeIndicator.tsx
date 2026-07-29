"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function DemoModeIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="fixed top-4 right-4 z-40"
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/80 border border-border rounded-md text-xs font-medium text-muted-foreground backdrop-blur-sm">
        <Sparkles size={11} className="text-accent" />
        <span>Demo Environment</span>
      </div>
    </motion.div>
  );
}
