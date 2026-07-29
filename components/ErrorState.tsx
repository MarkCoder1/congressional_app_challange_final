"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
}

export function ErrorState({
  title = "Unable to load this page",
  description = "Something went wrong. Please try again.",
  retryLabel = "Try Again",
  onRetry,
  backHref,
  backLabel = "Go Back",
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 lg:py-24 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
      >
        <AlertTriangle size={28} className="text-destructive" />
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-md">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {retryLabel}
          </button>
        )}
        {backHref && (
          <Link href={backHref} className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        )}
      </div>
    </motion.div>
  );
}
