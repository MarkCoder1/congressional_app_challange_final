import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTaskExamContent } from "@/lib/tasks";
import { generateStudyPlan } from "@/lib/exam/studyPlan";
import type { ExamContent, StudyPlan, StudySession } from "@/types/task";

function todayDateOnly(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
  return NextResponse.json({
    studyPlan: examContent.studyPlan ?? null,
    examDate: examContent.examDate,
    topics: examContent.topics ?? [],
    adaptive: examContent.adaptive ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: Record<string, unknown> = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "generate";

  try {
    const task = getTaskById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.type !== "exam") return NextResponse.json({ error: "Only exam tasks" }, { status: 400 });

    const examContent: ExamContent = task.examContent ?? { topics: [], preparationProgress: 0 };
    const topics = examContent.topics ?? [];
    const examDate = (typeof body.examDate === "string" ? body.examDate : examContent.examDate) as string | undefined;
    const rawDaily = typeof body.availableDailyMinutes === "number" ? body.availableDailyMinutes : examContent.availableDailyMinutes ?? 60;
    const availableDailyMinutes = Math.max(15, Math.min(90, Math.round(rawDaily)));

    if (action === "generate" || action === "recalculate") {
      if (!examDate) return NextResponse.json({ error: "Exam date required to generate plan" }, { status: 400 });
      if (topics.length === 0) return NextResponse.json({ error: "No topics" }, { status: 400 });

      const currentDate = todayDateOnly();
      const existingPlan = examContent.studyPlan ?? null;

      // If recalculate and no existing, treat as generate
      const plan = generateStudyPlan({
        examDate,
        currentDate,
        topics,
        adaptive: examContent.adaptive ?? null,
        existingPlan: action === "recalculate" ? existingPlan : null,
        availableDailyMinutes,
        estimatedMinutes: task.estimatedMinutes ?? undefined,
        nowIso: new Date().toISOString(),
      });

      if (!plan) return NextResponse.json({ error: "Could not generate plan (check exam date and topics)" }, { status: 400 });

      const updated = updateTaskExamContent(id, (ec) => ({
        ...ec,
        examDate,
        availableDailyMinutes,
        studyPlan: plan,
      }));
      return NextResponse.json({ studyPlan: updated?.examContent?.studyPlan ?? plan, availableDailyMinutes });
    }

    if (action === "complete" || action === "missed" || action === "skip") {
      const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
      if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
      const studyPlan = examContent.studyPlan;
      if (!studyPlan) return NextResponse.json({ error: "No study plan" }, { status: 400 });

      const found = studyPlan.sessions.find((s) => s.id === sessionId);
      if (!found) return NextResponse.json({ error: "Session not found" }, { status: 404 });

      const updatedSessions = studyPlan.sessions.map((s) => {
        if (s.id === sessionId) {
          const status = action === "complete" ? "completed" : action === "missed" ? "missed" : "skipped";
          return { ...s, status } as StudySession;
        }
        return s;
      });

      // Do NOT automatically update spaced review on simple "Complete" click.
      // Spaced review intervals are only updated when actual review performance is recorded
      // via the adaptive practice/review flow (which provides real score). This separates
      // session completion from mastery/retention.
      const reviews = [...studyPlan.reviews];

      // Recalculate preparation progress: completedMinutes / plannedMinutes
      const totalPlanned = updatedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const completedMinutes = updatedSessions.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.durationMinutes, 0);
      const planProgress = totalPlanned > 0 ? Math.round((completedMinutes / totalPlanned) * 100) : 0;
      // Exam preparationProgress is broader: diagnostic 20 + study plan up to 80?
      // We keep it as max of existing and plan progress weighted
      const existingProgress = examContent.preparationProgress ?? 0;
      const newPreparationProgress = Math.max(existingProgress, Math.min(100, 20 + Math.round(planProgress * 0.6)));

      const nextPlan: StudyPlan = {
        sessions: updatedSessions,
        reviews,
        generatedAt: studyPlan.generatedAt,
        planVersion: studyPlan.planVersion,
      };

      // If missed, trigger recalculation of remaining planned sessions
      let finalPlan = nextPlan;
      let finalProgress = newPreparationProgress;
      if (action === "missed") {
        const currentDate = todayDateOnly();
        const recalc = generateStudyPlan({
          examDate: examDate ?? examContent.examDate ?? "",
          currentDate,
          topics,
          adaptive: examContent.adaptive ?? null,
          existingPlan: nextPlan,
          availableDailyMinutes,
          estimatedMinutes: task.estimatedMinutes ?? undefined,
          nowIso: new Date().toISOString(),
        });
        if (recalc) {
          finalPlan = recalc;
          const recalcCompleted = recalc.sessions.filter((s) => s.status === "completed").reduce((a, b) => a + b.durationMinutes, 0);
          const recalcTotal = recalc.sessions.reduce((a, b) => a + b.durationMinutes, 0);
          const recalcProgress = recalcTotal > 0 ? Math.round((recalcCompleted / recalcTotal) * 100) : 0;
          finalProgress = Math.max(existingProgress, Math.min(100, 20 + Math.round(recalcProgress * 0.6)));
        }
      }

      const updated = updateTaskExamContent(id, (ec) => ({
        ...ec,
        studyPlan: finalPlan,
        preparationProgress: finalProgress,
      }));

      return NextResponse.json({
        studyPlan: updated?.examContent?.studyPlan ?? finalPlan,
        preparationProgress: updated?.examContent?.preparationProgress ?? finalProgress,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (e) {
    console.error("[study-plan route] error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
