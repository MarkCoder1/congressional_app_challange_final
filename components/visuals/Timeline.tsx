"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import { TimelineData } from "@/types/visuals";

export function Timeline({ data }: { data: TimelineData }) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-foreground">
        {data.title}
      </h3>

      <div className="relative pl-8">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/60 via-accent/40 to-accent/10" />

        <div className="space-y-6">
          {data.events.map((event, idx) => {
            const isOpen = selectedEvent === event.date;

            return (
              <motion.div
                key={`${event.date}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[1.1rem] top-5 z-10 h-4 w-4 rounded-full bg-accent shadow-lg ring-4 ring-background" />

                <div
                  onClick={() =>
                    setSelectedEvent(
                      isOpen ? null : event.date
                    )
                  }
                  className={`cursor-pointer rounded-xl border bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-accent/50 hover:shadow-lg ${
                    isOpen
                      ? "border-accent shadow-lg"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Calendar size={14} />
                    <span className="text-xs font-mono font-medium">
                      {event.date}
                    </span>
                  </div>

                  <h4 className="font-semibold text-foreground">
                    {event.title}
                  </h4>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.description}
                  </p>

                  {event.details && event.details.length > 0 && (
                    <div className="mt-3 text-xs text-accent font-medium">
                      {isOpen ? "Click to collapse" : "Click to expand"}
                    </div>
                  )}

                  {event.details && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="mt-4 border-t border-border pt-4 overflow-hidden"
                    >
                      <ul className="space-y-2">
                        {event.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <ChevronRight
                              size={14}
                              className="mt-0.5 flex-shrink-0 text-accent"
                            />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 