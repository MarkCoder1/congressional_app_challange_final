// /lib/ai/generateLearnContent.ts
// Generates concise instructional material for an exam topic using Groq.
// Reuses existing Groq infrastructure (createCompletionWithRetry, ACTIVE_MODEL).

import { createCompletionWithRetry, parseGeneratedJson, MAX_COMPLETION_TOKENS } from "./generateTaskContent.ts";
import { ACTIVE_MODEL } from "./model.ts";

export interface LearnContent {
  explanation: string;
  keyConcepts: string[];
  example: string;
  commonMistakes: string[];
  whatYouShouldKnow: string[];
  formulas?: string[];
}

export async function generateLearnContent(input: {
  topic: string;
  subject: string;
  description?: string;
  examTitle?: string;
  masteryLevel?: string;
}): Promise<LearnContent> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `
You are an expert tutor creating a focused learning guide for a single exam topic.

Subject: "${input.subject}"
Exam: "${input.examTitle ?? input.subject}"
Topic: "${input.topic}"
Description: "${input.description ?? ""}"
Current mastery: ${input.masteryLevel ?? "unknown"}

Generate concise, student-friendly instructional material for this topic. Keep it focused and practical for exam preparation.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "explanation": "2-3 sentences explaining the core idea of the topic in plain language",
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4"],
  "example": "A concrete worked example or scenario illustrating the topic (3-5 sentences)",
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "whatYouShouldKnow": ["what to know 1", "what to know 2", "what to know 3"],
  "formulas": ["optional formula or relationship if relevant, else omit"]
}

Requirements:
- Keep explanation concise (2-3 sentences).
- keyConcepts: 3-5 items.
- example: practical, exam-relevant.
- commonMistakes: 2-3 items.
- whatYouShouldKnow: 3-4 items.
- formulas: only if relevant (e.g., math/science), else omit or empty array.
- Do NOT include React, HTML, or UI code.
`;

  const completion = await createCompletionWithRetry({
    messages: [{ role: "user", content: prompt }],
    model: ACTIVE_MODEL,
    temperature: 0.5,
    max_completion_tokens: MAX_COMPLETION_TOKENS,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  const parsed = parseGeneratedJson(content) ?? JSON.parse(content);

  // Validate and normalize
  const explanation = typeof parsed.explanation === "string" ? parsed.explanation.trim() : "";
  const keyConcepts = Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts.filter((x: unknown) => typeof x === "string" && (x as string).trim()).slice(0, 5) : [];
  const example = typeof parsed.example === "string" ? parsed.example.trim() : "";
  const commonMistakes = Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes.filter((x: unknown) => typeof x === "string" && (x as string).trim()).slice(0, 4) : [];
  const whatYouShouldKnow = Array.isArray(parsed.whatYouShouldKnow) ? parsed.whatYouShouldKnow.filter((x: unknown) => typeof x === "string" && (x as string).trim()).slice(0, 5) : [];
  const formulas = Array.isArray(parsed.formulas) ? parsed.formulas.filter((x: unknown) => typeof x === "string" && (x as string).trim()).slice(0, 5) : undefined;

  if (!explanation || keyConcepts.length === 0) {
    throw new Error("Invalid learn content from AI");
  }

  return {
    explanation,
    keyConcepts,
    example,
    commonMistakes,
    whatYouShouldKnow,
    formulas: formulas && formulas.length > 0 ? formulas : undefined,
  };
}

export function fallbackLearnContent(topic: string, subject: string): LearnContent {
  return {
    explanation: `${topic} is a key part of ${subject}. Understanding its core principles will help you apply it correctly in the exam.`,
    keyConcepts: [`Core principles of ${topic}`, `Key terminology for ${topic}`, `How ${topic} connects to ${subject}`],
    example: `For ${topic} in ${subject}, consider a practical scenario where you apply its main ideas step by step, checking each condition before moving to the next.`,
    commonMistakes: [`Confusing ${topic} with a related but different concept`, `Overlooking conditions where ${topic} does not apply`],
    whatYouShouldKnow: [`When ${topic} is relevant`, `How to recognize ${topic} in a question`, `How to verify your answer for ${topic}`],
  };
}
