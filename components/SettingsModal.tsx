"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <SettingsPanel key="settings-panel" onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("studyflow_onboarding_complete");
  });

  const handleToggle = () => {
    if (showOnboarding) {
      localStorage.setItem("studyflow_onboarding_complete", "true");
      setShowOnboarding(false);
    } else {
      localStorage.removeItem("studyflow_onboarding_complete");
      setShowOnboarding(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Settings size={15} className="text-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        </div>

        <Separator />

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Show onboarding</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {showOnboarding
                  ? "Onboarding will appear on your next dashboard visit."
                  : "Reset the onboarding tutorial and walkthrough guidance."}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={showOnboarding}
              onClick={handleToggle}
              className={`relative shrink-0 w-10 h-6 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                showOnboarding ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  showOnboarding ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Open onboarding anytime with{" "}
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-secondary text-[10px] font-medium text-foreground">
              <span className="text-xs">⌘</span>/Ctrl + Shift + O
            </kbd>
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
