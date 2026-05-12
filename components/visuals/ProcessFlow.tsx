"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Info } from "lucide-react";
import { ProcessFlowData } from "@/types/visuals";

export function ProcessFlow({ data }: { data: ProcessFlowData }) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>

      {/* Inputs/Outputs pills */}
      {(data.inputs?.length || data.outputs?.length) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {data.inputs?.map((input) => (
            <span key={input} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono">
              📥 {input}
            </span>
          ))}
          {data.outputs?.map((output) => (
            <span key={output} className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-mono">
              📤 {output}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        {/* Vertical line connector */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent to-accent/50 hidden md:block" />

        <div className="space-y-6">
          {data.steps.map((step, idx) => {
            const isExpanded = expandedStep === step.id;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex gap-4 group"
              >
                {/* Step number circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white font-bold shadow-lg z-10">
                  {idx + 1}
                </div>

                {/* Step card */}
                <div className="flex-1 bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border shadow-md hover:shadow-accent/20 transition-all">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    {step.explanation && (
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>

                  <AnimatePresence>
                    {isExpanded && step.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-border"
                      >
                        <div className="flex items-start gap-2 text-sm text-foreground/80">
                          <Info size={14} className="text-accent mt-0.5 flex-shrink-0" />
                          <span>{step.explanation}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}