// /lib/ai/schedulerPrompt.ts
import { Task } from "@/types/task";

export function buildSchedulerPrompt(tasks: Task[], today: string): string {
  const taskDescriptions = tasks
    .map((t) => {
      const deadline = t.deadline ? `, deadline: ${t.deadline}` : "";
      const practice = t.practice?.length || 0;
      const master = t.master?.length || 0;
      const progress = t.progress || 0;
      return `- ${t.title} (${t.type}) | subject: ${t.subject} | progress: ${progress}%${deadline} | practice: ${practice}, master: ${master}`;
    })
    .join("\n");

  return `You are an academic planning AI. Your task is to create a personalised study schedule for a student.

Today is ${today}.

Here are all the student's tasks:

${taskDescriptions}

Please generate a study plan that redistributes work across the week, avoids overload, groups similar subjects, prioritises overdue tasks, and keeps sessions realistic.

Return STRICT JSON with the following structure:

{
  "today": {
    "summary": "short summary of today's focus",
    "tasks": [
      {
        "taskId": "id of the task",
        "title": "task title",
        "reason": "why this task is scheduled now",
        "suggestedStart": "ISO datetime",
        "suggestedEnd": "ISO datetime",
        "durationMinutes": number,
        "priority": "high" | "medium" | "low",
        "energyLevel": "high" | "medium" | "low",
        "difficulty": 1-5,
        "whyToday": "explanation of why today"
      }
    ],
    "estimatedWorkload": total minutes,
    "bestFocusBlock": "e.g., 10:00-12:00",
    "suggestedBreaks": ["break1", "break2"],
    "mostImportantTask": "taskId",
    "expectedCompletion": "time of day"
  },
  "week": [
    {
      "date": "YYYY-MM-DD",
      "morning": [ tasks ],
      "afternoon": [ tasks ],
      "evening": [ tasks ],
      "estimatedWorkload": total minutes,
      "restRecommendation": "suggestion"
    }
  ],
  "insights": {
    "focusSuggestion": "overall focus advice",
    "warnings": ["warning1", "warning2"],
    "recommendations": ["rec1", "rec2"]
  }
}

Important:
- Assignments should be split into phases: Research, Planning, Execution, Review, Final Validation.
- Lessons should become: Study, Practice, Master Review.
- Do not schedule more than 3 heavy tasks per day.
- Ensure deadlines are met.
- Return ONLY the JSON, no extra text.`;
}
