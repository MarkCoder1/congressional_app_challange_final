// /lib/adaptive/engine.ts
//
// Centralized adaptive learning engine. Deterministic, explainable, no AI.
// All calculations are pure functions so they can be unit-tested.
// AI may generate questions; this engine decides WHAT to practice and WHY.

import type {
  AdaptiveState,
  AdaptiveTopicState,
  PerformanceRecord,
  TopicMasteryLevel,
  TrendDirection,
  PriorityLevel,
  NextActionType,
  ExamTopic,
} from "../../types/task.ts";
import type { Question, QuestionDifficulty } from "../../types/question.ts";
import { masteryForAccuracy } from "../exam/diagnostic.ts";

// ──────────────────────────────────────────────────────────
//  Mastery
// ──────────────────────────────────────────────────────────

/**
 * Deterministic mastery score.
 * - 60% overall accuracy + 40% recent average (last 5)
 * - If fewer than 3 attempts, recent is unreliable → use overall accuracy.
 * - Clamped 0-100.
 */
export function calculateMasteryScore(
  attempts: number,
  correct: number,
  recentScores: number[],
): number {
  if (attempts === 0) return 0;
  const accuracy = Math.round((correct / attempts) * 100);
  if (recentScores.length === 0 || attempts < 3) return accuracy;
  const recentAvg = Math.round(
    recentScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recentScores.length),
  );
  // Weighted blend; recent performance slightly more influential when many attempts.
  const wRecent = attempts >= 5 ? 0.4 : 0.35;
  const wOverall = 1 - wRecent;
  const blended = Math.round(accuracy * wOverall + recentAvg * wRecent);
  return Math.max(0, Math.min(100, blended));
}

export function masteryLevelForScore(score: number): TopicMasteryLevel {
  return masteryForAccuracy(score);
}

export function explanationForMastery(
  level: TopicMasteryLevel,
  score: number,
  attempts: number,
  accuracy: number,
  recentScores: number[],
): string {
  const recentAvg =
    recentScores.length > 0
      ? Math.round(recentScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recentScores.length))
      : accuracy;
  const base = `Mastery ${score}% (${level})`;
  if (attempts === 0) return `${base} — no attempts yet; start with diagnostic.`;
  if (attempts < 3) return `${base} — accuracy ${accuracy}% over ${attempts} attempt${attempts === 1 ? "" : "s"}.`;
  return `${base} — accuracy ${accuracy}% over ${attempts} attempts, recent avg ${recentAvg}% (${recentScores.length} recent).`;
}

// ──────────────────────────────────────────────────────────
//  Trend
// ──────────────────────────────────────────────────────────

/**
 * Simple trend from recent scores (0/100 or partial). Uses last up to 6.
 * - Compare avg of first half vs second half.
 * - Diff > 8 → improving, < -8 → declining, else stable.
 * - Requires at least 3 points to detect trend; otherwise stable.
 */
export function calculateTrend(recentScores: number[]): TrendDirection {
  if (recentScores.length < 3) return "stable";
  const slice = recentScores.slice(-6);
  const mid = Math.floor(slice.length / 2);
  const first = slice.slice(0, mid);
  const second = slice.slice(mid);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const aFirst = avg(first);
  const aSecond = avg(second);
  const diff = aSecond - aFirst;
  if (diff > 8) return "improving";
  if (diff < -8) return "declining";
  return "stable";
}

// ──────────────────────────────────────────────────────────
//  Priority
// ──────────────────────────────────────────────────────────

