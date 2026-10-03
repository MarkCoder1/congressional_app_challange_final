import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks";
import { createCompletionWithRetry } from "@/lib/ai/generateTaskContent";
import { ACTIVE_MODEL } from "@/lib/ai/model";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify GROQ_API_KEY server-side
  if (!process.env.GROQ_API_KEY) {
    console.error("[study-plan/explain] GROQ_API_KEY is missing - cannot generate AI explanation");
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const examContent = task.examContent;
    if (!examContent) return NextResponse.json({ error: "No exam content" }, { status: 400 });

    const topics = examContent.topics ?? [];
    const adaptive = examContent.adaptive;
    const studyPlan = examContent.studyPlan;
    const examDate = examContent.examDate ?? "not set";
    const availableDaily = examContent.availableDailyMinutes ?? 60;

    // Build context from real data
    const topicPriorities = adaptive
      ? Object.values(adaptive.topics)
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 3)
          .map((t) => `${t.topic}: ${t.masteryScore}% ${t.masteryLevel}, priority ${t.priority}, trend ${t.trend}, ${t.reason}`)
          .join("\n")
      : "No adaptive data yet";

    const plannedSessions = studyPlan?.sessions.slice(0, 5).map((s) => `${s.date} - ${s.topicName} - ${s.type} - ${s.durationMinutes}min - ${s.reason}`).join("\n") || "No study plan yet";
    const reviews = studyPlan?.reviews.map((r) => {
      const topicName = topics.find((t) => t.id === r.topicId)?.name ?? r.topicId;
      return `${topicName}: next ${r.nextReviewAt}, interval ${r.intervalDays}d`;
    }).join("\n") || "No reviews";

    const prompt = `
You are an expert study coach explaining a personalized study plan to a student.

Exam: "${task.title}" - ${task.subject}
Exam date: ${examDate}
Available daily study time: ${availableDaily} minutes
Topics: ${topics.map((t) => t.name).join(", ")}
Top priorities:
${topicPriorities}

Planned sessions (next 5):
${plannedSessions}

Reviews:
${reviews}

Explain in 3-4 sentences, in a friendly and encouraging tone, why this study plan looks the way it does. Reference actual data: low mastery, recent mistakes, exam proximity, overdue reviews, or improvement. Do not invent data. Keep it concise and student-friendly. Do not mention that you are an AI.

Return ONLY valid JSON with this structure:
{
  "explanation": "your explanation here"
}
`;

    let completion;
    try {
      completion = await createCompletionWithRetry({
        messages: [{ role: "user", content: prompt }],
        model: ACTIVE_MODEL,
        temperature: 0.6,
        max_completion_tokens: 800,
        response_format: { type: "json_object" },
      });
    } catch (e) {
      console.error("[study-plan/explain] Groq request failed", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("[study-plan/explain] Empty response from Groq");
      return NextResponse.json({ error: "Empty AI response" }, { status: 500 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (!parsed || typeof parsed.explanation !== "string" || !parsed.explanation.trim()) {
      console.error("[study-plan/explain] Invalid AI response", content.slice(0, 500));
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    return NextResponse.json({ explanation: parsed.explanation.trim() });
  } catch (e) {
    console.error("[study-plan/explain] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
