// /lib/ai/planner/planner.ts
import { PlannerInput, PlannerOutput } from "@/types/planner";
import { buildPlannerPrompt } from "./plannerPrompt";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function generatePlan(input: PlannerInput): Promise<PlannerOutput> {
  const prompt = buildPlannerPrompt(input);

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    return JSON.parse(content) as PlannerOutput;
  } catch (error) {
    console.error("AI planner failed:", error);
    throw new Error("Failed to generate study plan");
  }
}