function daysUntilExam(examDate?: string): number | null {
  if (!examDate) return null;
  const exam = new Date(examDate + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return isNaN(diff) ? null : diff;
}

export interface PriorityResult {
  priority: PriorityLevel;
  priorityScore: number; // 0-100, higher = more urgent
  reason: string;
}

export function calculatePriority(
  topic: AdaptiveTopicState,
  examDate?: string,
): PriorityResult {
  // Base: lower mastery = higher priority
  let score = 100 - topic.masteryScore;
  const reasons: string[] = [];

  if (topic.masteryScore < 40) {
    reasons.push("low mastery");
  } else if (topic.masteryScore < 70) {
    reasons.push("moderate mastery");
  }

  // Recent mistakes: last 5
  const recentMistakes = topic.recentScores.slice(-5).filter((s) => s < 60).length;
  if (recentMistakes >= 3) {
    score += 12;
    reasons.push(`${recentMistakes} recent mistakes`);
  } else if (recentMistakes > 0) {
    score += recentMistakes * 3;
    reasons.push(`${recentMistakes} recent mistake${recentMistakes === 1 ? "" : "s"}`);
  }

  // Consecutive mistakes (streak)
  if (topic.consecutiveMistakes >= 3) {
    score += 10;
    reasons.push(`${topic.consecutiveMistakes} in a row wrong`);
  } else if (topic.consecutiveMistakes === 2) {
    score += 6;
    reasons.push("2 in a row wrong");
  }

  // Lack of attempts
  if (topic.attempts === 0) {
    score += 15;
    reasons.push("never attempted");
  } else if (topic.attempts <= 2) {
    score += 6;
    reasons.push("few attempts");
  }

  // Declining / improving
  if (topic.trend === "declining") {
    score += 10;
    reasons.push("declining trend");
  } else if (topic.trend === "improving") {
    score -= 5;
    reasons.push("improving");
  }

  // Exam urgency: closer exam boosts low mastery topics
  const days = daysUntilExam(examDate);
  if (days !== null && days >= 0 && days <= 14 && topic.masteryScore < 70) {
    const urgency = days <= 7 ? 10 : 5;
    score += urgency;
    reasons.push(days <= 7 ? "exam within 7 days" : "exam within 14 days");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let priority: PriorityLevel;
  if (score >= 65) priority = "high";
  else if (score >= 35) priority = "medium";
  else priority = "low";

  const reason =
    reasons.length > 0
      ? reasons.join(" + ")
      : topic.masteryScore >= 90
        ? "mastered — maintain"
        : "stable";

  return { priority, priorityScore: score, reason };
}

// Map priority to recommended action (deterministic)
function recommendedActionForPriority(
  level: TopicMasteryLevel,
  trend: TrendDirection,
): { action: string; nextAction: NextActionType } {
  switch (level) {
    case "Needs Review":
      return { action: "Review concept, then targeted practice", nextAction: "review_concept" };
    case "Developing":
      if (trend === "declining") return { action: "Review and targeted practice", nextAction: "practice_weak" };
      return { action: "Targeted practice", nextAction: "practice_weak" };
    case "Strong":
      if (trend === "declining") return { action: "Mixed practice to stabilize", nextAction: "practice_mixed" };
      return { action: "Mixed practice", nextAction: "practice_mixed" };
    case "Mastered":
      return { action: "Maintenance — mastery check", nextAction: "mastery_check" };
    default:
      return { action: "Continue learning", nextAction: "continue_learning" };
  }
}

// ──────────────────────────────────────────────────────────
//  Difficulty adaptation
// ──────────────────────────────────────────────────────────

const DIFFICULTY_ORDER: QuestionDifficulty[] = ["easy", "medium", "hard"];

export function adaptDifficulty(
  current: QuestionDifficulty | undefined,
  recentScores: number[],
  attempts: number,
): QuestionDifficulty {
  const cur = current ?? "medium";
  const idx = DIFFICULTY_ORDER.indexOf(cur);
  if (recentScores.length === 0 || attempts < 2) return cur;
  const recentAvg =
    recentScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recentScores.length);
  // Strong → increase one step, weak → decrease one step, else stay
  if (recentAvg >= 80 && attempts >= 3 && idx < DIFFICULTY_ORDER.length - 1) {
    return DIFFICULTY_ORDER[idx + 1];
  }
  if (recentAvg <= 45 && attempts >= 2 && idx > 0) {
    return DIFFICULTY_ORDER[idx - 1];
  }
  return cur;
}

// ──────────────────────────────────────────────────────────
//  Next Action Engine
// ──────────────────────────────────────────────────────────

export interface NextAction {
  action: NextActionType;
  label: string;
  topicId?: string;
  topic?: string;
  reason: string;
  why: string;
}

const ACTION_LABEL: Record<NextActionType, string> = {
  review_concept: "Review concept",
  practice_weak: "Targeted practice",
  practice_mixed: "Mixed practice",
  reinforce_strong: "Reinforce strength",
  retake_diagnostic: "Retake diagnostic",
  continue_learning: "Continue learning",
  mastery_check: "Mastery check",
};

export function getNextLearningAction(
  state: AdaptiveState,
  examDate?: string,
  allTopics?: ExamTopic[],
): NextAction {
  const topics = Object.values(state.topics);
  if (topics.length === 0) {
    // No data → retake diagnostic or continue
    const hasTopics = allTopics && allTopics.length > 0;
    return {
      action: hasTopics ? "retake_diagnostic" : "continue_learning",
      label: hasTopics ? ACTION_LABEL.retake_diagnostic : ACTION_LABEL.continue_learning,
      reason: hasTopics ? "no performance yet" : "no topics",
      why: hasTopics
        ? "Complete the diagnostic to generate your adaptive plan."
        : "Add exam topics to begin adaptive learning.",
    };
  }

  // Rank by priority
  const ranked = rankTopicsByPriority(state, examDate);
  const focus = ranked[0];

  // Overall heuristic: if many low mastery, focus; if all mastered, suggest mixed/maintenance
  const needsReview = topics.filter((t) => t.masteryLevel === "Needs Review").length;
  const mastered = topics.filter((t) => t.masteryLevel === "Mastered").length;

  // If any needs review → review that topic
  if (focus.masteryLevel === "Needs Review") {
    return {
      action: focus.nextAction,
      label: ACTION_LABEL[focus.nextAction],
      topicId: focus.topicId,
      topic: focus.topic,
      reason: focus.reason,
      why: `You are practicing "${focus.topic}" because your mastery is ${focus.masteryScore}% (${focus.masteryLevel}) with ${focus.accuracy}% accuracy over ${focus.attempts} attempts. ${focus.trend === "declining" ? "Your recent trend is declining." : focus.trend === "improving" ? "You are improving—keep focusing here." : ""}`.trim(),
    };
  }

  // If all mastered → mixed maintenance
  if (mastered === topics.length) {
    return {
      action: "practice_mixed",
      label: ACTION_LABEL.practice_mixed,
      reason: "all topics mastered",
      why: "All topics are mastered. Mixed practice will help maintain retention.",
    };
  }

  // If strong but need reinforcement
  if (focus.masteryLevel === "Strong" && needsReview === 0) {
    return {
      action: focus.nextAction,
      label: ACTION_LABEL[focus.nextAction],
      topicId: focus.topicId,
      topic: focus.topic,
      reason: focus.reason,
      why: `"${focus.topic}" is ${focus.masteryLevel} (${focus.masteryScore}%). ${focus.trend === "declining" ? "Recent mistakes suggest a quick review." : "Mixed practice will reinforce it."}`,
    };
  }

  // Default: weakest topic
  return {
    action: focus.nextAction,
    label: ACTION_LABEL[focus.nextAction],
    topicId: focus.topicId,
    topic: focus.topic,
    reason: focus.reason,
    why: `You are practicing "${focus.topic}" because it has the highest priority (${focus.priority}, ${focus.masteryScore}% mastery, ${focus.accuracy}% accuracy, trend ${focus.trend}). ${focus.reason}.`,
  };
}

// ──────────────────────────────────────────────────────────
//  Ranking + Question selection
// ──────────────────────────────────────────────────────────

export function rankTopicsByPriority(
  state: AdaptiveState,
  examDate?: string,
): AdaptiveTopicState[] {
  const topics = Object.values(state.topics);
  // Recompute priority live so exam urgency is fresh
  const withPriority = topics.map((t) => {
    const p = calculatePriority(t, examDate);
    const rec = recommendedActionForPriority(t.masteryLevel, t.trend);
    return { ...t, priority: p.priority, priorityScore: p.priorityScore, reason: p.reason, recommendedAction: rec.action, nextAction: rec.nextAction };
  });
  return withPriority.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    // tie-break: lower mastery first
    if (a.masteryScore !== b.masteryScore) return a.masteryScore - b.masteryScore;
    return a.topic.localeCompare(b.topic);
  });
}

