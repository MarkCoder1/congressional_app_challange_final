import { NextRequest, NextResponse } from "next/server";
import { getTaskById } from "@/lib/tasks";
import { generateDiagnosticQuestions } from "@/lib/ai/generateDiagnosticQuestions";
import { getNextLearningAction, rankTopicsByPriority } from "@/lib/adaptive/engine";
import { QUESTION_TYPE_REGISTRY } from "@/lib/questions/registry";
import type { ExamContent } from "@/types/task";
import type { QuestionType } from "@/types/question";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.type !== "exam") return NextResponse.json({ error: "Only exam tasks" }, { status: 400 });

    const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
    const topics = examContent.topics ?? [];
    const adaptive = examContent.adaptive;

    if (topics.length === 0) return NextResponse.json({ error: "No topics" }, { status: 400 });

    // Allow explicit topic targeting (for Review: due topic)
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const requestedTopicId = typeof (body as any)?.topicId === "string" ? (body as any).topicId : undefined;

    let targetTopicId: string | undefined;
    let targetTopicName: string | undefined;
    let difficulty: string | undefined;

    if (requestedTopicId) {
      const requested = topics.find((t) => t.id === requestedTopicId);
      if (requested) {
        targetTopicId = requested.id;
        targetTopicName = requested.name;
        difficulty = adaptive?.difficultyByTopic?.[requested.id];
      }
    }

    if (!targetTopicId && adaptive && Object.keys(adaptive.topics).length > 0) {
      const ranked = rankTopicsByPriority(adaptive, examContent.examDate);
      const action = getNextLearningAction(adaptive, examContent.examDate, topics);
      const focus = action.topicId ? adaptive.topics[action.topicId] : ranked[0];
      if (focus) {
        targetTopicId = focus.topicId;
        targetTopicName = focus.topic;
        difficulty = adaptive.difficultyByTopic?.[focus.topicId];
      }
    }

    if (!targetTopicId) {
      targetTopicId = topics[0].id;
      targetTopicName = topics[0].name;
    }

    const targetTopic = topics.find((t) => t.id === targetTopicId) ?? { id: targetTopicId!, name: targetTopicName ?? targetTopicId! };

    // Generate a single targeted question for priority topic using all supported formats
    const allAllowedTypes = Object.keys(QUESTION_TYPE_REGISTRY).filter(
      (t) => QUESTION_TYPE_REGISTRY[t as QuestionType].implemented,
    ) as QuestionType[];

    const questions = await generateDiagnosticQuestions(
      {
        title: task.title,
        subject: task.subject,
        description: task.description,
        difficulty: (difficulty as unknown as typeof task.difficulty) ?? task.difficulty,
        topics: [targetTopic],
      },
      {
        allowedTypes: allAllowedTypes,
      },
    );

    // Pick one question that matches target topic (first)
    const chosen = questions.find((q) => q.topicId === targetTopicId) ?? questions[0];
    if (!chosen) return NextResponse.json({ error: "No question generated" }, { status: 500 });

    return NextResponse.json({
      question: chosen,
      reason: `Generated targeted ${chosen.type} practice for "${targetTopicName}" (${chosen.difficulty ?? difficulty ?? "medium"}) — mastery ${adaptive?.topics[targetTopicId!]?.masteryScore ?? "?"}%.`,
    });
  } catch (e) {
    console.error("[adaptive/generate] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to generate" }, { status: 500 });
  }
}
