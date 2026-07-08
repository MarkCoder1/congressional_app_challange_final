// /lib/scheduleStorage.ts
import { AIScheduleResponse } from "@/types/schedule";

const STORAGE_KEY = "ai_schedule_cache";

export function saveSchedule(schedule: AIScheduleResponse): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }
}

export function loadSchedule(): AIScheduleResponse | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}