export interface SelectionInput {
  topics: ExamTopic[];
  questions: Question[];
  state: AdaptiveState;
  examDate?: string;
  // optional difficulty hint per topic is inside state.difficultyByTopic
}

export interface SelectionResult {
  question: Question | null;
  topicId?: string;
  topic?: string;
  reason: string;
  difficulty?: QuestionDifficulty;
}

export function selectNextQuestion(input: SelectionInput): SelectionResult {
  const { questions, state, examDate } = input;
  void input.topics;
  if (questions.length === 0) {
    const ranked = state ? rankTopicsByPriority(state, examDate) : [];
    const fallback = ranked[0] ?? null;
    return {
      question: null,
      topicId: fallback?.topicId,
      topic: fallback?.topic,
      reason: fallback ? `No prepared questions for "${fallback.topic}" — generate targeted practice for ${fallback.masteryLevel} (${fallback.masteryScore}%).` : "No questions available — generate new practice.",
      difficulty: fallback ? state.difficultyByTopic?.[fallback.topicId] : undefined,
    };
  }

  // If we have adaptive state, pick highest priority topic that has questions
  if (state && Object.keys(state.topics).length > 0) {
    const ranked = rankTopicsByPriority(state, examDate);
    for (const t of ranked) {
      const pool = questions.filter((q) => q.topicId === t.topicId || q.topic === t.topic);
      if (pool.length > 0) {
        // Filter by adaptive difficulty if available
        const desired = state.difficultyByTopic?.[t.topicId];
        const difficultyPool = desired ? pool.filter((q) => q.difficulty === desired) : [];
        const candidates = difficultyPool.length > 0 ? difficultyPool : pool;
        // Deterministic: sort by id and pick first not recently seen, else first
        const recentIds = new Set(state.history.slice(-10).map((h) => h.questionId));
        const sorted = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
        const notRecent = sorted.find((q) => !recentIds.has(q.id));
        const chosen = notRecent ?? sorted[0];
        return {
          question: chosen,
          topicId: t.topicId,
          topic: t.topic,
          reason: `Selected "${t.topic}" — highest priority (${t.priority}, ${t.masteryScore}% mastery, trend ${t.trend}). ${t.reason}.`,
          difficulty: chosen.difficulty,
        };
      }
    }
  }

  // Fallback: pick question whose topic has lowest mastery, else first
  const sorted = [...questions].sort((a, b) => a.id.localeCompare(b.id));
  const byTopicMastery = new Map<string, number>();
  if (state) {
    for (const t of Object.values(state.topics)) byTopicMastery.set(t.topicId, t.masteryScore);
  }
  sorted.sort((a, b) => {
    const ma = a.topicId ? (byTopicMastery.get(a.topicId) ?? 100) : 100;
    const mb = b.topicId ? (byTopicMastery.get(b.topicId) ?? 100) : 100;
    if (ma !== mb) return ma - mb;
    return a.id.localeCompare(b.id);
  });
  const chosen = sorted[0];
  return {
    question: chosen,
    topicId: chosen.topicId,
    topic: chosen.topic,
    reason: chosen.topicId ? `Practice "${chosen.topic ?? chosen.topicId}" — lowest mastery among available questions.` : "Practice next available question.",
    difficulty: chosen.difficulty,
  };
}

