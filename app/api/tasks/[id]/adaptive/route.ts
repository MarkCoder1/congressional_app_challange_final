import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTaskExamContent } from "@/lib/tasks";
import {
  createInitialAdaptiveState,
  recordAttempt,
} from "@/lib/adaptive/engine";
import { calculateNextReview } from "@/lib/exam/spacedReview";
import { generateStudyPlan } from "@/lib/exam/studyPlan";
import type { ExamContent } from "@/types/task";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
  return NextResponse.json({
    adaptive: examContent.adaptive ?? null,
    topics: examContent.topics ?? [],
    examDate: examContent.examDate,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: Record<string, unknown> = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "record";

  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.type !== "exam") {
      return NextResponse.json({ error: "Adaptive only for exam tasks" }, { status: 400 });
    }

    const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
    let adaptive = examContent.adaptive;

    // Ensure adaptive exists, seeded from diagnostic if available
    if (!adaptive) {
      const topics = examContent.topics ?? [];
      const diag = examContent.diagnostic?.result;
      const perf = diag?.topicPerformance?.map((p) => ({
        topicId: p.topicId,
        topic: p.topic,
        accuracy: p.accuracy,
        attempted: p.attempted,
        correct: p.correct,
      }));
      adaptive = createInitialAdaptiveState(topics, perf);
    }

    if (action === "reset") {
      const topics = examContent.topics ?? [];
      const diag = examContent.diagnostic?.result;
      const perf = diag?.topicPerformance?.map((p) => ({
        topicId: p.topicId,
        topic: p.topic,
        accuracy: p.accuracy,
        attempted: p.attempted,
        correct: p.correct,
      }));
      const fresh = createInitialAdaptiveState(topics, perf);
      const updated = updateTaskExamContent(id, (ec) => ({ ...ec, adaptive: fresh }));
      return NextResponse.json({ adaptive: updated?.examContent?.adaptive ?? fresh });
    }

    if (action === "init") {
      const topics = examContent.topics ?? [];
      const diag = examContent.diagnostic?.result;
      const perf = diag?.topicPerformance?.map((p) => ({
        topicId: p.topicId,
        topic: p.topic,
        accuracy: p.accuracy,
        attempted: p.attempted,
        correct: p.correct,
      }));
      const fresh = createInitialAdaptiveState(topics, perf);
      const updated = updateTaskExamContent(id, (ec) => ({ ...ec, adaptive: fresh }));
      return NextResponse.json({ adaptive: updated?.examContent?.adaptive ?? fresh });
    }

    // Default: record
    const topicId = typeof body.topicId === "string" ? body.topicId : "";
    const topic = typeof body.topic === "string" ? body.topic : topicId;
    const questionId = typeof body.questionId === "string" ? body.questionId : "";
    const questionType = typeof body.questionType === "string" ? body.questionType : "multiple-choice";
    const correct = body.correct === true;
    const scoreRaw = typeof body.score === "number" ? body.score : correct ? 100 : 0;
    const score = Math.max(0, Math.min(100, Math.round(scoreRaw)));
    const difficulty = typeof body.difficulty === "string" ? body.difficulty : undefined;
    const timestamp = typeof body.timestamp === "string" ? body.timestamp : new Date().toISOString();

    if (!topicId || !questionId) {
      return NextResponse.json({ error: "topicId and questionId required" }, { status: 400 });
    }

    const next = recordAttempt(adaptive, {
      topicId,
      topic,
      questionId,
      questionType,
      correct,
      score,
      timestamp,
      difficulty,
    });

    // Update spaced review if due (real performance, not fake completion)
    let studyPlanUpdate: ExamContent["studyPlan"] | undefined;
    if (examContent.studyPlan) {
      const nowDate = new Date().toISOString().split("T")[0];
      const reviews = examContent.studyPlan.reviews ?? [];
      const idx = reviews.findIndex((r) => r.topicId === topicId);
      if (idx >= 0) {
        const review = reviews[idx];
        const isDue = review.nextReviewAt ? review.nextReviewAt <= nowDate : false;
        const isOverdue = review.nextReviewAt ? new Date(review.nextReviewAt) < new Date(nowDate) : false;
        if (isDue || isOverdue) {
          const adaptiveTopic = next.topics[topicId];
          const masteryLevel = adaptiveTopic?.masteryLevel ?? "Developing";
          const updatedReview = calculateNextReview(review, { score, correct, masteryLevel }, timestamp);
          const newReviews = [...reviews];
          newReviews[idx] = updatedReview;
          studyPlanUpdate = { ...examContent.studyPlan, reviews: newReviews };
        }
      }
    }

    // After adaptive changes, recalculate remaining study plan to reflect new priorities
    let finalStudyPlan = studyPlanUpdate ?? examContent.studyPlan;
    const taskForPlan = getTaskById(id);
    const currentAdaptive = next;
    if (finalStudyPlan && taskForPlan) {
      const examDate = taskForPlan.examContent?.examDate ?? examContent.examDate;
      const topics = taskForPlan.examContent?.topics ?? examContent.topics ?? [];
      if (examDate && topics.length > 0) {
        const recalc = generateStudyPlan({
          examDate,
          currentDate: new Date().toISOString().split("T")[0],
          topics,
          adaptive: currentAdaptive,
          existingPlan: finalStudyPlan,
          availableDailyMinutes: 60,
          estimatedMinutes: taskForPlan.estimatedMinutes ?? undefined,
          nowIso: new Date().toISOString(),
        });
        if (recalc) finalStudyPlan = recalc;
      }
    }

    const updated = updateTaskExamContent(id, (ec) => {
      const base: ExamContent = { ...ec, adaptive: next };
      if (finalStudyPlan) base.studyPlan = finalStudyPlan;
      return base;
    });
    return NextResponse.json({
      adaptive: updated?.examContent?.adaptive ?? next,
      studyPlan: updated?.examContent?.studyPlan ?? finalStudyPlan ?? examContent.studyPlan,
    });
  } catch (e) {
    console.error("[adaptive route] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
