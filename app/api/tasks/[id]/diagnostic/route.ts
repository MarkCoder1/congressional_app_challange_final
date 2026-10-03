import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTaskExamContent } from "@/lib/tasks";
import { generateDiagnosticQuestions } from "@/lib/ai/generateDiagnosticQuestions";
import {
  buildDiagnosticResult,
  TOPIC_STATUS_BY_MASTERY,
} from "@/lib/exam/diagnostic";
import {
  applyDiagnosticToAdaptive,
  createInitialAdaptiveState,
} from "@/lib/adaptive/engine";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import type {
  DiagnosticResult,
  DiagnosticTopicPerformance,
  ExamContent,
  ExamDiagnostic,
} from "@/types/task";
import type { QuestionAnswer } from "@/types/question";

type DiagnosticAction = "generate" | "submit" | "retake" | "save";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  const examContent: ExamContent = task.examContent ?? {
    topics: [],
    preparationProgress: 0,
  };
  return NextResponse.json({
    diagnostic: examContent.diagnostic ?? null,
    topics: examContent.topics ?? [],
    preparationProgress: examContent.preparationProgress ?? 0,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Parse the body once and reuse it. Each `request.json()` consumes the
  // request stream, so calling it again later (to read `answers`) would return
  // an empty object and silently discard the submitted answers.
  const body: Record<string, unknown> = await request.json().catch(() => ({}));
  let action: DiagnosticAction = "generate";
  if (body && typeof body.action === "string") {
    action = body.action as DiagnosticAction;
  }

  try {
    const task = getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    if (task.type !== "exam") {
      return NextResponse.json(
        { error: "Diagnostic is only available for exam tasks" },
        { status: 400 },
      );
    }

    const examContent: ExamContent = task.examContent ?? {
      topics: [],
      preparationProgress: 0,
    };
    const topics = examContent.topics ?? [];

    switch (action) {
      case "generate": {
        if (topics.length === 0) {
          return NextResponse.json(
            { error: "No exam topics have been added yet." },
            { status: 400 },
          );
        }
        const questions = await generateDiagnosticQuestions({
          title: task.title,
          subject: task.subject,
          description: task.description,
          difficulty: task.difficulty,
          topics,
        });

        const now = new Date().toISOString();
        const diagnostic: ExamDiagnostic = {
          status: "in_progress",
          questions,
          answers: {},
          generatedAt: now,
          startedAt: now,
        };

        const updated = updateTaskExamContent(id, (ec) => ({
          ...ec,
          diagnostic,
        }));
        const updatedDiagnostic = updated?.examContent?.diagnostic ?? diagnostic;
        return NextResponse.json({ diagnostic: updatedDiagnostic });
      }

      case "save": {
        const diagnostic = examContent.diagnostic;
        if (!diagnostic || diagnostic.status !== "in_progress") {
          return NextResponse.json({ error: "No in-progress diagnostic." }, { status: 400 });
        }
        const answers: Record<string, QuestionAnswer> =
          body && typeof body.answers === "object"
            ? (body.answers as Record<string, QuestionAnswer>)
            : diagnostic.answers ?? {};
        const updated = updateTaskExamContent(id, (ec) => ({
          ...ec,
          diagnostic: {
            ...diagnostic,
            answers,
          },
        }));
        const current = updated?.examContent?.diagnostic ?? diagnostic;
        return NextResponse.json({ diagnostic: current });
      }

      case "submit": {
        const diagnostic = examContent.diagnostic;
        if (!diagnostic || diagnostic.status !== "in_progress") {
          return NextResponse.json(
            { error: "No in-progress diagnostic to submit." },
            { status: 400 },
          );
        }
        const answers: Record<string, QuestionAnswer> =
          body && typeof body.answers === "object"
            ? (body.answers as Record<string, QuestionAnswer>)
            : {};

        const result: DiagnosticResult = buildDiagnosticResult(
          diagnostic.questions,
          answers,
          new Date().toISOString(),
        );

        // Update topic statuses from mastery (deterministic).
        const masteryForTopic = new Map<
          string,
          DiagnosticTopicPerformance
        >();
        for (const p of result.topicPerformance) {
          masteryForTopic.set(p.topicId, p);
        }
        const updatedTopics = topics.map((t) => {
          const perf = masteryForTopic.get(t.id);
          if (!perf) return t;
          return {
            ...t,
            status: TOPIC_STATUS_BY_MASTERY[perf.mastery],
          };
        });

        const completedDiagnostic: ExamDiagnostic = {
          ...diagnostic,
          status: "completed",
          answers,
          result,
          completedAt: result.completedAt,
        };

        // Build or update adaptive state from this diagnostic submission.
        // Each question contributes a PerformanceRecord (deterministic, no AI grading).
        const diagnosticRecords = diagnostic.questions.map((q) => {
          const ans = answers[q.id];
          const ev = evaluateQuestion(q, ans);
          return {
            topicId: q.topicId ?? q.topic ?? "",
            topic: q.topic ?? q.topicId ?? "General",
            questionId: q.id,
            questionType: q.type,
            isCorrect: ev.correct,
            score: ev.score,
            difficulty: q.difficulty,
          };
        });

        const updated = updateTaskExamContent(id, (ec) => {
          const existingAdaptive = ec.adaptive;
          let nextAdaptive;
          if (!existingAdaptive) {
            // First diagnostic → seed from diagnostic performance
            const perf = result.topicPerformance.map((p) => ({
              topicId: p.topicId,
              topic: p.topic,
              accuracy: p.accuracy,
              attempted: p.attempted,
              correct: p.correct,
            }));
            nextAdaptive = createInitialAdaptiveState(topics, perf);
            // Also record each question for history (without double-counting mastery)
            // createInitial already seeded mastery, but history should reflect actual questions
            // So apply records on top of a clean seeded state that has no history.
            // To avoid double mastery, rebuild from empty and apply records.
            const seededEmpty = createInitialAdaptiveState(topics);
            nextAdaptive = applyDiagnosticToAdaptive(seededEmpty, topics, diagnosticRecords);
          } else {
            nextAdaptive = applyDiagnosticToAdaptive(existingAdaptive, topics, diagnosticRecords);
          }

          return {
            ...ec,
            topics: updatedTopics,
            preparationProgress: 20,
            diagnostic: completedDiagnostic,
            adaptive: nextAdaptive,
          };
        });
        const current = updated?.examContent ?? examContent;
        return NextResponse.json({
          diagnostic: current.diagnostic ?? completedDiagnostic,
          preparationProgress: current.preparationProgress ?? 20,
          topics: current.topics ?? updatedTopics,
          adaptive: current.adaptive,
        });
      }

      case "retake": {
        if (topics.length === 0) {
          return NextResponse.json(
            { error: "No exam topics have been added yet." },
            { status: 400 },
          );
        }
        const questions = await generateDiagnosticQuestions({
          title: task.title,
          subject: task.subject,
          description: task.description,
          difficulty: task.difficulty,
          topics,
        });
        const now = new Date().toISOString();
        const freshDiagnostic: ExamDiagnostic = {
          status: "in_progress",
          questions,
          answers: {},
          generatedAt: now,
          startedAt: now,
        };
        const updated = updateTaskExamContent(id, (ec) => ({
          ...ec,
          diagnostic: freshDiagnostic,
        }));
        const current = updated?.examContent ?? examContent;
        return NextResponse.json({
          diagnostic: current.diagnostic ?? freshDiagnostic,
        });
      }

      default:
        return NextResponse.json(
          { error: "Unsupported action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[diagnostic route] error", error);
    const message =
      error instanceof Error ? error.message : "Couldn't prepare the diagnostic";
    return NextResponse.json(
      { error: message || "Couldn't prepare the diagnostic. Try again." },
      { status: 500 },
    );
  }
}
