import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { assignmentGoal, description } = await req.json();
    const prompt = `
You are an assignment planner. Based on the following assignment goal and description, generate a list of actionable execution steps (4-6 steps) that a student should follow to complete the assignment.

Goal: "${assignmentGoal}"
Description: "${description}"

Return ONLY a JSON object: { "steps": ["step1", "step2", ...] }
Each step should be a short phrase (e.g., "Research main concepts").
`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      response_format: { type: "json_object" },
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json({ steps: result.steps || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ steps: [] }, { status: 500 });
  }
}