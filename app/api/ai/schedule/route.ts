// /app/api/ai/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildSchedulerPrompt } from "@/lib/ai/schedulerPrompt"; // ✅ fixed import name

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { tasks, currentDate } = await req.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Missing tasks array" }, { status: 400 });
    }

    const prompt = buildSchedulerPrompt(tasks, currentDate);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI schedule generation failed:", error);
    return NextResponse.json(
      { error: "AI schedule generation failed" },
      { status: 500 }
    );
  }
}