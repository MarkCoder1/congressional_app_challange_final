// /lib/ai/generateTaskContent.ts
import { Task, LearningContent, AssignmentContent } from "@/types/task";
import Groq from "groq-sdk";
import type { ChatCompletion } from "groq-sdk/resources/chat/completions";
import { ACTIVE_MODEL } from "./model";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// ---------- LESSON HELPERS (unchanged) ----------
interface FallbackContent {
  learningContent: LearningContent;
  learningMaps: any[];
  practice: any[];
  master: any[];
}

// gpt-oss models spend tokens on hidden reasoning before the JSON payload.
// Without an explicit cap the provider default truncates long generations
// mid-JSON, which is the root cause of json_validate_failed / short sets.
// The cap must ALSO keep prompt + completion under the org's tokens-per-minute
// budget (free tier: 8k TPM rejects oversized requests with 413 before
// generation even starts), so it is intentionally modest.
const MAX_COMPLETION_TOKENS = 5500;
const RATE_LIMIT_BACKOFF_MS = 21_000;

function isRateLimitError(error: unknown): boolean {
  const anyErr = error as any;
  const status = anyErr?.status ?? anyErr?.error?.status;
  const code = anyErr?.error?.code ?? anyErr?.code;
  return (
    code === "rate_limit_exceeded" ||
    status === 413 ||
    status === 429 ||
    String(anyErr?.message ?? "").includes("rate_limit_exceeded")
  );
}

/** Chat completion with backoff-retry on per-minute rate limit rejections. */
async function createCompletionWithRetry(
  params: Parameters<Groq["chat"]["completions"]["create"]>[0],
): Promise<ChatCompletion> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return (await groq.chat.completions.create({
        ...params,
        stream: false,
      })) as ChatCompletion;
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === 3) throw error;
      console.warn(
        `[AI DEBUG] rate limit reached — retrying in ${RATE_LIMIT_BACKOFF_MS / 1000}s (attempt ${attempt + 1}/3)`,
      );
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_BACKOFF_MS));
    }
  }
  throw lastError;
}

