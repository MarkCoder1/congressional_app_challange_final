"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
        >
          <AlertTriangle size={36} className="text-destructive" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          An unexpected error occurred. Try again, or go back to the dashboard.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
