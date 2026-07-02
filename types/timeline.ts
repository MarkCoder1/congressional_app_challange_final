// /types/timeline.ts
import { StoredTask } from "@/lib/storage";

export type TimelineTask = {
  id: string;
  title: string;
  subject: string;
  date: string; // ISO date string
  progress: number;
  type: string;
  status?: string;
  description?: string;
};

export type ViewMode = "week" | "list";
export type FilterType = "all" | "lessons" | "assignments" | "completed";

export interface DayGroup {
  date: string;
  tasks: TimelineTask[];
}