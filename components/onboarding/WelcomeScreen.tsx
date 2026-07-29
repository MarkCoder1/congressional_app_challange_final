"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Zap,
  Trophy,
  ChevronRight,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to StudyFlow AI",
    description:
      "Your personal learning system that helps you plan, understand, practice, and master concepts.",
    illustration: "sparkles",
  },
  {
    title: "Every concept becomes a guided learning journey",
    description:
      "Each task flows through four stages: Plan what to learn, Understand the concept, Practice your knowledge, and Master the topic.",
    illustration: "workflow",
  },
  {
    title: "Your dashboard keeps you on track",
    description:
      "See your next recommended action, upcoming deadlines, and learning progress all in one place.",
    illustration: "dashboard",
  },
  {
    title: "You're ready to start learning",
    description:
      "Create your first task and StudyFlow will guide you through the entire learning process.",
    illustration: "ready",
  },
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("studyflow_onboarding_complete");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      localStorage.setItem("studyflow_onboarding_complete", "true");
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("studyflow_onboarding_complete", "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const renderIllustration = (type: string) => {
    switch (type) {
      case "sparkles":
        return (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto">
            <Sparkles size={40} className="text-accent" />
          </div>
        );
      case "workflow":
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <BookOpen size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Plan</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground -mt-6" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Zap size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Learn</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground -mt-6" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Zap size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Practice</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground -mt-6" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Trophy size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Master</span>
            </div>
          </div>
        );
      case "dashboard":
        return (
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <LayoutDashboard size={28} className="text-accent" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-24 bg-accent/20 rounded" />
              <div className="h-2 w-20 bg-accent/10 rounded" />
              <div className="h-2 w-16 bg-accent/5 rounded" />
            </div>
          </div>
        );
      case "ready":
        return (
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-success" />
          </div>
        );
      default:
        return null;
    }
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
            key={currentStep}
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex justify-center">
                {renderIllustration(STEPS[currentStep].illustration)}
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{STEPS[currentStep].title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {STEPS[currentStep].description}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? "bg-accent w-6"
                        : idx < currentStep
                          ? "bg-accent/40"
                          : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-accent text-white rounded-xl py-3 px-4 font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-accent/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {currentStep < STEPS.length - 1 ? (
                    <>
                      Next <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Start Learning <Sparkles size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
