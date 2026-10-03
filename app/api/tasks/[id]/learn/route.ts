import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks";
import { generateLearnContent, fallbackLearnContent } from "@/lib/ai/generateLearnContent";
import { generateDiagnosticQuestions } from "@/lib/ai/generateDiagnosticQuestions";
import { QUESTION_TYPE_REGISTRY } from "@/lib/questions/registry";
import type { QuestionType } from "@/types/question";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: Record<string, unknown> = await request.json().catch(() => ({}));
  const topicId = typeof body.topicId === "string" ? body.topicId : "";
  const topic = typeof body.topic === "string" ? body.topic : topicId;
  const action = typeof body.action === "string" ? body.action : "generate";

  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.type !== "exam") return NextResponse.json({ error: "Only exam tasks" }, { status: 400 });

    const examContent = task.examContent ?? { topics: [], preparationProgress: 0 };
    const topics = examContent.topics ?? [];
    const targetTopic = topics.find((t) => t.id === topicId) ?? (topic ? { id: topicId || topic, name: topic } : null);
    if (!targetTopic) return NextResponse.json({ error: "Topic not found" }, { status: 400 });

    const adaptiveTopic = examContent.adaptive?.topics[topicId ?? targetTopic.id];
    const masteryLevel = adaptiveTopic?.masteryLevel ?? "Not Assessed";

    // Generate learn content via Groq, with fallback
    let learnContent;
    try {
      learnContent = await generateLearnContent({
        topic: targetTopic.name,
        subject: task.subject,
        description: task.description,
        examTitle: task.title,
        masteryLevel,
      });
    } catch (e) {
      console.error("[learn] Groq failed, using fallback", e instanceof Error ? e.message : e);
      if (!process.env.GROQ_API_KEY) {
        console.error("[learn] GROQ_API_KEY is missing");
      }
      learnContent = fallbackLearnContent(targetTopic.name, task.subject);
    }

    // Generate 2-3 check questions for this topic using all formats
    let checkQuestions: unknown[] = [];
    try {
      const allAllowed = Object.keys(QUESTION_TYPE_REGISTRY).filter(
        (t) => QUESTION_TYPE_REGISTRY[t as QuestionType].implemented,
      ) as QuestionType[];
      const questions = await generateDiagnosticQuestions(
        {
          title: task.title,
          subject: task.subject,
          description: task.description,
          difficulty: task.difficulty,
          topics: [targetTopic],
        },
        { allowedTypes: allAllowed },
      );
      // Take 2-3 questions for check
      checkQuestions = questions.slice(0, 3);
    } catch (e) {
      console.error("[learn] check questions generation failed", e);
      // Fallback: empty, UI will show that check is not available but learn content still shows
      checkQuestions = [];
    }

    return NextResponse.json({
      topicId: targetTopic.id,
      topic: targetTopic.name,
      masteryLevel,
      priority: adaptiveTopic?.priority,
      trend: adaptiveTopic?.trend,
      reason: adaptiveTopic?.reason,
      learnContent,
      checkQuestions,
    });
  } catch (e) {
    console.error("[learn] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
