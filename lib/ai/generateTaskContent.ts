// /lib/ai/generateTaskContent.ts
import { Task, LearningContent, AssignmentContent } from "@/types/task";
import Groq from "groq-sdk";

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

function generateSmartFallbackQuestions(
  subject: string,
  description: string,
  level: "practice" | "master",
  targetCount: number,
): any[] {
  const questions: any[] = [];
  const used = new Set();
  const topic = description.toLowerCase();
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
        ...mathQuestions[i % mathQuestions.length],
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
        ...historyQuestions[i % historyQuestions.length],
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
        ...bioQuestions[i % bioQuestions.length],
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
        ...progQuestions[i % progQuestions.length],
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
        ...econQuestions[i % econQuestions.length],
        id: crypto.randomUUID(),
      });
    }
  } else {
    for (let i = 0; i < targetCount; i++) {
      addQuestion({
        id: crypto.randomUUID(),
        text: `What is an important aspect of ${subject}?`,
        hint: level === "practice" ? "Think about the main ideas." : undefined,
        options: [
          { id: "opt1", text: `Key concept of ${subject}` },
          { id: "opt2", text: `Unrelated topic` },
          { id: "opt3", text: `Trivial detail` },
          { id: "opt4", text: `Common misconception` },
        ],
        correctAnswer: "opt1",
        explanation: `Understanding the core concepts of ${subject} is essential.`,
        category: "general",
      });
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
): FallbackContent => ({
  learningContent: {
    overview: `This is an introductory overview of ${subject}. You will learn the fundamental concepts and practical applications.`,
    keyPoints: [
      "Understand the core principles",
      "Identify key terminology",
      "Apply concepts to real-world scenarios",
      "Recognize common patterns and exceptions",
    ],
    example: `For example, consider how ${subject} appears in everyday situations. A typical case would involve...`,
    steps: [
      "Review the primary definition and its components",
      "Analyze a concrete example step by step",
      "Practice with guided exercises",
      "Test your understanding with the practice questions",
    ],
    proTip: subject.toLowerCase().includes("math")
      ? "Always double-check your calculations and units."
      : `Take notes on key ${subject} concepts as you learn them for better retention.`,
  },
  learningMaps: getFallbackLearningMaps(subject),
  practice: generateSmartFallbackQuestions(
    subject,
    description || "",
    "practice",
    10,
  ),
  master: generateSmartFallbackQuestions(
    subject,
    description || "",
    "master",
    20,
  ),
});

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

// ---------- MAIN GENERATION FUNCTION ----------
export async function generateTaskContent(input: {
  title: string;
  subject: string;
  description: string;
  type: "lesson" | "assignment";
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
      return fullFallback(input.subject, input.description);
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
          model: "llama-3.3-70b-versatile",
          title: input.title,
          subject: input.subject,
        },
      );
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: assignmentPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        response_format: { type: "json_object" },
      });
      const content = completion.choices[0]?.message?.content;
      console.log("[generateTaskContent] assignment AI response received", {
        hasContent: !!content,
        contentLength: content?.length ?? 0,
      });
      if (!content) throw new Error("Empty response");
      const parsed = JSON.parse(content);
      console.log("[generateTaskContent] assignment AI parsed keys", {
        keys: Object.keys(parsed || {}),
      });

      const assignmentContent: AssignmentContent = {
        goal:
          parsed.goal ||
          getDefaultAssignmentContent(input.title, input.description).goal,
        understanding: {
          summary:
            parsed.understanding?.summary || "Understand the core concepts.",
          successCriteria: Array.isArray(parsed.understanding?.successCriteria)
            ? parsed.understanding.successCriteria.slice(0, 3)
            : getDefaultAssignmentContent(input.title, input.description)
                .understanding.successCriteria,
        },
        plan: {
          steps:
            Array.isArray(parsed.plan?.steps) && parsed.plan.steps.length >= 3
              ? parsed.plan.steps.slice(0, 3).map((step: any, idx: number) => ({
                  id: step.id || `step${idx + 1}`,
                  title: step.title || `Step ${idx + 1}`,
                  description: step.description || "",
                }))
              : getDefaultAssignmentContent(input.title, input.description).plan
                  .steps,
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
                question: cp.question || "",
                expectedAnswerHint: cp.expectedAnswerHint,
              }))
            : getDefaultAssignmentContent(input.title, input.description)
                .checkpoints,
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
      console.log("[generateTaskContent] assignment content normalized", {
        hasGoal: !!assignmentContent.goal,
        planSteps: assignmentContent.plan.steps.length,
        checkpoints: assignmentContent.checkpoints.length,
      });
      return { assignmentContent };
    } catch (error) {
      console.error("Assignment generation failed, using fallback:", error);
      return {
        assignmentContent: getDefaultAssignmentContent(
          input.title,
          input.description,
        ),
      };
    }
  }

  // ----- LESSON BRANCH -----
  const ACTIVE_MODEL = "llama-3.3-70b-versatile";
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
- PRACTICE: aim for 8-12 questions.
- MASTER: aim for 15-20 questions (fewer if the topic is simple, but at least 5).

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
      "explanation": "detailed explanation",
      "category": "fundamentals | application | analysis"
    }
  ],
  "master": [
    // same structure as practice, as many as you can (5-20)
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
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: lessonPrompt }],
      model: ACTIVE_MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    console.log("[generateTaskContent] lesson AI response received", {
      hasContent: !!content,
      contentLength: content?.length ?? 0,
    });
    if (!content) throw new Error("Empty response from GROQ");

    const parsed = JSON.parse(content);
    console.log("[generateTaskContent] lesson AI parsed keys", {
      keys: Object.keys(parsed || {}),
      learningMapCount: parsed.learningMaps?.length ?? 0,
      practiceCount: parsed.practice?.length ?? 0,
      masterCount: parsed.master?.length ?? 0,
    });
    const fallback = fullFallback(input.subject, input.description);

    // Remove duplicates
    const seenPractice = new Set();
    const uniquePractice = (parsed.practice || []).filter((q: any) => {
      if (seenPractice.has(q.text)) return false;
      seenPractice.add(q.text);
      return true;
    });
    const seenMaster = new Set();
    const uniqueMaster = (parsed.master || []).filter((q: any) => {
      if (seenMaster.has(q.text)) return false;
      seenMaster.add(q.text);
      return true;
    });

    let finalPractice = uniquePractice;
    if (finalPractice.length < 3) {
      console.warn(
        `AI generated only ${finalPractice.length} practice questions, using fallback`,
      );
      finalPractice = fallback.practice;
    } else {
      finalPractice = finalPractice.slice(0, 12);
    }

    console.log(
      "[generateTaskContent] practice question normalization complete",
      {
        finalCount: finalPractice.length,
      },
    );

    let finalMaster = uniqueMaster;
    if (finalMaster.length < 3) {
      console.warn(
        `AI generated only ${finalMaster.length} master questions, using fallback`,
      );
      finalMaster = fallback.master;
    } else {
      finalMaster = finalMaster.slice(0, 20);
    }

    console.log(
      "[generateTaskContent] master question normalization complete",
      {
        finalCount: finalMaster.length,
      },
    );

    const ensureOptions = (q: any) => {
      if (q.options && Array.isArray(q.options) && q.options[0]?.id) return q;
      const opts = q.options || [
        "Option A",
        "Option B",
        "Option C",
        "Option D",
      ];
      return {
        ...q,
        options: opts.map((opt: any, idx: number) => ({
          id: `opt${idx + 1}`,
          text: typeof opt === "string" ? opt : opt.text,
        })),
      };
    };
    finalPractice = finalPractice.map(ensureOptions);
    finalMaster = finalMaster.map(ensureOptions);

    let learningMaps = parsed.learningMaps || [];
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

    console.log("[generateTaskContent] lesson content ready", {
      hasLearningContent: !!parsed.learningContent,
      learningMapsCount: learningMaps.length,
      practiceCount: finalPractice.length,
      masterCount: finalMaster.length,
    });

    return {
      learningContent: mergeLearningContent(
        parsed.learningContent,
        fallback.learningContent,
      ),
      learningMaps,
      practice: finalPractice,
      master: finalMaster,
    };
  } catch (error) {
    console.error("Lesson generation failed, using fallback:", error);
    return fullFallback(input.subject, input.description);
  }
}
