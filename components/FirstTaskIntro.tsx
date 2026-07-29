"use client";

import { motion } from "framer-motion";
import { BookOpen, Zap, Trophy, ArrowRight } from "lucide-react";

interface FirstTaskIntroProps {
  onDismiss: () => void;
}

export function FirstTaskIntro({ onDismiss }: FirstTaskIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-2xl p-6 mb-6"
    >
      <h3 className="text-lg font-bold mb-2">
        Let's turn this topic into a learning journey
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        StudyFlow will guide you through three stages for this concept.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-card/80 rounded-xl p-3.5 border border-accent/10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen size={15} className="text-accent" />
            </div>
            <span className="text-sm font-semibold">Learn</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Understand the concept with explanations and visuals.
          </p>
        </div>
        <div className="bg-card/80 rounded-xl p-3.5 border border-accent/10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap size={15} className="text-accent" />
            </div>
            <span className="text-sm font-semibold">Practice</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Test your knowledge with practice questions.
          </p>
        </div>
        <div className="bg-card/80 rounded-xl p-3.5 border border-accent/10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Trophy size={15} className="text-accent" />
            </div>
            <span className="text-sm font-semibold">Master</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prove your understanding with a timed challenge.
          </p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
      >
        Got it, let's start <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
