// lib/mockQuestionsData.ts
import {
  PracticeQuestion,
  MasterQuestion,
  PracticeBreakdownStep,
  TimelineSession,
} from "./types";

// ==================== PRACTICE QUESTIONS ====================
export const mockPracticeQuestions: PracticeQuestion[] = [
  {
    id: "p1",
    text: "Solve the equation: 2x² - 7x + 3 = 0",
    hint: "Use the quadratic formula. Here a=2, b=-7, c=3",
    explanation:
      "Using the quadratic formula x = (-b ± √(b²-4ac)) / 2a, we get x = 3 and x = 0.5",
    category: "Quadratic Equations",
    breakdownSteps: [
      {
        number: 1,
        title: "Identify coefficients",
        explanation: "From the equation 2x² - 7x + 3 = 0, identify a, b, c",
        example: "a = 2, b = -7, c = 3",
        keyPoint: "Always write in standard form ax² + bx + c = 0",
        commonMistake: "Forgetting negative signs in coefficients",
      },
      {
        number: 2,
        title: "Calculate discriminant",
        explanation: "Δ = b² - 4ac tells us how many real solutions exist",
        example: "Δ = 49 - 24 = 25 (positive = 2 real solutions)",
        keyPoint: "Discriminant > 0 means two distinct real roots",
        commonMistake: "Arithmetic errors when computing Δ",
      },
      {
        number: 3,
        title: "Apply quadratic formula",
        explanation: "x = (-b ± √Δ) / 2a",
        example: "x = (7 ± 5) / 4",
        keyPoint: "The ± means we get two solutions",
        commonMistake: "Forgetting ± or incorrect division",
      },
      {
        number: 4,
        title: "Simplify solutions",
        explanation: "Calculate both x₁ and x₂",
        example: "x₁ = 12/4 = 3, x₂ = 2/4 = 0.5",
        keyPoint: "Always verify by substituting back",
        commonMistake: "Arithmetic errors in final division",
      },
    ],
  },
  {
    id: "p2",
    text: "Convert to vertex form: f(x) = x² - 6x + 5",
    hint: "Complete the square by grouping x terms",
    explanation:
      "By completing the square, f(x) = (x - 3)² - 4. Vertex is at (3, -4)",
    category: "Quadratic Forms",
    breakdownSteps: [
      {
        number: 1,
        title: "Group x terms",
        explanation: "Write as (x² - 6x) + 5",
        example: "f(x) = (x² - 6x) + 5",
        keyPoint: "Keep constants separate",
        commonMistake: "Not grouping correctly",
      },
      {
        number: 2,
        title: "Complete the square",
        explanation: "Add and subtract (b/2)² inside the parentheses",
        example: "Take half of -6: -3, square it: 9",
        keyPoint: "(b/2)² = (-6/2)² = 9",
        commonMistake: "Incorrect calculation of (b/2)²",
      },
      {
        number: 3,
        title: "Rewrite as perfect square",
        explanation: "x² - 6x + 9 = (x - 3)²",
        example: "f(x) = (x - 3)² - 9 + 5",
        keyPoint: "Perfect square trinomial",
        commonMistake: "Wrong signs in the binomial",
      },
      {
        number: 4,
        title: "Simplify",
        explanation: "Combine constants",
        example: "f(x) = (x - 3)² - 4",
        keyPoint: "Vertex form shows vertex directly: (3, -4)",
        commonMistake: "Arithmetic error when combining -9 + 5",
      },
    ],
  },
  {
    id: "p3",
    text: "What are the main causes of World War I?",
    hint: "Use the acronym MAIN",
    explanation:
      "The four main factors leading to WWI: Militarism (arms race), Alliances (triple alliance), Imperialism (colonial competition), and Nationalism (pride and conflict)",
    category: "Historical Causes",
    breakdownSteps: [
      {
        number: 1,
        title: "Militarism",
        explanation: "Countries built up military forces and weapons",
        example: "Arms race between Britain, Germany, and France",
        keyPoint: "Led to readiness for war",
        commonMistake: "Confusing militarism with nationalism",
      },
      {
        number: 2,
        title: "Alliances",
        explanation: "Countries formed protective military agreements",
        example:
          "Triple Alliance (Germany, Austria-Hungary, Italy) vs Triple Entente",
        keyPoint: "Local conflict became global conflict",
        commonMistake: "Not understanding how alliances spread conflict",
      },
      {
        number: 3,
        title: "Imperialism",
        explanation: "Competition for colonies and resources worldwide",
        example: "European powers competing in Africa and Asia",
        keyPoint: "Created tensions and rivalries",
        commonMistake: "Mixing up imperialism with nationalism",
      },
      {
        number: 4,
        title: "Nationalism",
        explanation: "Pride in nation led to aggressive policies",
        example: "Pan-Slavism in Serbia vs Austro-Hungarian interests",
        keyPoint: "Fueled tensions especially in Balkans",
        commonMistake: "Confusing nationalism with patriotism",
      },
    ],
  },
  {
    id: "p4",
    text: "Describe photosynthesis in simple terms",
    hint: "What goes in? What comes out?",

    explanation:
      "Photosynthesis is the process where plants use light energy to convert CO₂ and H₂O into glucose (food) and O₂ (byproduct). This happens in chloroplasts.",
    category: "Photosynthesis",
    breakdownSteps: [
      {
        number: 1,
        title: "Identify reactants",
        explanation: "What materials do plants need?",
        example: "Sunlight (light energy), Water (H₂O), Carbon dioxide (CO₂)",
        keyPoint: "These are the inputs",
        commonMistake: "Forgetting one of the inputs",
      },
      {
        number: 2,
        title: "Identify products",
        explanation: "What does photosynthesis produce?",
        example: "Glucose (C₆H₁₂O₆), Oxygen (O₂)",
        keyPoint: "These are the outputs",
        commonMistake: "Confusing with cellular respiration",
      },
      {
        number: 3,
        title: "Write the equation",
        explanation: "Combine inputs and outputs",
        example: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
        keyPoint: "This is the simplified photosynthesis equation",
        commonMistake: "Getting coefficients wrong",
      },
      {
        number: 4,
        title: "Identify location",
        explanation: "Where does photosynthesis occur?",
        example: "In chloroplasts, specifically in thylakoids and stroma",
        keyPoint: "Light reactions in thylakoids, dark reactions in stroma",
        commonMistake: "Not knowing the location",
      },
    ],
  },
  {
    id: "p5",
    text: "Calculate: sin(30°) = ?",
    hint: "Use the unit circle or special angle values",
    explanation:
      "sin(30°) = 1/2 = 0.5. This is a special angle you should memorize.",
    category: "Trigonometry",
    breakdownSteps: [
      {
        number: 1,
        title: "Recognize special angle",
        explanation: "30° is a commonly used special angle",
        example: "Other special angles: 45°, 60°, 90°",
        keyPoint: "Memorize: sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2",
        commonMistake: "Confusing sine and cosine values",
      },
      {
        number: 2,
        title: "Use unit circle",
        explanation: "The unit circle shows all trigonometric values",
        example: "At 30°, the y-coordinate is 1/2",
        keyPoint: "sin(θ) = y-coordinate on unit circle",
        commonMistake: "Using x-coordinate instead of y-coordinate",
      },
      {
        number: 3,
        title: "Verify with triangle",
        explanation: "30-60-90 triangle has sides in ratio 1:√3:2",
        example: "sin(30°) = opposite/hypotenuse = 1/2",
        keyPoint: "In 30-60-90 triangle, short side = half of hypotenuse",
        commonMistake: "Wrong side ratios",
      },
      {
        number: 4,
        title: "Express as decimal",
        explanation: "Convert fraction to decimal if needed",
        example: "1/2 = 0.5",
        keyPoint: "Both forms are acceptable",
        commonMistake: "Incorrect decimal conversion",
      },
    ],
  },
];

