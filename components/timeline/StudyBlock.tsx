"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { StudyBlockResult } from "@/features/planner/types";

interface StudyBlockProps {
  block: StudyBlockResult;
  onClick?: () => void;
}

const studyTypeConfig = {
  learn: { icon: "📚", color: "bg-blue-50 border-blue-200 text-blue-900", badge: "bg-blue-100 text-blue-700" },
  practice: { icon: "⚡", color: "bg-green-50 border-green-200 text-green-900", badge: "bg-green-100 text-green-700" },
  review: { icon: "🔄", color: "bg-orange-50 border-orange-200 text-orange-900", badge: "bg-orange-100 text-orange-700" },
  work: { icon: "🎯", color: "bg-purple-50 border-purple-200 text-purple-900", badge: "bg-purple-100 text-purple-700" },
};

export function StudyBlock({ block, onClick }: StudyBlockProps) {
  const config = studyTypeConfig[block.type] || studyTypeConfig.learn;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`${config.color} border rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{config.icon}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${config.badge} capitalize`}>
          {block.type}
        </span>
      </div>

      <h4 className="font-bold text-sm mb-1 line-clamp-2">{block.title}</h4>
      <p className="text-xs opacity-75 mb-3">{block.subject}</p>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">⏱️ {block.duration} min</span>
        </div>
        <p className="opacity-75 line-clamp-2 leading-relaxed">{block.reason}</p>
      </div>

      <Link
        href={`/task/${block.taskId}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-3 block w-full text-center text-xs font-semibold bg-white/60 hover:bg-white/90 rounded-lg py-2 transition-colors"
      >
        Open Task
      </Link>
    </motion.div>
  );
}
