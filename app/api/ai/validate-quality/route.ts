import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const prompt = `
You are an academic writing evaluator. Analyse the following student text and provide a quality score (0-100) and exactly 3 short feedback points (under 15 words each) covering clarity, structure, and completeness.

Text: "${text.substring(0, 3000)}"

Return ONLY a JSON object: { "score": number, "feedback": ["string", "string", "string"] }
Be strict but fair.
`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      response_format: { type: "json_object" },
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json({
      score: typeof result.score === "number" ? result.score : 50,
      feedback: Array.isArray(result.feedback) ? result.feedback.slice(0, 3) : ["Feedback not available."],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ score: 0, feedback: ["Error evaluating text."] }, { status: 500 });
  }
}