// ==================== MASTER QUESTIONS ====================
export const mockMasterQuestions: MasterQuestion[] = [
  {
    id: "m1",
    text: "Solve the quadratic equation and explain your method: 3x² + 12x + 12 = 0",
    explanation:
      "First factor out 3: 3(x² + 4x + 4) = 0. Recognize x² + 4x + 4 = (x + 2)². So (x + 2)² = 0, giving x = -2.",
    category: "Quadratic Equations",
    hint: "Factor out common factor first. Look for perfect square trinomial.",
  },
  {
    id: "m2",
    text: "Analyze the graph of f(x) = -(x - 2)² + 5. Identify vertex, axis of symmetry, and direction.",

    explanation:
      "In vertex form f(x) = a(x - h)² + k, the vertex is (h, k) = (2, 5), axis of symmetry is x = h = 2, and since a = -1 < 0, the parabola opens downward.",
    category: "Parabola Analysis",
    hint: "Remember vertex form: f(x) = a(x - h)² + k",
  },
  {
    id: "m3",
    text: "Compare and contrast the causes and effects of WWI and WWII. How did WWI lead to WWII?",

    explanation:
      "The Treaty of Versailles imposed severe penalties on Germany. Economic hardship, national humiliation, and resentment created conditions for extremist movements. Hitler exploited this to gain power.",
    category: "World Wars Analysis",
    hint: "Consider Treaty of Versailles and its consequences for Germany",
  },
  {
    id: "m4",
    text: "Explain how photosynthesis and cellular respiration are complementary processes. Write both equations.",

    explanation:
      "Photosynthesis stores energy in glucose; respiration releases it. The products of one are reactants of the other. Together they sustain life.",
    category: "Energy Processes",
    hint: "Notice the equations are nearly identical but reversed",
  },
  {
    id: "m5",
    text: "Derive and explain the Law of Cosines: c² = a² + b² - 2ab·cos(C)",

    explanation:
      "The Law of Cosines generalizes the Pythagorean theorem. When C = 90°, cos(90°) = 0, so c² = a² + b². For other angles, the -2ab·cos(C) term adjusts for the angle.",
    category: "Trigonometry",
    hint: "Use the Law of Cosines for non-right triangles",
  },
  {
    id: "m6",
    text: "A population grows exponentially at 5% per year. If you start with 1000, when will it reach 2000?",

    explanation:
      "For exponential growth A = P(1 + r)^t, we solve 2 = (1.05)^t by taking logarithms: t = log(2)/log(1.05) ≈ 14.2 years",
    category: "Exponential Functions",
    hint: "Use logarithms to solve 1.05^t = 2",
  },
];

