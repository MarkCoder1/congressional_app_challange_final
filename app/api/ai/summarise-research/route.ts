import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { content, type } = await req.json();
    const prompt = `
You are an AI research assistant. Summarise the following research item into 2-3 bullet points of key insights that would help a student write an assignment.

Type: ${type}
Content: "${content}"

Return ONLY a JSON object: { "summary": "string with bullet points using •" }
`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json({ summary: result.summary || "Key insights could not be generated." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ summary: "Error summarising item." }, { status: 500 });
  }
}