"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  Zap,
  Trophy,
  LayoutDashboard,
  Calendar,
  X,
} from "lucide-react";

const HELP_ITEMS = [
  {
    icon: <BookOpen size={18} />,
    title: "How StudyFlow works",
    content:
      "Create a task for any topic. StudyFlow guides you through Learn, Practice, and Master stages. Each stage builds your understanding progressively.",
  },
  {
    icon: <LayoutDashboard size={18} />,
    title: "Dashboard overview",
    content:
      "Your dashboard shows your next recommended action, upcoming deadlines, task progress, and quick stats. Check here first to know what to do next.",
  },
  {
    icon: <Zap size={18} />,
    title: "Learn stage",
    content:
      "The Learn stage introduces the concept with explanations, visual maps, key points, and examples. Start here to build your foundation.",
  },
  {
    icon: <Zap size={18} />,
    title: "Practice stage",
    content:
      "Practice tests your understanding with questions about the concept. Try answering before looking at explanations to check what you know.",
  },
  {
    icon: <Trophy size={18} />,
    title: "Master stage",
    content:
      "The Master stage is a timed challenge that checks your readiness. A strong score means you've truly understood the topic.",
  },
  {
    icon: <Calendar size={18} />,
    title: "Timeline",
    content:
      "Your timeline organizes tasks by time. It shows what to study and when. Drag items to adjust your schedule.",
  },
];

export function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-all duration-200 text-muted-foreground hover:text-foreground"
        aria-label="Help"
      >
        <HelpCircle size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <HelpCircle size={16} className="text-accent" />
                  Help & Guide
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto py-2">
                {HELP_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-accent">{item.icon}</div>
                      <div>
                        <h4 className="text-sm font-medium mb-0.5">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