// ==================== TIMELINE SESSIONS ====================
export const mockTimelineSessions: TimelineSession[] = [
  {
    id: "1",
    title: "Quadratic Functions",
    subject: "Math",
    type: "Learn",
    start: "08:00",
    duration: 30,
    taskType: "mixed",
    day: "Monday",
  },
  {
    id: "1",
    title: "Quadratic Practice",
    subject: "Math",
    type: "Practice",
    start: "08:30",
    duration: 30,
    taskType: "mixed",
    day: "Monday",
  },
  {
    id: "3",
    title: "Biology Review",
    subject: "Biology",
    type: "Review",
    start: "09:30",
    duration: 20,
    taskType: "concept",
    day: "Monday",
  },
  {
    id: "2",
    title: "History Essay",
    subject: "History",
    type: "Practice",
    start: "10:30",
    duration: 40,
    taskType: "lesson",
    day: "Monday",
  },
  {
    id: "a1",
    title: "Quadratic Equations Worksheet",
    subject: "Math",
    type: "Assignment",
    start: "11:00",
    duration: 45,
    taskType: "assignment",
    day: "Monday",
  },
  {
    id: "2",
    title: "Historical Documents",
    subject: "History",
    type: "Learn",
    start: "12:00",
    duration: 35,
    taskType: "lesson",
    day: "Monday",
  },
  // Tuesday sessions
  {
    id: "5",
    title: "Trigonometry Intro",
    subject: "Math",
    type: "Learn",
    start: "09:00",
    duration: 45,
    taskType: "lesson",
    day: "Tuesday",
  },
  {
    id: "6",
    title: "Civil Rights Study",
    subject: "History",
    type: "Practice",
    start: "10:00",
    duration: 50,
    taskType: "mixed",
    day: "Tuesday",
  },
  {
    id: "7",
    title: "Cellular Respiration",
    subject: "Biology",
    type: "Learn",
    start: "11:00",
    duration: 35,
    taskType: "concept",
    day: "Tuesday",
  },
  // Wednesday sessions
  {
    id: "1",
    title: "Quadratic Master Test",
    subject: "Math",
    type: "Review",
    start: "10:00",
    duration: 60,
    taskType: "mixed",
    day: "Wednesday",
  },
  {
    id: "2",
    title: "WWI Essay Writing",
    subject: "History",
    type: "Assignment",
    start: "11:00",
    duration: 90,
    taskType: "lesson",
    day: "Wednesday",
  },
  {
    id: "3",
    title: "Biology Lab",
    subject: "Biology",
    type: "Learn",
    start: "13:00",
    duration: 60,
    taskType: "mixed",
    day: "Wednesday",
  },
  // Thursday sessions
  {
    id: "5",
    title: "Trig Practice Problems",
    subject: "Math",
    type: "Practice",
    start: "09:00",
    duration: 40,
    taskType: "lesson",
    day: "Thursday",
  },
  {
    id: "6",
    title: "History Review Session",
    subject: "History",
    type: "Review",
    start: "10:30",
    duration: 50,
    taskType: "mixed",
    day: "Thursday",
  },
  // Friday sessions
  {
    id: "1",
    title: "Weekly Math Review",
    subject: "Math",
    type: "Review",
    start: "10:00",
    duration: 60,
    taskType: "mixed",
    day: "Friday",
  },
  {
    id: "7",
    title: "Biology Concept Review",
    subject: "Biology",
    type: "Review",
    start: "11:00",
    duration: 45,
    taskType: "concept",
    day: "Friday",
  },
];

// ==================== HELPER FUNCTIONS ====================
export function getPracticeQuestionById(
  id: string,
): PracticeQuestion | undefined {
  return mockPracticeQuestions.find((q) => q.id === id);
}

export function getMasterQuestionById(id: string): MasterQuestion | undefined {
  return mockMasterQuestions.find((q) => q.id === id);
}

export function getTimelineSessionsByDay(day: string): TimelineSession[] {
  return mockTimelineSessions.filter((session) => session.day === day);
}

export function getAllDays(): string[] {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return days;
}
