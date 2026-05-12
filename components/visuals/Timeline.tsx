"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import { TimelineData } from "@/types/visuals";

export function Timeline({ data }: { data: TimelineData }) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>

      <div className="relative overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max px-4">
          {data.events.map((event, idx) => (
            <motion.div
              key={event.date}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex flex-col items-center w-56"
            >
              {/* Dot and line */}
              <div className="w-4 h-4 rounded-full bg-accent mb-2 z-10 shadow-glow" />
              {idx < data.events.length - 1 && (
                <div className="absolute top-2 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-accent/50 to-accent/30" />
              )}

              {/* Card */}
              <div
                className={`bg-card/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 cursor-pointer w-full hover:shadow-lg hover:border-accent/50
                  ${selectedEvent === event.date ? "border-accent shadow-lg" : "border-border"}`}
                onClick={() => setSelectedEvent(selectedEvent === event.date ? null : event.date)}
              >
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Calendar size={14} />
                  <span className="text-xs font-mono font-medium">{event.date}</span>
                </div>
                <h4 className="font-semibold text-foreground text-sm">{event.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{event.description}</p>

                {event.details && selectedEvent === event.date && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-2 border-t border-border"
                  >
                    <ul className="space-y-1">
                      {event.details.map((detail, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1">
                          <ChevronRight size={10} className="text-accent mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}