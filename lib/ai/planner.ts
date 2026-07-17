// /lib/ai/planner.ts
import { PlannerTask } from "@/types/planner";
import { PlannerAIOutput } from "@/types/plannerAI";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Build the prompt for the AI – explicitly includes task IDs
function buildPrompt(tasks: PlannerTask[], today: string): string {
  const taskDescriptions = tasks.map(t => {
    const deadline = t.deadline ? `, deadline: ${t.deadline}` : "";
    const progress = t.progress;
    return `- ID: ${t.id} | Title: ${t.title} (${t.type}) | subject: ${t.subject} | progress: ${progress}%${deadline} | estimated: ${t.estimatedMinutes}m | priority: ${t.priority}`;
  }).join("\n");

  return `You are an expert academic planner. Today is ${today}.

Here are the student's tasks:

${taskDescriptions}

Generate a daily study plan. **Use the exact task IDs (the ID field) from the list above.** Do NOT use the title as the ID.

Return ONLY valid JSON with the following structure:

{
  "dailyMission": {
    "title": "short goal for today",
    "description": "why this is important",
    "estimatedHours": number,
    "focusReason": "reason for focus"
  },
  "timeline": [
    {
      "taskId": "exact task ID from the list",
      "order": 1,
      "suggestedTime": "09:00",
      "duration": 45,
      "reason": "why this task should be done now"
    }
  ],
  "weeklyRecommendations": ["suggestion1", "suggestion2"],
  "taskPriorities": [
    { "taskId": "exact task ID", "priority": "high", "reason": "why" }
  ],
  "aiInsights": {
    "warnings": ["warning1"],
    "recommendations": ["rec1"],
    "focusSuggestion": "focus on X"
  }
}

Do not include any extra text or markdown. Only JSON.`;
}

export async function generateAIPlan(tasks: PlannerTask[]): Promise<PlannerAIOutput> {
  // Fallback if no API key
  if (!process.env.GROQ_API_KEY) {
    return {
      dailyMission: {
        title: "Complete your highest priority task",
        description: "You have tasks available. Start with the most urgent one.",
        estimatedHours: 1,
        focusReason: "Based on your tasks.",
      },
      timeline: tasks.map((t, idx) => ({
        taskId: t.id,
        order: idx + 1,
        suggestedTime: `${String(9 + idx).padStart(2, "0")}:00`,
        duration: t.estimatedMinutes,
        reason: "Scheduled by fallback.",
      })),
      weeklyRecommendations: ["Break large tasks into smaller sessions."],
      taskPriorities: tasks.map(t => ({
        taskId: t.id,
        priority: t.priority,
        reason: "Priority based on deadline.",
      })),
      aiInsights: {
        warnings: [],
        recommendations: ["Start with your most urgent task."],
        focusSuggestion: "Focus on the task with the earliest deadline.",
      },
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const prompt = buildPrompt(tasks, today);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content) as PlannerAIOutput;
    return parsed;
  } catch (error) {
    console.error("AI planner failed, using fallback:", error);
    return {
      dailyMission: {
        title: "Complete your highest priority task",
        description: "The AI is temporarily unavailable. Use this fallback plan.",
        estimatedHours: 1,
        focusReason: "Fallback due to AI error.",
      },
      timeline: tasks.map((t, idx) => ({
        taskId: t.id,
        order: idx + 1,
        suggestedTime: `${String(9 + idx).padStart(2, "0")}:00`,
        duration: t.estimatedMinutes,
        reason: "Fallback schedule.",
      })),
      weeklyRecommendations: ["Consider rescheduling overloaded days."],
      taskPriorities: tasks.map(t => ({
        taskId: t.id,
        priority: t.priority,
        reason: "Fallback priority.",
      })),
      aiInsights: {
        warnings: [],
        recommendations: ["Complete overdue tasks first."],
        focusSuggestion: "Focus on the task with the earliest deadline.",
      },
    };
  }
}