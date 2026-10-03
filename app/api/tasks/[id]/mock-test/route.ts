import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTaskExamContent } from "@/lib/tasks";
import { generateDiagnosticQuestions } from "@/lib/ai/generateDiagnosticQuestions";
import { buildMockTestResult } from "@/lib/exam/mockTest";
import { applyDiagnosticToAdaptive } from "@/lib/adaptive/engine";
import { QUESTION_TYPE_REGISTRY } from "@/lib/questions/registry";
import { evaluateQuestion } from "@/lib/questions/evaluate";
import { generateStudyPlan } from "@/lib/exam/studyPlan";
import type { ExamContent, MockTestAttempt } from "@/types/task";
import type { QuestionAnswer, QuestionType } from "@/types/question";
import { randomUUID } from "crypto";

type MockAction = "generate" | "save" | "submit" | "retake";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
  return NextResponse.json({
    mockTest: examContent.mockTest ?? null,
    mockTestHistory: examContent.mockTestHistory ?? [],
    topics: examContent.topics ?? [],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: Record<string, unknown> = await request.json().catch(() => ({}));
  const action = (typeof body.action === "string" ? body.action : "generate") as MockAction;

  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.type !== "exam") return NextResponse.json({ error: "Only exam tasks" }, { status: 400 });

    const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
    const topics = examContent.topics ?? [];

    if (topics.length === 0) {
      return NextResponse.json({ error: "No topics for mock test" }, { status: 400 });
    }

    switch (action) {
      case "generate":
      case "retake": {
        const allAllowed = Object.keys(QUESTION_TYPE_REGISTRY).filter(
          (t) => QUESTION_TYPE_REGISTRY[t as QuestionType].implemented,
        ) as QuestionType[];

        // Mock exam should be substantial: target 15 questions (10-20 range)
        // Generate covering all topics with balanced variety
        const targetMockCount = Math.max(10, Math.min(20, Math.max(15, topics.length * 3)));
        // We reuse generateDiagnosticQuestions but need to override its internal target (6-10)
        // So we call it and if it returns fewer than target, generate additional batches for remaining topics
        let questions = await generateDiagnosticQuestions(
          {
            title: task.title,
            subject: task.subject,
            description: task.description + " Mock test should simulate the real exam with varied question formats. Include multiple categories: core, interactive, visual.",
            difficulty: task.difficulty,
            topics,
          },
          { allowedTypes: allAllowed },
        );

        // If we have fewer than target, generate more for the weakest topics (or all)
        if (questions.length < targetMockCount) {
          const remaining = targetMockCount - questions.length;
          // Generate an additional batch for all topics to fill up
          try {
            const extra = await generateDiagnosticQuestions(
              {
                title: task.title,
                subject: task.subject,
                description: task.description + " Additional mock exam questions to reach target count, varied formats.",
                difficulty: task.difficulty,
                topics,
              },
              { allowedTypes: allAllowed },
            );
            const seen = new Set(questions.map((q) => q.id));
            for (const q of extra) {
              if (questions.length >= targetMockCount) break;
              if (!seen.has(q.id)) {
                seen.add(q.id);
                questions.push(q);
              }
            }
          } catch {}
        }
        questions = questions.slice(0, targetMockCount);

        // Ensure at least 8 questions, if generator gave fewer, keep what we have
        const mockTest: MockTestAttempt = {
          id: randomUUID(),
          status: "in_progress",
          questions,
          answers: {},
          createdAt: new Date().toISOString(),
        };

        const updated = updateTaskExamContent(id, (ec) => ({
          ...ec,
          mockTest,
        }));
        return NextResponse.json({ mockTest: updated?.examContent?.mockTest ?? mockTest });
      }

      case "save": {
        const mockTest = examContent.mockTest;
        if (!mockTest || mockTest.status !== "in_progress") {
          return NextResponse.json({ error: "No in-progress mock test" }, { status: 400 });
        }
        const answers = (body.answers as Record<string, QuestionAnswer>) ?? mockTest.answers ?? {};
        const updatedMock: MockTestAttempt = { ...mockTest, answers };
        const updated = updateTaskExamContent(id, (ec) => ({
          ...ec,
          mockTest: updatedMock,
        }));
        return NextResponse.json({ mockTest: updated?.examContent?.mockTest ?? updatedMock });
      }

      case "submit": {
        const mockTest = examContent.mockTest;
        if (!mockTest || mockTest.status !== "in_progress") {
          return NextResponse.json({ error: "No in-progress mock test to submit" }, { status: 400 });
        }
        const answers = (body.answers as Record<string, QuestionAnswer>) ?? mockTest.answers ?? {};

        const result = buildMockTestResult(mockTest.questions, answers, new Date().toISOString());

        const completed: MockTestAttempt = {
          ...mockTest,
          status: "completed",
          answers,
          result,
          completedAt: result.completedAt,
        };

        // Update adaptive with mock test performance (real learning evidence)
        const mockRecords = mockTest.questions.map((q) => {
          const ev = evaluateQuestion(q, answers[q.id]);
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
          let nextAdaptive = existingAdaptive;
          if (existingAdaptive) {
            nextAdaptive = applyDiagnosticToAdaptive(existingAdaptive, topics, mockRecords);
          }
          const history = [...(ec.mockTestHistory ?? []), completed];
          const prevProgress = ec.preparationProgress ?? 0;
          const newProgress = Math.max(prevProgress, 80);

          // Recalculate study plan with new adaptive (if exists)
          let nextStudyPlan = ec.studyPlan;
          if (nextAdaptive && ec.studyPlan) {
            try {
              const recalc = generateStudyPlan({
                examDate: ec.examDate ?? examContent.examDate ?? "",
                currentDate: new Date().toISOString().split("T")[0],
                topics,
                adaptive: nextAdaptive,
                existingPlan: ec.studyPlan,
                availableDailyMinutes: 60,
                estimatedMinutes: task.estimatedMinutes ?? undefined,
                nowIso: new Date().toISOString(),
              });
              if (recalc) nextStudyPlan = recalc;
            } catch {}
          }

          return {
            ...ec,
            mockTest: completed,
            mockTestHistory: history,
            adaptive: nextAdaptive ?? existingAdaptive,
            preparationProgress: newProgress,
            studyPlan: nextStudyPlan ?? ec.studyPlan,
          };
        });

        return NextResponse.json({
          mockTest: updated?.examContent?.mockTest ?? completed,
          mockTestHistory: updated?.examContent?.mockTestHistory ?? [completed],
          result,
          adaptive: updated?.examContent?.adaptive,
          studyPlan: updated?.examContent?.studyPlan,
        });
      }

      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
  } catch (e) {
    console.error("[mock-test] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
