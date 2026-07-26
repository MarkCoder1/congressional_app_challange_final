// /lib/mockLearningData.ts
// Mock learning performance tracking system
// Frontend-only, uses local state

export type ConfidenceLevel = "low" | "medium" | "high";

export interface LearningStats {
  accuracy: number;
  questionsCompleted: number;
  mistakes: number;
  confidence: ConfidenceLevel;
  timeSpent: number; // minutes
  completionSpeed: number; // seconds per question
}

export interface WeakArea {
  topic: string;
  reason: string;
  incorrectCount: number;
}

export interface UnderstandingFeedback {
  level: "strong" | "moderate" | "needs_review";
  label: string;
  strengths: string[];
  needsReview: string[];
  recommendation: string;
}

export interface LearningReport {
  score: number;
  timeSpent: string;
  topicsMastered: string[];
  topicsToImprove: string[];
  recommendedNext: string;
  accuracy: number;
  questionsAttempted: number;
}

export interface ConfidenceResult {
  questionId: string;
  confidence: ConfidenceLevel;
}

// Generate mock stats from practice results
export function generateLearningStats(
  score: number,
  totalQuestions: number,
  mistakes: number,
  timeSpentMinutes: number = 15,
  confidence: ConfidenceLevel = "medium",
): LearningStats {
  return {
    accuracy: score,
    questionsCompleted: totalQuestions,
    mistakes,
    confidence,
    timeSpent: timeSpentMinutes,
    completionSpeed: totalQuestions > 0
      ? Math.round((timeSpentMinutes * 60) / totalQuestions)
      : 0,
  };
}

// Generate understanding feedback from stats
export function generateUnderstandingFeedback(
  stats: LearningStats,
  weakAreas: string[],
): UnderstandingFeedback {
  const { accuracy, confidence } = stats;

  if (accuracy >= 85) {
    return {
      level: "strong",
      label: "Strong Understanding",
      strengths: weakAreas.length > 0
        ? ["Most concepts mastered", "Good accuracy"]
        : ["Strong grasp of material", "Excellent accuracy"],
      needsReview: weakAreas.length > 0 ? weakAreas : [],
      recommendation: confidence === "low"
        ? "You know this well! Build confidence by reviewing one more time."
        : "Ready to move to the next stage.",
    };
  }

  if (accuracy >= 60) {
    return {
      level: "moderate",
      label: "Almost There",
      strengths: ["Basic concepts understood"],
      needsReview: weakAreas.length > 0
        ? weakAreas
        : ["Review incorrect answers to identify gaps"],
      recommendation: "Review weak areas before testing again.",
    };
  }

  return {
    level: "needs_review",
    label: "Needs Review",
    strengths: [],
    needsReview: weakAreas.length > 0
      ? weakAreas
      : ["Fundamental concepts need attention"],
    recommendation: "Review the learning material and try again.",
  };
}

// Generate weak areas from incorrect answers
export function detectWeakAreas(
  incorrectQuestions: { text: string; category: string }[],
): WeakArea[] {
  const categoryMap = new Map<string, { count: number; examples: string[] }>();

  incorrectQuestions.forEach((q) => {
    const cat = q.category || "General";
    const existing = categoryMap.get(cat) || { count: 0, examples: [] };
    existing.count++;
    if (existing.examples.length < 2) existing.examples.push(q.text);
    categoryMap.set(cat, existing);
  });

  return Array.from(categoryMap.entries()).map(([topic, data]) => ({
    topic,
    reason: `${data.count} incorrect answer${data.count > 1 ? "s" : ""}`,
    incorrectCount: data.count,
  }));
}

// Generate learning report for completion
export function generateLearningReport(
  stats: LearningStats,
  weakAreas: string[],
  subject: string,
): LearningReport {
  const nextTopics: Record<string, string> = {
    Physics: "Forces & Motion",
    Chemistry: "Chemical Reactions",
    Biology: "Cell Structure",
    Math: "Algebra Fundamentals",
    English: "Literary Analysis",
    History: "World War II",
    General: "Next Topic",
  };

  const mastered = weakAreas.length > 0
    ? ["Core concepts"]
    : ["All topics covered"];

  return {
    score: stats.accuracy,
    timeSpent: `${stats.timeSpent} min`,
    topicsMastered: mastered,
    topicsToImprove: weakAreas.length > 0 ? weakAreas : [],
    recommendedNext: nextTopics[subject] || "Next Topic",
    accuracy: stats.accuracy,
    questionsAttempted: stats.questionsCompleted,
  };
}

// Get next action based on learning state
export function getAdaptiveNextAction(
  learnCompleted: boolean,
  practiceCompleted: boolean,
  masterCompleted: boolean,
  practiceScore?: number,
  masterScore?: number,
): { label: string; action: string; targetTab: "Learn" | "Practice" | "Master" } | null {
  if (masterCompleted) return null;

  if (!learnCompleted) {
    return { label: "Start by learning the concept", action: "Start Learning", targetTab: "Learn" };
  }

  if (!practiceCompleted) {
    return { label: "Complete Practice Questions", action: "Continue Practice", targetTab: "Practice" };
  }

  if (practiceScore !== undefined && practiceScore < 60) {
    return { label: "Review the material before the test", action: "Review Learn", targetTab: "Learn" };
  }

  if (!masterCompleted) {
    return { label: "Take Master Test", action: "Start Test", targetTab: "Master" };
  }

  return null;
}