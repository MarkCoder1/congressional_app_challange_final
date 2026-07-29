"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { StudyBlockResult } from "@/features/planner/types";

interface StudyBlockProps {
  block: StudyBlockResult;
  onClick?: () => void;
}

const studyTypeConfig = {
  learn: { icon: "📚", color: "bg-primary-tint border-primary/20 text-primary", badge: "bg-primary-tint text-primary" },
  practice: { icon: "⚡", color: "bg-success-tint border-success/20 text-success", badge: "bg-success-tint text-success" },
  review: { icon: "🔄", color: "bg-reco-tint border-reco-amber/20 text-reco-amber", badge: "bg-reco-tint text-reco-amber" },
  work: { icon: "🎯", color: "bg-ai-violet-tint border-ai-violet/20 text-ai-violet", badge: "bg-ai-violet-tint text-ai-violet" },
};

export function StudyBlock({ block, onClick }: StudyBlockProps) {
  const config = studyTypeConfig[block.type] || studyTypeConfig.learn;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`${config.color} border rounded-xl p-3 cursor-pointer transition-all shadow-sm overflow-hidden h-full flex flex-col hover:shadow-md active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between mb-1.5 flex-shrink-0">
        <span className="text-lg leading-none">{config.icon}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${config.badge} capitalize leading-tight`}>
          {block.type}
        </span>
      </div>

      <h4 className="font-bold text-xs leading-tight mb-1 line-clamp-2 flex-1 overflow-hidden text-ellipsis">
        {block.title}
      </h4>
      <p className="text-[10px] opacity-75 mb-1.5 line-clamp-1 overflow-hidden text-ellipsis flex-shrink-0">
        {block.subject}
      </p>

      <div className="space-y-0.5 text-[10px] flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold">{block.duration} min</span>
        </div>
        <p className="opacity-75 line-clamp-1 leading-relaxed overflow-hidden text-ellipsis">{block.reason}</p>
      </div>

      <Link
        href={`/task/${block.taskId}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-1.5 block w-full text-center text-[10px] font-semibold bg-white/60 hover:bg-white/90 rounded-lg py-1 transition-colors flex-shrink-0"
      >
        Open Task
      </Link>
    </motion.div>
  );
}