// ──────────────────────────────────────────────────────────
//  Persistence helpers (pure, returns new state)
// ──────────────────────────────────────────────────────────

export function createInitialAdaptiveState(
  topics: ExamTopic[],
  diagnosticPerformance?: { topicId: string; topic: string; accuracy: number; attempted: number; correct: number }[],
): AdaptiveState {
  const now = new Date().toISOString();
  const byTopic = new Map<string, { topicId: string; topic: string; accuracy: number; attempted: number; correct: number }>();
  if (diagnosticPerformance) {
    for (const p of diagnosticPerformance) byTopic.set(p.topicId, p);
  }

  const state: AdaptiveState = { topics: {}, history: [], updatedAt: now, difficultyByTopic: {} };

  for (const t of topics) {
    const perf = byTopic.get(t.id);
    const attempts = perf?.attempted ?? 0;
    const correct = perf?.correct ?? 0;
    const accuracy = perf ? Math.round((correct / Math.max(1, attempts)) * 100) : 0;
    const recentScores = perf ? Array(attempts).fill(0).map((_, i) => (i < correct ? 100 : 0)) : [];
    // For diagnostic, recentScores derived from correct/attempted distribution
    // We approximate by spreading correct as 100s then 0s; trend stable.
    const masteryScore = calculateMasteryScore(attempts, correct, recentScores);
    const masteryLevel = masteryLevelForScore(masteryScore);
    const trend = calculateTrend(recentScores);
    const baseTopic: AdaptiveTopicState = {
      topicId: t.id,
      topic: t.name,
      attempts,
      correct,
      accuracy,
      masteryScore,
      masteryLevel,
      recentScores: recentScores.slice(-5),
      trend,
      priority: "medium",
      priorityScore: 50,
      reason: attempts === 0 ? "never attempted" : `diagnostic accuracy ${accuracy}%`,
      recommendedAction: recommendedActionForPriority(masteryLevel, trend).action,
      nextAction: recommendedActionForPriority(masteryLevel, trend).nextAction,
      lastAttemptAt: attempts > 0 ? now : undefined,
      consecutiveMistakes: attempts > 0 && correct === 0 ? attempts : 0,
      explanation: explanationForMastery(masteryLevel, masteryScore, attempts, accuracy, recentScores),
    };
    const pri = calculatePriority(baseTopic);
    baseTopic.priority = pri.priority;
    baseTopic.priorityScore = pri.priorityScore;
    baseTopic.reason = pri.reason;
    state.topics[t.id] = baseTopic;
    // initial difficulty based on mastery
    if (masteryLevel === "Mastered" || masteryLevel === "Strong") state.difficultyByTopic![t.id] = "hard";
    else if (masteryLevel === "Developing") state.difficultyByTopic![t.id] = "medium";
    else state.difficultyByTopic![t.id] = "easy";
  }

  return state;
}