// groq-sdk surfaces provider errors as { status, error: { code, failed_generation } }.
// failed_generation contains the raw model output even when JSON validation failed.
function extractFailedGeneration(error: unknown): string | null {
  const anyErr = error as any;
  const raw =
    anyErr?.error?.failed_generation ?? anyErr?.failed_generation ?? null;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function isJsonValidateError(error: unknown): boolean {
  return (
    (error as any)?.error?.code === "json_validate_failed" ||
    (error as any)?.code === "json_validate_failed"
  );
}

/**
 * Parses model JSON output, recovering from truncated/malformed payloads.
 * Strategy: direct parse → strip code fences/preamble → progressive trim:
 * walk the text tracking string state and bracket depth, then repeatedly
 * cut back to the last structurally-complete position and append whatever
 * closers are still open. This salvages e.g. a truncated "master" array
 * without discarding the valid sections that precede it.
 */
function parseGeneratedJson(rawInput: string): any | null {
  if (!rawInput || !rawInput.trim()) return null;

  // Strip markdown fences / prose around the payload.
  let raw = rawInput.trim();
  const fenceStart = raw.indexOf("```");
  if (fenceStart !== -1) {
    const afterFence = raw.slice(fenceStart + 3).replace(/^json/i, "");
    const fenceEnd = afterFence.indexOf("```");
    raw = (fenceEnd !== -1 ? afterFence.slice(0, fenceEnd) : afterFence).trim();
  }
  const objStart = raw.indexOf("{");
  if (objStart > 0) raw = raw.slice(objStart);
  raw = raw.trim();

  try {
    return JSON.parse(raw);
  } catch {
    /* fall through to repair */
  }

  interface CutPoint {
    pos: number; // index just past a completed structural unit
    closers: string; // brackets that must be appended, outermost-first
  }
  const cutPoints: CutPoint[] = [];
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      stack.push("}");
    } else if (ch === "[") {
      stack.push("]");
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      // Record every completed object/array as a candidate cut point,
      // longest candidates last so we try them from richest to poorest.
      cutPoints.push({ pos: i + 1, closers: stack.slice().reverse().join("") });
    }
  }

  for (let i = cutPoints.length - 1; i >= 0 && i > cutPoints.length - 80; i--) {
    const { pos, closers } = cutPoints[i];
    let candidate = raw.slice(0, pos).replace(/[,\s]+$/, "");
    if (candidate.length < raw.length * 0.3) break; // don't salvage tiny scraps
    candidate += closers;
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

// ---------- QUESTION SANITIZATION ----------
interface SanitizeResult {
  questions: any[];
  dropped: number;
}

/**
 * Per-question validation. A malformed individual question is dropped
 * without poisoning the rest of the set. Normalizes option shape
 * ({id,text}[]), re-keys ids opt1..optN, and resolves correctAnswer
 * against option ids or exact option texts.
 */
function sanitizeQuestionList(rawQuestions: unknown): SanitizeResult {
  const questions: any[] = [];
  let dropped = 0;
  if (!Array.isArray(rawQuestions)) return { questions, dropped };

  const seenTexts = new Set<string>();
  for (const q of rawQuestions) {
    try {
      if (!q || typeof q !== "object") { dropped++; continue; }
      const text = typeof q.text === "string" ? q.text.trim() : "";
      if (!text || seenTexts.has(text)) { dropped++; continue; }

      let options = Array.isArray(q.options) ? q.options : [];
      options = options
        .map((opt: any) =>
          typeof opt === "string"
            ? { id: "", text: opt }
            : { id: typeof opt?.id === "string" ? opt.id : "", text: typeof opt?.text === "string" ? opt.text : "" },
        )
        .filter((opt: any) => opt.text.trim() !== "");
      if (options.length < 2) { dropped++; continue; }

      const normalizedOptions = options.slice(0, 6).map((opt: any, idx: number) => ({
        id: opt.id || `opt${idx + 1}`,
        text: opt.text.trim(),
      }));
      // Guarantee unique ids.
      const usedIds = new Set<string>();
      normalizedOptions.forEach((opt: any, idx: number) => {
        if (usedIds.has(opt.id)) opt.id = `opt${idx + 1}`;
        usedIds.add(opt.id);
      });

      let correctAnswer =
        typeof q.correctAnswer === "string" ? q.correctAnswer.trim() : "";
      const byId = normalizedOptions.find((o: any) => o.id === correctAnswer);
      if (!byId) {
        const byText = normalizedOptions.find((o: any) => o.text === correctAnswer);
        correctAnswer = byText ? byText.id : normalizedOptions[0].id;
      }

      seenTexts.add(text);
      questions.push({
        id: typeof q.id === "string" && q.id.trim() !== "" ? q.id : crypto.randomUUID(),
        text,
        hint: typeof q.hint === "string" && q.hint.trim() !== "" ? q.hint : undefined,
        options: normalizedOptions,
        correctAnswer,
        explanation:
          typeof q.explanation === "string" && q.explanation.trim() !== ""
            ? q.explanation
            : "",
        category: typeof q.category === "string" && q.category.trim() !== "" ? q.category : "general",
      });
    } catch {
      dropped++;
    }
  }
  return { questions, dropped };
}

/**
 * AI-first assembly: keep every sanitized AI question, then top off from the
 * topic-aware fallback pool only up to minCount, skipping duplicates.
 * Fallback never replaces valid AI data.
 */
function topOffFromFallback(
  aiQuestions: any[],
  fallbackPool: any[],
  minCount: number,
): any[] {
  const combined = [...aiQuestions];
  const seen = new Set(combined.map((q) => q.text));
  for (const fbQ of fallbackPool) {
    if (combined.length >= minCount) break;
    if (!fbQ || seen.has(fbQ.text)) continue;
    seen.add(fbQ.text);
    combined.push(fbQ);
  }
  return combined;
}

function generateSmartFallbackQuestions(
  subject: string,
  description: string,
  level: "practice" | "master",
  targetCount: number,
  title = "",
  excludeTexts: Set<string> = new Set(),
): any[] {
  const questions: any[] = [];
  const used = new Set<string>(excludeTexts);
  const topicLabel = (title || description || subject).trim();
  const topic = `${title} ${description}`.toLowerCase();
  // Master set starts rotated so it never mirrors the practice order.
  const startOffset = level === "master" ? 1 : 0;
  const isMath =
    subject.toLowerCase().includes("math") ||
    topic.includes("quadratic") ||
    topic.includes("equation");
  const isHistory =
    subject.toLowerCase().includes("history") ||
    topic.includes("timeline") ||
    topic.includes("event");
  const isBio =
    subject.toLowerCase().includes("bio") ||
    topic.includes("cell") ||
    topic.includes("organ") ||
    topic.includes("system");
  const isProgramming =
    subject.toLowerCase().includes("programming") ||
    topic.includes("code") ||
    topic.includes("algorithm");
  const isEcon =
    subject.toLowerCase().includes("economic") ||
    topic.includes("supply") ||
    topic.includes("demand");

  const addQuestion = (q: any) => {
    if (!used.has(q.text)) {
      used.add(q.text);
      questions.push(q);
    }
  };

  if (isMath) {
    const mathQuestions = [
      {
        text: "What is the vertex of f(x) = x² - 4x + 3?",
        hint:
          level === "practice" ? "Use -b/(2a) for x-coordinate." : undefined,
        options: [
          { id: "opt1", text: "(2, -1)" },
          { id: "opt2", text: "(-2, 1)" },
          { id: "opt3", text: "(1, -2)" },
          { id: "opt4", text: "(-1, 2)" },
        ],
        correctAnswer: "opt1",
        explanation: "Vertex at (2,-1).",
        category: "algebra",
      },
      {
        text: "What are the roots of x² - 4x + 3 = 0?",
        hint: level === "practice" ? "Factor the quadratic." : undefined,
        options: [
          { id: "opt1", text: "x = 1 and x = 3" },
          { id: "opt2", text: "x = -1 and x = -3" },
          { id: "opt3", text: "x = 2 and x = 4" },
          { id: "opt4", text: "x = 0 and x = 4" },
        ],
        correctAnswer: "opt1",
        explanation: "Roots at 1 and 3.",
        category: "algebra",
      },
      {
        text: "What is the y‑intercept of f(x) = x² - 4x + 3?",
        hint: level === "practice" ? "Set x = 0." : undefined,
        options: [
          { id: "opt1", text: "3" },
          { id: "opt2", text: "0" },
          { id: "opt3", text: "-3" },
          { id: "opt4", text: "1" },
        ],
        correctAnswer: "opt1",
        explanation: "f(0)=3.",
        category: "algebra",
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        ...mathQuestions[(i + startOffset) % mathQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else if (isHistory) {
    const historyQuestions = [
      {
        text: "What was a major turning point in this historical period?",
        hint: "Look for a decisive event.",
        options: [
          { id: "opt1", text: "A significant battle or treaty" },
          { id: "opt2", text: "A minor incident" },
          { id: "opt3", text: "An unrelated event" },
          { id: "opt4", text: "A modern invention" },
        ],
        correctAnswer: "opt1",
        explanation: "Key events often define historical eras.",
        category: "history",
      },
      {
        text: "Who was a key figure during this time?",
        hint: "Think of influential leaders or thinkers.",
        options: [
          { id: "opt1", text: "A prominent historical figure" },
          { id: "opt2", text: "A fictional character" },
          { id: "opt3", text: "A modern celebrity" },
          { id: "opt4", text: "An anonymous person" },
        ],
        correctAnswer: "opt1",
        explanation: "Historical figures shape the course of history.",
        category: "history",
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        ...historyQuestions[(i + startOffset) % historyQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else if (isBio) {
    const bioQuestions = [
      {
        text: "What is a key organ in the human respiratory system?",
        hint: "Think about gas exchange.",
        options: [
          { id: "opt1", text: "Lungs" },
          { id: "opt2", text: "Heart" },
          { id: "opt3", text: "Stomach" },
          { id: "opt4", text: "Liver" },
        ],
        correctAnswer: "opt1",
        explanation: "Lungs are responsible for gas exchange.",
        category: "biology",
      },
      {
        text: "Which process releases energy from glucose?",
        hint: "Occurs in mitochondria.",
        options: [
          { id: "opt1", text: "Cellular respiration" },
          { id: "opt2", text: "Photosynthesis" },
          { id: "opt3", text: "Digestion" },
          { id: "opt4", text: "Fermentation" },
        ],
        correctAnswer: "opt1",
        explanation: "Cellular respiration releases energy.",
        category: "biology",
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        ...bioQuestions[(i + startOffset) % bioQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else if (isProgramming) {
    const progQuestions = [
      {
        text: "What is a variable in programming?",
        hint: "A storage location for data.",
        options: [
          { id: "opt1", text: "A named container for data" },
          { id: "opt2", text: "A function" },
          { id: "opt3", text: "A loop" },
          { id: "opt4", text: "A comment" },
        ],
        correctAnswer: "opt1",
        explanation: "Variables store data.",
        category: "programming",
      },
      {
        text: "What does a conditional (if/else) do?",
        hint: "Controls program flow based on conditions.",
        options: [
          { id: "opt1", text: "Executes code only if a condition is true" },
          { id: "opt2", text: "Repeats code multiple times" },
          { id: "opt3", text: "Defines a function" },
          { id: "opt4", text: "Imports a library" },
        ],
        correctAnswer: "opt1",
        explanation: "Conditionals branch execution.",
        category: "programming",
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        ...progQuestions[(i + startOffset) % progQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else if (isEcon) {
    const econQuestions = [
      {
        text: "What does the law of demand state?",
        hint: "Relationship between price and quantity.",
        options: [
          { id: "opt1", text: "Price up → quantity down" },
          { id: "opt2", text: "Price up → quantity up" },
          { id: "opt3", text: "No relationship" },
          { id: "opt4", text: "Price constant" },
        ],
        correctAnswer: "opt1",
        explanation: "Demand slopes downward.",
        category: "economics",
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        ...econQuestions[(i + startOffset) % econQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else {
    const aspects = [
      {
        text: `Which statement best describes the main focus of "${topicLabel}"?`,
        explanation: `The central ideas of ${topicLabel} are the foundation for everything else in ${subject}.`,
      },
      {
        text: `When studying "${topicLabel}", which approach builds understanding most effectively?`,
        explanation: `Breaking ${topicLabel} into its key components and connecting them to what you already know works best.`,
      },
      {
        text: `How does "${topicLabel}" relate to the wider field of ${subject}?`,
        explanation: `${topicLabel} is best understood through its role and applications within ${subject}.`,
      },
      {
        text: `What should you verify before applying ideas from "${topicLabel}" to a new situation?`,
        explanation: `Checking that the conditions of ${topicLabel} actually match the new situation prevents common mistakes.`,
      },
    ];
    for (let i = 0; i < targetCount; i++) {
      const aspect = aspects[(i + startOffset) % aspects.length];
      addQuestion({
        id: crypto.randomUUID(),
        text: aspect.text,
        hint: level === "practice" ? "Think about the main ideas." : undefined,
        options: [
          { id: "opt1", text: `A core idea of ${topicLabel}` },
          { id: "opt2", text: `An unrelated ${subject} topic` },
          { id: "opt3", text: `A trivial detail with no connection` },
          { id: "opt4", text: `A common misconception` },
        ],
        correctAnswer: "opt1",
        explanation: aspect.explanation,
        category: "general",
      });
    }
  }

  // Subject pools are small; pad with topic-parameterized frames so a true
  // fallback still yields a full question set instead of collapsing to
  // however many unique texts the pool happens to contain.
  if (questions.length < targetCount) {
    const isMasterLevel = level === "master";
    const frames = isMasterLevel
      ? [
          (t: string) => ({
            text: `Analyse "${t}": which factor was most decisive in shaping its outcome?`,
            explanation: `Weighing causes within ${t} reveals which factors mattered most.`,
          }),
          (t: string) => ({
            text: `How would you evaluate competing interpretations of "${t}"?`,
            explanation: `Comparing interpretations of ${t} strengthens analytical understanding.`,
          }),
          (t: string) => ({
            text: `What evidence best supports the key claims about "${t}"?`,
            explanation: `Grounding claims in evidence is essential when studying ${t}.`,
          }),
          (t: string) => ({
            text: `Which consequence of "${t}" had the widest impact, and why?`,
            explanation: `Assessing impact helps prioritise the most significant effects of ${t}.`,
          }),
        ]
      : [
          (t: string) => ({
            text: `Which statement best describes the main focus of "${t}"?`,
            explanation: `The central ideas of ${t} are the foundation for everything else in ${subject}.`,
          }),
          (t: string) => ({
            text: `When studying "${t}", which approach builds understanding most effectively?`,
            explanation: `Breaking ${t} into key components and connecting them to prior knowledge works best.`,
          }),
          (t: string) => ({
            text: `How does "${t}" relate to the wider field of ${subject}?`,
            explanation: `${t} is best understood through its role and applications within ${subject}.`,
          }),
          (t: string) => ({
            text: `What should you verify before applying ideas from "${t}" to a new situation?`,
            explanation: `Checking that the conditions of ${t} match the new situation prevents common mistakes.`,
          }),
        ];
    let frameIdx = startOffset;
    while (questions.length < targetCount && frameIdx < targetCount * 4) {
      const frame = frames[frameIdx % frames.length];
      const aspect = frame(topicLabel);
      addQuestion({
        id: crypto.randomUUID(),
        text: aspect.text,
        hint:
          !isMasterLevel && level === "practice"
            ? "Think about the main ideas."
            : undefined,
        options: [
          { id: "opt1", text: `A core idea of ${topicLabel}` },
          { id: "opt2", text: `An unrelated ${subject} topic` },
          { id: "opt3", text: `A trivial detail with no connection` },
          { id: "opt4", text: `A common misconception` },
        ],
        correctAnswer: "opt1",
        explanation: aspect.explanation,
        category: "general",
      });
      frameIdx++;
    }
  }

  return questions.slice(0, targetCount);
}

function getFallbackLearningMaps(subject: string): any[] {
  const s = subject.toLowerCase();
  if (s.includes("ph") || s.includes("chemistry")) {
    return [
      {
        presetId: "ph-scale-diagram",
        type: "diagram",
        data: {
          parts: [
            {
              label: "Acidic (0-6)",
              description: "High H+ concentration",
              position: { x: 20, y: 50 },
            },
            {
              label: "Neutral (7)",
              description: "Pure water",
              position: { x: 50, y: 50 },
            },
            {
              label: "Basic (8-14)",
              description: "Low H+ concentration",
              position: { x: 80, y: 50 },
            },
          ],
        },
      },
      {
        presetId: "ph-examples",
        type: "cards",
        data: {
          cards: [
            { title: "Stomach Acid", content: "pH ~ 1.5-3.5" },
            { title: "Lemon Juice", content: "pH ~ 2" },
            { title: "Coffee", content: "pH ~ 5" },
            { title: "Baking Soda", content: "pH ~ 8.5" },
            { title: "Ammonia", content: "pH ~ 11" },
            { title: "Bleach", content: "pH ~ 12-13" },
          ],
        },
      },
    ];
  }
  if (s.includes("math") || s.includes("quadratic")) {
    return [
      {
        presetId: "quadratic-graph",
        type: "graph",
        data: {
          points: [
            { x: -2, y: 15 },
            { x: -1, y: 8 },
            { x: 0, y: 3 },
            { x: 1, y: 0 },
            { x: 2, y: -1 },
            { x: 3, y: 0 },
            { x: 4, y: 3 },
            { x: 5, y: 8 },
          ],
          xLabel: "x",
          yLabel: "f(x)",
          equation: "f(x) = x² - 4x + 3",
        },
      },
      {
        presetId: "quadratic-formula",
        type: "cards",
        data: {
          cards: [
            { title: "Standard Form", content: "ax² + bx + c = 0" },
            { title: "Vertex Form", content: "a(x-h)² + k" },
            { title: "Discriminant", content: "Δ = b² - 4ac" },
            { title: "Quadratic Formula", content: "x = (-b ± √Δ) / 2a" },
          ],
        },
      },
    ];
  }
  return [
    {
      presetId: "concept-map",
      type: "node-map",
      data: {
        nodes: [
          {
            id: "core",
            label: "Core Concept",
            connections: ["related1", "related2"],
          },
          { id: "related1", label: "Related Idea 1", connections: ["core"] },
          { id: "related2", label: "Related Idea 2", connections: ["core"] },
        ],
      },
    },
  ];
}

const fullFallback = (
  subject: string,
  description?: string,
  title?: string,
  difficulty?: string,
): FallbackContent => {
  const topicLabel = (title || "").trim() || subject.trim() || "this topic";
  const focusArea = (description || "").trim();
  const difficultyNote =
    difficulty === "hard"
      ? "At this difficulty level, expect analysis and synthesis rather than simple recall."
      : difficulty === "easy"
        ? "This level focuses on reviewing the basic concepts."
        : "This level focuses on applying your understanding.";
  const { practice, master } = buildFallbackQuestionSets(
    subject,
    description || "",
    title,
  );

  return {
    learningContent: {
      overview: `An introductory overview of ${topicLabel}${focusArea ? `, focusing on ${focusArea}` : ""} within ${subject}. ${difficultyNote}`,
      keyPoints: [
        `Core principles of ${topicLabel}`,
        focusArea
          ? `Key terminology used in ${focusArea}`
          : `Key terminology for ${topicLabel}`,
        `How ${topicLabel} applies to real-world scenarios`,
        `Common patterns, exceptions, and misconceptions around ${topicLabel}`,
      ],
      example: `For example, consider how ${topicLabel} appears in everyday situations within ${subject}.${focusArea ? ` A typical case would involve working through: ${focusArea}.` : " A typical case would involve applying its main ideas step by step..."}`,
      steps: [
        `Review the primary definition and components of ${topicLabel}`,
        `Analyze a concrete ${subject} example step by step`,
        `Practice with guided exercises related to ${topicLabel}`,
        "Test your understanding with the practice questions",
      ],
      proTip: subject.toLowerCase().includes("math")
        ? "Always double-check your calculations and units."
        : `Take notes on key ${topicLabel} concepts as you learn them for better retention.`,
    },
    learningMaps: getFallbackLearningMaps(`${subject} ${topicLabel}`),
    practice,
    master,
  };
};

function buildFallbackQuestionSets(
  subject: string,
  description: string,
  title?: string,
): Pick<FallbackContent, "practice" | "master"> {
  const practice = generateSmartFallbackQuestions(
    subject,
    description,
    "practice",
    10,
    title,
  );
  const masterWithExclusions = generateSmartFallbackQuestions(
    subject,
    description,
    "master",
    20,
    title,
    new Set(practice.map((q) => q.text as string)),
  );
  // Guarantee a non-empty master set even when pools are tiny.
  const master =
    masterWithExclusions.length > 0
      ? masterWithExclusions
      : generateSmartFallbackQuestions(
          subject,
          description,
          "master",
          Math.max(5, practice.length),
          title,
        );
  return { practice, master };
}

function mergeLearningContent(
  aiContent: any,
  fallbackContent: LearningContent,
): LearningContent {
  if (!aiContent || typeof aiContent !== "object") return fallbackContent;
  return {
    overview:
      typeof aiContent.overview === "string" && aiContent.overview.trim() !== ""
        ? aiContent.overview
        : fallbackContent.overview,
    keyPoints:
      Array.isArray(aiContent.keyPoints) && aiContent.keyPoints.length > 0
        ? aiContent.keyPoints
        : fallbackContent.keyPoints,
    example:
      typeof aiContent.example === "string" && aiContent.example.trim() !== ""
        ? aiContent.example
        : fallbackContent.example,
    steps:
      Array.isArray(aiContent.steps) && aiContent.steps.length > 0
        ? aiContent.steps
        : fallbackContent.steps,
    proTip:
      typeof aiContent.proTip === "string" && aiContent.proTip.trim() !== ""
        ? aiContent.proTip
        : fallbackContent.proTip,
  };
}

// ---------- ASSIGNMENT HELPERS ----------
function getDefaultAssignmentContent(
  title: string,
  description: string,
): AssignmentContent {
  return {
    goal: `Complete the assignment: ${title}. ${description}`,
    understanding: {
      summary: `Understand the core concepts of ${title}.`,
      successCriteria: [
        "Explain the main ideas in your own words",
        "Identify key components",
        "Apply concepts to a practical scenario",
      ],
    },
    plan: {
      steps: [
        {
          id: "step1",
          title: "Research",
          description: "Gather information from provided sources.",
        },
        {
          id: "step2",
          title: "Draft",
          description: "Create an outline and first draft.",
        },
        {
          id: "step3",
          title: "Review & Submit",
          description: "Revise based on feedback and submit.",
        },
      ],
    },
    researchGuide: {
      whatToSearch: [`${title} basics`, "real‑world applications"],
      suggestedSources: [
        "Textbook chapters",
        "Academic journals",
        "Trusted websites",
      ],
      keywords: [title, "assignment", "analysis"],
    },
    execution: {
      structure: ["Introduction", "Body", "Conclusion"],
    },
    checkpoints: [
      { id: "cp1", question: "What is the main objective of this assignment?" },
      { id: "cp2", question: "List three resources you plan to use." },
      { id: "cp3", question: "Describe how you will structure your work." },
    ],
    validation: {
      checklist: [
        "All questions answered",
        "Sources cited properly",
        "Clear and logical structure",
      ],
      rubric: {
        clarity: 70,
        completeness: 70,
        structure: 70,
      },
    },
  };
}

// ---------- ASSIGNMENT NORMALIZATION ----------
function normalizeAssignmentAIContent(
  parsed: any,
  input: { title: string; description: string; subject: string },
): AssignmentContent {
  const defaultContent = () =>
    getDefaultAssignmentContent(input.title, input.description);
  const assignmentContent: AssignmentContent = {
    goal:
      parsed.goal ||
      defaultContent().goal,
    understanding: {
      summary:
        parsed.understanding?.summary || "Understand the core concepts.",
      successCriteria: Array.isArray(parsed.understanding?.successCriteria)
        ? parsed.understanding.successCriteria.slice(0, 3)
        : defaultContent().understanding.successCriteria,
    },
    plan: {
      steps:
        Array.isArray(parsed.plan?.steps) && parsed.plan.steps.length >= 3
          ? parsed.plan.steps
              .slice(0, 3)
              .map((step: any, idx: number) => ({
                id: step.id || `step${idx + 1}`,
                title: step.title || `Step ${idx + 1}`,
                description:
                  typeof step.description === "string" ? step.description : "",
              }))
          : defaultContent().plan.steps,
    },
    researchGuide: {
      whatToSearch: Array.isArray(parsed.researchGuide?.whatToSearch)
        ? parsed.researchGuide.whatToSearch.slice(0, 3)
        : ["Basics", "Applications", "Examples"],
      suggestedSources: Array.isArray(
        parsed.researchGuide?.suggestedSources,
      )
        ? parsed.researchGuide.suggestedSources.slice(0, 3)
        : ["Textbook", "Academic papers", "Reputable websites"],
      keywords: Array.isArray(parsed.researchGuide?.keywords)
        ? parsed.researchGuide.keywords.slice(0, 3)
        : [input.title, input.subject, "assignment"],
    },
    execution: {
      structure:
        Array.isArray(parsed.execution?.structure) &&
        parsed.execution.structure.length >= 2
          ? parsed.execution.structure
          : ["Introduction", "Main Body", "Conclusion"],
    },
    checkpoints:
      Array.isArray(parsed.checkpoints) && parsed.checkpoints.length > 0
        ? parsed.checkpoints.slice(0, 3).map((cp: any, idx: number) => ({
            id: cp.id || `cp${idx + 1}`,
            question:
              typeof cp.question === "string" ? cp.question : "",
            expectedAnswerHint:
              typeof cp.expectedAnswerHint === "string"
                ? cp.expectedAnswerHint
                : undefined,
          }))
        : defaultContent().checkpoints,
    validation: {
      checklist: Array.isArray(parsed.validation?.checklist)
        ? parsed.validation.checklist.slice(0, 3)
        : ["Clear objective", "Well‑structured", "Evidence provided"],
      rubric: {
        clarity:
          typeof parsed.validation?.rubric?.clarity === "number"
            ? Math.min(100, Math.max(0, parsed.validation.rubric.clarity))
            : 70,
        completeness:
          typeof parsed.validation?.rubric?.completeness === "number"
            ? Math.min(
                100,
                Math.max(0, parsed.validation.rubric.completeness),
              )
            : 70,
        structure:
          typeof parsed.validation?.rubric?.structure === "number"
            ? Math.min(100, Math.max(0, parsed.validation.rubric.structure))
            : 70,
      },
    },
  };
  return assignmentContent;
}

// ---------- LESSON RESULT ASSEMBLY ----------
/**
 * Shared by the success path and the salvage path. Applies per-section
 * validation: valid AI sections are always preserved; fallback only fills
 * gaps below minimum counts.
 */
function assembleLessonResult(parsed: any, fallback: FallbackContent): Partial<Task> {
  const practiceSanitized = sanitizeQuestionList(parsed?.practice);
  const masterSanitized = sanitizeQuestionList(parsed?.master);

  let finalPractice = topOffFromFallback(
    practiceSanitized.questions,
    fallback.practice,
    5,
  ).slice(0, 12);
  // Master must not mirror the practice set.
  const practiceTexts = new Set(finalPractice.map((q: any) => q.text));
  let finalMaster = topOffFromFallback(
    masterSanitized.questions.filter((q: any) => !practiceTexts.has(q.text)),
    fallback.master,
    5,
  ).slice(0, 20);

  let learningMaps = parsed?.learningMaps || [];
  if (
    learningMaps.length === 0 ||
    !learningMaps[0]?.data ||
    Object.keys(learningMaps[0].data).length === 0
  ) {
    console.warn(
      "[generateTaskContent] AI returned empty learning maps, using fallback maps",
    );
    learningMaps = fallback.learningMaps;
  }

  console.log("[AI DEBUG] lesson sections assembled", {
    aiPracticeValid: practiceSanitized.questions.length,
    aiPracticeDropped: practiceSanitized.dropped,
    aiMasterValid: masterSanitized.questions.length,
    aiMasterDropped: masterSanitized.dropped,
    finalPracticeCount: finalPractice.length,
    finalMasterCount: finalMaster.length,
    learningMapsCount: learningMaps.length,
  });

  return {
    learningContent: mergeLearningContent(
      parsed?.learningContent,
      fallback.learningContent,
    ),
    learningMaps,
    practice: finalPractice,
    master: finalMaster,
  };
}

// ---------- MAIN GENERATION FUNCTION ----------
export async function generateTaskContent(input: {
  title: string;
  subject: string;
  description: string;
  type: "lesson" | "assignment";
  difficulty?: string;
}): Promise<Partial<Task>> {
  console.log("[generateTaskContent] start", {
    title: input.title,
    subject: input.subject,
    type: input.type,
    descriptionLength: input.description.length,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  });

  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY missing – using fallback content");
    if (input.type === "assignment") {
      console.log("[generateTaskContent] returning assignment fallback");
      return {
        assignmentContent: getDefaultAssignmentContent(
          input.title,
          input.description,
        ),
      };
    } else {
      console.log("[generateTaskContent] returning lesson fallback");
      return fullFallback(
        input.subject,
        input.description,
        input.title,
        input.difficulty,
      );
    }
  }

  // ----- ASSIGNMENT BRANCH -----
  if (input.type === "assignment") {
    const assignmentPrompt = `
You are an expert educational content creator. Generate a complete assignment content for the following task:

Title: "${input.title}"
Subject: "${input.subject}"
Description: "${input.description}"
Type: "assignment"

Return ONLY valid JSON that matches exactly the following structure. Do NOT include any extra text, keys, or markdown.

{
  "goal": "string (one sentence, clear objective of the assignment)",
  "understanding": {
    "summary": "string (2-3 sentences summarising what the student should understand)",
    "successCriteria": ["string", "string", "string"] (at least 3 criteria)
  },
  "plan": {
    "steps": [
      { "id": "step1", "title": "string", "description": "string" },
      { "id": "step2", "title": "string", "description": "string" },
      { "id": "step3", "title": "string", "description": "string" }
    ]
  },
  "researchGuide": {
    "whatToSearch": ["string", "string", "string"],
    "suggestedSources": ["string", "string", "string"],
    "keywords": ["string", "string", "string"]
  },
  "execution": {
    "structure": ["string", "string", "string"]
  },
  "checkpoints": [
    { "id": "cp1", "question": "string", "expectedAnswerHint": "optional hint" },
    { "id": "cp2", "question": "string", "expectedAnswerHint": "optional hint" },
    { "id": "cp3", "question": "string", "expectedAnswerHint": "optional hint" }
  ],
  "validation": {
    "checklist": ["string", "string", "string"],
    "rubric": {
      "clarity": number (0-100),
      "completeness": number (0-100),
      "structure": number (0-100)
    }
  }
}
`;
    try {
      console.log(
        "[generateTaskContent] generating assignment content via AI",
        {
          model: ACTIVE_MODEL,
          title: input.title,
          subject: input.subject,
        },
      );
      const completion = await createCompletionWithRetry({
        messages: [{ role: "user", content: assignmentPrompt }],
        model: ACTIVE_MODEL,
        temperature: 0.5,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        response_format: { type: "json_object" },
      });
      const content = completion.choices[0]?.message?.content;
      console.log("[generateTaskContent] assignment AI response received", {
        hasContent: !!content,
        contentLength: content?.length ?? 0,
        finishReason: completion.choices[0]?.finish_reason,
      });
      if (!content) throw new Error("Empty response");
      const parsed = JSON.parse(content);
      console.log("[generateTaskContent] assignment AI parsed keys", {
        keys: Object.keys(parsed || {}),
      });

      return { assignmentContent: normalizeAssignmentAIContent(parsed, input) };
    } catch (error) {
      // Salvage partial output when the provider rejects the JSON
      // (e.g. json_validate_failed after truncation).
      const rawFailed = extractFailedGeneration(error);
      if (rawFailed) {
        const salvaged = parseGeneratedJson(rawFailed);
        if (salvaged && typeof salvaged === "object") {
          console.warn(
            `[AI DEBUG] assignment JSON invalid for "${input.title}" — salvaged partial output (${Object.keys(salvaged).length} top-level keys)`,
          );
          return {
            assignmentContent: normalizeAssignmentAIContent(salvaged, input),
          };
        }
      }
      console.error(
        `[AI] assignment generation failed for "${input.title}" (${input.subject}) — falling back to generic assignment content. Reason:`,
        error instanceof Error ? error.message : error,
      );
      return {
        assignmentContent: getDefaultAssignmentContent(
          input.title,
          input.description,
        ),
      };
    }
  }

  // ----- LESSON BRANCH -----
  const lessonPrompt = `
You are an expert educational content creator. Generate a complete set of learning materials for a task with the following details:
Title: "${input.title}"
Subject: "${input.subject}"
Description: "${input.description}"
Type: "lesson"

IMPORTANT INSTRUCTIONS:
- The questions (practice and master) MUST be directly relevant to the given title and description.
- For a math task about "Quadratic Function f(x) = x² – 4x + 3", generate questions about roots, vertex, axis, intercepts, etc. **No right‑triangle or Pythagorean theorem**.
- For a history task, generate historical questions about the specific events mentioned.
- Each question must be multiple choice with 4 options.
- PRACTICE: exactly 8-10 questions.
- MASTER: exactly 8-10 questions. They MUST be distinct from the practice questions and more analytical (application/analysis focused).
- Keep every explanation to 1-2 concise sentences so the JSON stays compact.

Return ONLY valid JSON according to the schema below. Do not add extra text.

{
  "learningContent": {
    "overview": "string (2-3 sentences)",
    "keyPoints": ["string", "string", "string", "string"],
    "example": "detailed example",
    "steps": ["step1", "step2", "step3", "step4"],
    "proTip": "short helpful tip"
  },
  "learningMaps": [
    {
      "presetId": "unique-id",
      "type": "graph",
      "data": {}
    }
  ],
  "practice": [
    {
      "id": "p1",
      "text": "question text",
      "hint": "optional hint",
      "options": [
        { "id": "opt1", "text": "option 1" },
        { "id": "opt2", "text": "option 2" },
        { "id": "opt3", "text": "option 3" },
        { "id": "opt4", "text": "option 4" }
      ],
      "correctAnswer": "opt1",
      "explanation": "concise explanation",
      "category": "fundamentals | application | analysis"
    }
  ],
  "master": [
    { "id": "m1", "text": "question text", "hint": "optional hint", "options": [], "correctAnswer": "opt1", "explanation": "concise explanation", "category": "analysis" }
  ]
}

CRITICAL: Questions must be directly relevant to the task's title and description. Avoid unrelated topics.
`;

  try {
    console.log("[generateTaskContent] generating lesson content via AI", {
      model: ACTIVE_MODEL,
      title: input.title,
      subject: input.subject,
    });
    const completion = await createCompletionWithRetry({
      messages: [{ role: "user", content: lessonPrompt }],
      model: ACTIVE_MODEL,
      temperature: 0.5,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    const finishReason = completion.choices[0]?.finish_reason;
    console.log("[AI DEBUG] raw lesson response received", {
      title: input.title,
      hasContent: !!content,
      contentLength: content?.length ?? 0,
      finishReason,
    });
    if (finishReason === "length") {
      console.warn(
        `[AI DEBUG] lesson output hit token limit for "${input.title}" — sections may be truncated`,
      );
    }
    if (!content) throw new Error("Empty response from GROQ");

    const parsed = JSON.parse(content);
    console.log("[AI DEBUG] parsed successfully", {
      title: input.title,
      keys: Object.keys(parsed || {}),
      practiceCount: Array.isArray(parsed.practice) ? parsed.practice.length : 0,
      masterCount: Array.isArray(parsed.master) ? parsed.master.length : 0,
    });

    const fallback = fullFallback(
      input.subject,
      input.description,
      input.title,
      input.difficulty,
    );

    return assembleLessonResult(parsed, fallback);
  } catch (error) {
    // Salvage: provider rejects malformed JSON but returns the raw output.
    const rawFailed = extractFailedGeneration(error);
    if (rawFailed) {
      const salvaged = parseGeneratedJson(rawFailed);
      if (salvaged && typeof salvaged === "object") {
        console.warn(
          `[AI DEBUG] lesson JSON invalid for "${input.title}" — recovered via failed_generation repair (${Object.keys(salvaged).length} top-level keys)`,
        );
        const fallback = fullFallback(
          input.subject,
          input.description,
          input.title,
          input.difficulty,
        );
        return assembleLessonResult(salvaged, fallback);
      }
    }
    console.error(
      `[AI] lesson generation failed for "${input.title}" (${input.subject}) — falling back to topic-aware content. Reason:`,
      error instanceof Error ? error.message : error,
      isJsonValidateError(error)
        ? "(json_validate_failed, no recoverable output)"
        : "",
    );
    console.log("[AI DEBUG] fallback used: true", { title: input.title });
    return fullFallback(
      input.subject,
      input.description,
      input.title,
      input.difficulty,
    );
  }
}
