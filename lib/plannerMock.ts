// /lib/plannerMock.ts
export interface MockTask {
  id: string;
  title: string;
  subject: string;
  type: "lesson" | "assignment" | "practice" | "review";
  startTime: string; // "09:00"
  endTime: string;   // "09:45"
  durationMinutes: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "overdue";
  reason: string;
}

export interface MockDay {
  date: string; // "2025-02-10"
  sessions: MockTask[];
  totalMinutes: number;
  workload: "light" | "medium" | "heavy" | "overloaded";
}

export interface MockPlannerData {
  today: {
    date: string;
    summary: string;
    focusTaskId: string;
    totalSessions: number;
    totalMinutes: number;
    priorityCount: { high: number; medium: number; low: number };
  };
  timeline: MockTask[];
  upcoming: {
    tomorrow: MockTask[];
    later: MockTask[];
    overdue: MockTask[];
  };
  week: MockDay[];
  coach: {
    advice: string;
    warnings: string[];
    recommendations: string[];
    motivation: string;
  };
}

export const plannerMock: MockPlannerData = {
  today: {
    date: "2025-02-10",
    summary: "Focus on Math and Science",
    focusTaskId: "task-1",
    totalSessions: 4,
    totalMinutes: 180,
    priorityCount: { high: 2, medium: 1, low: 1 },
  },
  timeline: [
    {
      id: "task-1",
      title: "Quadratic Functions",
      subject: "Math",
      type: "lesson",
      startTime: "09:00",
      endTime: "09:45",
      durationMinutes: 45,
      priority: "high",
      status: "pending",
      reason: "Needed for tomorrow's assignment.",
    },
    {
      id: "task-2",
      title: "Research: Photosynthesis",
      subject: "Biology",
      type: "assignment",
      startTime: "10:00",
      endTime: "11:00",
      durationMinutes: 60,
      priority: "high",
      status: "pending",
      reason: "Deadline approaching.",
    },
    {
      id: "task-3",
      title: "Programming Practice",
      subject: "Computer Science",
      type: "practice",
      startTime: "11:30",
      endTime: "12:15",
      durationMinutes: 45,
      priority: "medium",
      status: "pending",
      reason: "Review concepts from yesterday.",
    },
    {
      id: "task-4",
      title: "History Review",
      subject: "History",
      type: "review",
      startTime: "14:00",
      endTime: "14:30",
      durationMinutes: 30,
      priority: "low",
      status: "pending",
      reason: "Light review session.",
    },
  ],
  upcoming: {
    tomorrow: [
      {
        id: "task-5",
        title: "English Essay Draft",
        subject: "English",
        type: "assignment",
        startTime: "09:00",
        endTime: "10:00",
        durationMinutes: 60,
        priority: "high",
        status: "pending",
        reason: "Due in two days.",
      },
    ],
    later: [
      {
        id: "task-6",
        title: "Physics Lab Report",
        subject: "Physics",
        type: "assignment",
        startTime: "10:00",
        endTime: "11:30",
        durationMinutes: 90,
        priority: "medium",
        status: "pending",
        reason: "Due next week.",
      },
    ],
    overdue: [
      {
        id: "task-7",
        title: "Math Problem Set",
        subject: "Math",
        type: "practice",
        startTime: "",
        endTime: "",
        durationMinutes: 45,
        priority: "high",
        status: "overdue",
        reason: "Due yesterday.",
      },
    ],
  },
  week: [
    { date: "2025-02-10", sessions: [], totalMinutes: 180, workload: "medium" },
    { date: "2025-02-11", sessions: [], totalMinutes: 120, workload: "light" },
    { date: "2025-02-12", sessions: [], totalMinutes: 240, workload: "heavy" },
    { date: "2025-02-13", sessions: [], totalMinutes: 150, workload: "medium" },
    { date: "2025-02-14", sessions: [], totalMinutes: 90, workload: "light" },
    { date: "2025-02-15", sessions: [], totalMinutes: 0, workload: "light" },
    { date: "2025-02-16", sessions: [], totalMinutes: 0, workload: "light" },
  ],
  coach: {
    advice: "You have enough time to finish Math before Biology.",
    warnings: ["You are falling behind in History."],
    recommendations: ["Move Programming to Friday."],
    motivation: "You completed three study sessions yesterday. Great consistency!",
  },
};