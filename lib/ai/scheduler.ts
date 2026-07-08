// /lib/ai/scheduler.ts
import { Task } from "@/types/task";
import { AIScheduleResponse, ScheduledSession } from "@/types/schedule";

// ============================================================
// AI RESPONSE ADAPTER – converts AI output to our expected shape
// ============================================================
function adaptAIResponse(aiData: any): AIScheduleResponse {
  // Convert today's tasks
  const todaySessions: ScheduledSession[] = (aiData.today?.tasks || []).map((t: any) => ({
    taskId: t.taskId || "",
    title: t.title || "Untitled",
    subject: t.subject || "General",
    type: t.type || "lesson",
    startTime: t.suggestedStart
      ? new Date(t.suggestedStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : "09:00",
    endTime: t.suggestedEnd
      ? new Date(t.suggestedEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : "09:45",
    durationMinutes: t.durationMinutes || 45,
    reason: t.reason || "Scheduled by AI",
    priority: t.priority || "medium",
    difficulty: t.difficulty
      ? (t.difficulty <= 2 ? "easy" : t.difficulty <= 4 ? "medium" : "hard")
      : "medium",
  }));

  // Convert each week day
  const weekPlan = (aiData.week || []).map((day: any) => {
    const allSessions = [
      ...(day.morning || []),
      ...(day.afternoon || []),
      ...(day.evening || []),
    ].map((t: any) => ({
      taskId: t.taskId || "",
      title: t.title || "Untitled",
      subject: t.subject || "General",
      type: t.type || "lesson",
      startTime: t.suggestedStart
        ? new Date(t.suggestedStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : "09:00",
      endTime: t.suggestedEnd
        ? new Date(t.suggestedEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : "09:45",
      durationMinutes: t.durationMinutes || 45,
      reason: t.reason || "Scheduled by AI",
      priority: t.priority || "medium",
      difficulty: t.difficulty
        ? (t.difficulty <= 2 ? "easy" : t.difficulty <= 4 ? "medium" : "hard")
        : "medium",
    }));

    const workloadMinutes = allSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    let workload: "light" | "medium" | "heavy" | "overloaded" = "light";
    if (workloadMinutes > 240) workload = "overloaded";
    else if (workloadMinutes > 180) workload = "heavy";
    else if (workloadMinutes > 120) workload = "medium";

    return {
      date: day.date || new Date().toISOString().split('T')[0],
      workload,
      sessions: allSessions,
    };
  });

  return {
    dailyPlan: {
      date: aiData.today?.date || new Date().toISOString().split('T')[0],
      summary: aiData.today?.summary || "AI‑generated plan",
      focusTask: aiData.today?.mostImportantTask || "",
      sessions: todaySessions,
    },
    weeklyPlan: weekPlan,
    insights: {
      focusSuggestion: aiData.insights?.focusSuggestion || "Complete highest priority tasks first",
      warnings: aiData.insights?.warnings || [],
      recommendations: aiData.insights?.recommendations || [],
    },
    generatedAt: new Date().toISOString(),
    source: "ai",
  };
}

// ============================================================
// MAIN EXPORT – only AI, no fallback
// ============================================================
export async function generateSchedule(tasks: Task[]): Promise<AIScheduleResponse> {
  const currentDate = new Date().toISOString().split('T')[0];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const response = await fetch(`${baseUrl}/api/ai/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, currentDate }),
  });

  if (!response.ok) {
    throw new Error(`AI schedule API returned ${response.status}`);
  }

  const aiData = await response.json();
  return adaptAIResponse(aiData);
}