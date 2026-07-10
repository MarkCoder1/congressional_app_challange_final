// /lib/ai/planner/plannerPrompt.ts
import { PlannerInput } from "@/types/planner";

export function buildPlannerPrompt(input: PlannerInput): string {
  const taskDescriptions = input.tasks.map(t => {
    const deadline = t.deadline ? `, deadline: ${t.deadline}` : "";
    const practice = t.practiceCount;
    const master = t.masterCount;
    const progress = t.progress;
    const completed = t.completed ? " (completed)" : "";
    return `- ${t.title} (${t.type})${completed} | subject: ${t.subject} | progress: ${progress}%${deadline} | practice: ${practice}, master: ${master} | estimated: ${t.estimatedDuration}m | priority: ${t.priority}`;
  }).join("\n");

  return `You are an expert academic planner. Your task is to create a personalised study plan for a student.

Today is ${input.today}, ${input.dayOfWeek}, current time is ${input.currentTime}.

Here are all the student's tasks:

${taskDescriptions}

Please generate a study plan that:
- Prioritises urgent deadlines.
- Splits large assignments into stages (Research, Planning, Execution, Review, Final Validation).
- Splits lessons into Study, Practice, and Master Review sessions.
- Avoids overload (max 3 heavy sessions per day).
- Balances subjects across the week.
- Provides a clear reason for every scheduled session.
- Gives motivational and practical advice.

Return ONLY valid JSON in the following structure. Do not add any extra text, markdown, or commentary.

{
  "todayMission": {
    "goal": "string (short summary of today's focus)",
    "focusTaskId": "id of the most important task today",
    "estimatedMinutes": number (total minutes for today),
    "sessions": number (number of study sessions today),
    "focusScore": number (0-100, how focused today's plan is)
  },
  "todayTimeline": [
    {
      "taskId": "id of the task",
      "startTime": "HH:MM",
      "duration": number (minutes),
      "reason": "why this task is scheduled now",
      "priority": "high" | "medium" | "low",
      "action": "study" | "practice" | "review" | "research" | "write"
    }
  ],
  "tomorrow": [ /* same structure as todayTimeline */ ],
  "laterThisWeek": [ /* same structure */ ],
  "overdue": [ /* same structure for overdue tasks */ ],
  "weeklySummary": {
    "studyHours": number (total hours this week),
    "workload": "light" | "medium" | "heavy" | "overloaded",
    "hardestDay": "YYYY-MM-DD",
    "lightestDay": "YYYY-MM-DD"
  },
  "coach": {
    "focusSuggestion": "string (overall advice)",
    "warnings": ["string", "string"],
    "recommendations": ["string", "string"],
    "motivation": "string"
  }
}

Make sure every field is present. The plan must be realistic and helpful.`;
}