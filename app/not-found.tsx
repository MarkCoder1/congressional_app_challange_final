"use client";

import { motion } from "framer-motion";
import { SearchX, ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
          className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6"
        >
          <SearchX size={36} className="text-muted-foreground" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">Lost your way?</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          This page doesn&apos;t exist. It might have been moved or deleted.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <LayoutDashboard size={16} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
