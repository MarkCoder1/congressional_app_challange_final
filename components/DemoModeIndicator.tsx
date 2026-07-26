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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent backdrop-blur-sm">
        <Sparkles size={12} />
        <span>Demo Mode</span>
      </div>
    </motion.div>
  );
}