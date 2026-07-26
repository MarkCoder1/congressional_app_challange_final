"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Zap, Trophy, ChevronRight } from "lucide-react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("studyflow_onboarding_complete");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleDismiss = () => {
    localStorage.setItem("studyflow_onboarding_complete", "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles size={32} className="text-accent" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center mb-3"
            >
              Welcome to StudyFlow AI
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-center mb-8"
            >
              Your intelligent learning system that plans, teaches, and adapts to your progress.
            </motion.p>

            {/* Workflow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
                Your Learning Journey
              </p>
              
              <div className="flex items-center justify-between">
                <WorkflowStep icon={<BookOpen size={20} />} label="Plan" delay={0.6} />
                <div className="flex-1 h-px bg-border mx-2" />
                <WorkflowStep icon={<Zap size={20} />} label="Learn" delay={0.7} />
                <div className="flex-1 h-px bg-border mx-2" />
                <WorkflowStep icon={<Zap size={20} />} label="Practice" delay={0.8} />
                <div className="flex-1 h-px bg-border mx-2" />
                <WorkflowStep icon={<Trophy size={20} />} label="Master" delay={0.9} />
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              onClick={handleDismiss}
              className="w-full bg-accent text-white rounded-xl py-3 px-6 font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start Learning
              <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WorkflowStep({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </motion.div>
  );
}