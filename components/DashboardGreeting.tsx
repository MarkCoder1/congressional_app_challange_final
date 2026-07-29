"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, CloudSun, Sparkles } from "lucide-react";

interface DashboardGreetingProps {
  completedToday?: number;
  hasTasks?: boolean;
}

export function DashboardGreeting({ completedToday = 0, hasTasks = true }: DashboardGreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 5) return { text: "Late night study session?", icon: Moon, emoji: "🌙" };
    if (hour < 12) return { text: "Ready for today's learning?", icon: Sun, emoji: "☀️" };
    if (hour < 14) return { text: "Keep your momentum going!", icon: CloudSun, emoji: "⚡" };
    if (hour < 17) return { text: "Great afternoon for learning!", icon: Sun, emoji: "☀️" };
    if (hour < 21) return { text: "Evening study mode activated", icon: Moon, emoji: "🌙" };
    return { text: "Night owl learning session!", icon: Moon, emoji: "🦉" };
  }, []);

  const message = useMemo(() => {
    if (completedToday >= 3) {
      return { text: "Amazing progress today!", icon: Sparkles };
    }
    if (completedToday >= 1) {
      return { text: "Great progress today. Keep it up!", icon: Sparkles };
    }
    if (!hasTasks) {
      return null;
    }
    return null;
  }, [completedToday, hasTasks]);

  const Icon = greeting.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon size={22} className="text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{greeting.text}</h2>
          {message && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Sparkles size={14} className="text-warning" />
              {message.text}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
