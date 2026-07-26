// /components/task-workspace/CompletionCelebration.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Target, Trophy, Sparkles, Star, Zap, ArrowRight, AlertCircle } from "lucide-react";
import type { LearningReport } from "@/lib/mockLearningData";

interface CompletionCelebrationProps {
  progress: number;
  timeSpent?: string;
  accuracy?: number;
  completedSections: string[];
  onBackToDashboard?: () => void;
  learningReport?: LearningReport;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const sparkleVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function CompletionCelebration({
  progress,
  timeSpent = "~2 hours",
  accuracy = 85,
  completedSections,
  onBackToDashboard,
  learningReport,
}: CompletionCelebrationProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto py-8 px-4"
    >
      {/* Celebration Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.div
          variants={sparkleVariants}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30 mb-4"
        >
          <Trophy size={36} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Sparkles size={24} className="text-yellow-500" />
          Task Completed!
          <Sparkles size={24} className="text-yellow-500" />
        </h2>
        <p className="text-muted-foreground">
          Great work! You've completed all sections of this task.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
            <Target size={18} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{progress}%</p>
          <p className="text-xs text-muted-foreground">Final Progress</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center mx-auto mb-2">
            <Clock size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{timeSpent}</p>
          <p className="text-xs text-muted-foreground">Time Spent</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center mx-auto mb-2">
            <Zap size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </motion.div>

      {/* Learning Report */}
      {learningReport && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              Learning Report
            </h3>
            
            <div className="space-y-4">
              {/* Score and Accuracy */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Final Score</span>
                <span className="text-lg font-bold text-accent">{learningReport.score}%</span>
              </div>

              {/* Topics Mastered */}
              {learningReport.topicsMastered.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Mastered</p>
                  <div className="space-y-1">
                    {learningReport.topicsMastered.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics to Improve */}
              {learningReport.topicsToImprove.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Review</p>
                  <div className="space-y-1">
                    {learningReport.topicsToImprove.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Next */}
              <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <ArrowRight size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-accent mb-1">Next Steps</p>
                  <p className="text-sm text-foreground">{learningReport.recommendedNext}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Completed Sections */}
      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          Completed Sections
        </h3>
        <div className="space-y-2">
          {completedSections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
            >
              <Star size={14} className="text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                {section}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Back to Dashboard */}
      <motion.div variants={itemVariants} className="text-center">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-lg active:scale-[0.98]"
          >
            <Trophy size={18} />
            Back to Dashboard
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