/**
 * Record a single attempt. Returns a NEW AdaptiveState (immutable).
 */
export function recordAttempt(
  prev: AdaptiveState,
  params: {
    topicId: string;
    topic: string;
    questionId: string;
    questionType: string;
    correct: boolean;
    score: number; // 0-100
    timestamp?: string;
    difficulty?: string;
  },
): AdaptiveState {
  const now = params.timestamp ?? new Date().toISOString();
  const existing = prev.topics[params.topicId];

  const beforeMastery = existing?.masteryScore ?? 0;

  // Build or update topic
  let nextTopic: AdaptiveTopicState;
  if (!existing) {
    // New topic not previously tracked (ad-hoc)
    const attempts = 1;
    const correct = params.correct ? 1 : 0;
    const accuracy = correct ? 100 : 0;
    const recentScores = [params.score];
    const masteryScore = calculateMasteryScore(attempts, correct, recentScores);
    const masteryLevel = masteryLevelForScore(masteryScore);
    const trend = calculateTrend(recentScores);
    const base: AdaptiveTopicState = {
      topicId: params.topicId,
      topic: params.topic,
      attempts,
      correct,
      accuracy,
      masteryScore,
      masteryLevel,
      recentScores,
      trend,
      priority: "medium",
      priorityScore: 50,
      reason: "",
      recommendedAction: "",
      nextAction: "continue_learning",
      lastAttemptAt: now,
      consecutiveMistakes: params.correct ? 0 : 1,
      explanation: "",
    };
    const pri = calculatePriority(base);
    const rec = recommendedActionForPriority(masteryLevel, trend);
    nextTopic = {
      ...base,
      priority: pri.priority,
      priorityScore: pri.priorityScore,
      reason: pri.reason,
      recommendedAction: rec.action,
      nextAction: rec.nextAction,
      explanation: explanationForMastery(masteryLevel, masteryScore, attempts, accuracy, recentScores),
    };
  } else {
    const attempts = existing.attempts + 1;
    const correct = existing.correct + (params.correct ? 1 : 0);
    const accuracy = Math.round((correct / attempts) * 100);
    const recentScores = [...existing.recentScores, params.score].slice(-5);
    const masteryScore = calculateMasteryScore(attempts, correct, recentScores);
    const masteryLevel = masteryLevelForScore(masteryScore);
    const trend = calculateTrend([...existing.recentScores, params.score].slice(-6));
    const consecutiveMistakes = params.correct ? 0 : existing.consecutiveMistakes + 1;
    const base: AdaptiveTopicState = {
      ...existing,
      attempts,
      correct,
      accuracy,
      masteryScore,
      masteryLevel,
      recentScores,
      trend,
      lastAttemptAt: now,
      consecutiveMistakes,
      explanation: explanationForMastery(masteryLevel, masteryScore, attempts, accuracy, recentScores),
    };
    const pri = calculatePriority({ ...base, trend, consecutiveMistakes });
    const rec = recommendedActionForPriority(masteryLevel, trend);
    nextTopic = {
      ...base,
      priority: pri.priority,
      priorityScore: pri.priorityScore,
      reason: pri.reason,
      recommendedAction: rec.action,
      nextAction: rec.nextAction,
    };
  }

  // Difficulty adaptation for this topic
  const nextDifficultyByTopic = { ...(prev.difficultyByTopic ?? {}) };
  const curDiff = nextDifficultyByTopic[params.topicId] as QuestionDifficulty | undefined;
  const adapted = adaptDifficulty(curDiff, nextTopic.recentScores, nextTopic.attempts);
  nextDifficultyByTopic[params.topicId] = adapted;

  // History entry
  const record: PerformanceRecord = {
    id: `${params.questionId}-${now}`,
    topicId: params.topicId,
    topic: params.topic,
    questionId: params.questionId,
    questionType: params.questionType,
    correct: params.correct,
    score: params.score,
    timestamp: now,
    masteryBefore: beforeMastery,
    masteryAfter: nextTopic.masteryScore,
    difficulty: params.difficulty,
  };

  return {
    topics: { ...prev.topics, [params.topicId]: nextTopic },
    history: [...prev.history, record].slice(-100),
    updatedAt: now,
    difficultyByTopic: nextDifficultyByTopic,
  };
}

/**
 * Apply many records (e.g., diagnostic submission) to a state.
 * Used to seed adaptive from diagnostic result.
 */
export function applyDiagnosticToAdaptive(
  prev: AdaptiveState | null,
  topics: ExamTopic[],
  diagnosticQuestions: { topicId: string; topic: string; isCorrect: boolean; questionId: string; questionType: string; difficulty?: string; score: number }[],
): AdaptiveState {
  let state = prev ?? createInitialAdaptiveState(topics);
  // Ensure all topics exist
  for (const t of topics) {
    if (!state.topics[t.id]) {
      state = {
        ...state,
        topics: {
          ...state.topics,
          [t.id]: createInitialAdaptiveState([t]).topics[t.id],
        },
      };
    }
  }
  for (const q of diagnosticQuestions) {
    state = recordAttempt(state, {
      topicId: q.topicId,
      topic: q.topic,
      questionId: q.questionId,
      questionType: q.questionType,
      correct: q.isCorrect,
      score: q.score,
      difficulty: q.difficulty,
    });
  }
  return state;
}
