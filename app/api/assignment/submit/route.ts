import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { updateTaskProgress } from "@/lib/tasks";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      taskId,
      finalOutput,
      links = [],
      files = [],
      externalTools = [],
      answers = {},
      assignment,
    } = body;

    if (!taskId || !finalOutput?.trim()) {
      return NextResponse.json(
        { error: "Missing taskId or final output" },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 },
      );
    }

    const prompt = `
You are an expert teacher. Grade the following student assignment.

Assignment Goal: ${assignment?.goal || "Complete the given task"}

Student Submission:
${finalOutput}

Links: ${links.length}
External Tools: ${externalTools.length}

Return ONLY valid JSON:
{
  "overallScore": number,
  "rubric": { "clarity": number, "completeness": number, "structure": number },
  "checklist": [string, string, string],
  "feedback": "detailed feedback",
  "passed": boolean
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(
      completion.choices[0]?.message?.content || "{}",
    );

    // Save to DB
    const submissionData = {
      submittedAt: new Date().toISOString(),
      finalOutput,
      links,
      files,
      externalTools,
      checkpointAnswers: answers,
      aiReview: aiResult,
      status: "graded",
    };

    db.prepare(
      `
      INSERT INTO assignment_submissions (task_id, submission_data, submitted_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(task_id) DO UPDATE SET
        submission_data = excluded.submission_data,
        submitted_at = CURRENT_TIMESTAMP
    `,
    ).run(taskId, JSON.stringify(submissionData));

    updateTaskProgress(taskId, {
      assignmentStageCompleted: "submission",
      submissionValidated: true,
      markCompleted: true,
    });

    return NextResponse.json({ success: true, review: aiResult });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to grade assignment";
    console.error("[Assignment Submit Error]:", error);
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
