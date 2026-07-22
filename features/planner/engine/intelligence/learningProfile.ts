import type { PlannerTask, LearningProfile, SubjectInsight, StudyTypePreference } from "../../types";
import { isTaskCompleted } from "../normalizer";

// ──────────────────────────────────────────────
// Part 1 & 2: Learning Profile Engine
// ──────────────────────────────────────────────

function average(values: (number | null | undefined)[]): number | null {
  const valid = values.filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  return valid.length > 0
    ? valid.reduce((sum, v) => sum + v, 0) / valid.length
    : null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mode(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let maxCount = 0;
  let modeValue: string | null = null;
  for (const [key, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      modeValue = key;
    }
  }
  return modeValue;
}

function computeTrend(scores: number[]): "improving" | "declining" | "stable" | null {
  if (scores.length < 3) return null;
  const half = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, half);
  const secondHalf = scores.slice(half);
  const firstAvg = average(firstHalf) ?? 0;
  const secondAvg = average(secondHalf) ?? 0;
  const diff = secondAvg - firstAvg;
  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
}

export function buildLearningProfile(tasks: ReadonlyArray<PlannerTask>): LearningProfile {
  const completed = tasks.filter((t) => isTaskCompleted(t));
  const incomplete = tasks.filter((t) => !isTaskCompleted(t));

  // ── Confidence & mastery ──
  const allConfidences = tasks.map((t) => t.confidence);
  const allMasteries = tasks.map((t) => t.metadata?.masteryScore);
  const allCompletionQualities = tasks.map((t) => t.completionQuality);

  const avgConfidence = average(allConfidences);
  const avgMastery = average(allMasteries);
  const avgCompletionQuality = average(allCompletionQualities);

  // ── Practice & assignment scores ──
  const practiceScores = tasks.flatMap(
    (t) => t.metadata?.learningData?.practiceHistory?.map((e) => e.score) ?? [],
  );
  const assignmentGrades = tasks.flatMap(
    (t) => t.metadata?.learningData?.assignmentHistory?.map((e) => e.grade) ?? [],
  );

  // ── Study sessions ──
  const studyMinutes = tasks.flatMap(
    (t) => t.metadata?.learningData?.studySessions?.map((s) => s.minutes) ?? [],
  );
  const avgStudySessionMinutes = average(studyMinutes);
  const totalStudyMinutes = studyMinutes.reduce((sum, m) => sum + m, 0);

  // ── Subject analysis ──
  const subjectData = new Map<
    string,
    {
      tasks: number;
      completed: number;
      masteries: number[];
      confidences: number[];
      qualities: number[];
      studyMins: number[];
      weakTopics: Map<string, number>;
    }
  >();

  for (const task of tasks) {
    const subj = task.subject;
    if (!subjectData.has(subj)) {
      subjectData.set(subj, {
        tasks: 0,
        completed: 0,
        masteries: [],
        confidences: [],
        qualities: [],
        studyMins: [],
        weakTopics: new Map(),
      });
    }
    const data = subjectData.get(subj)!;
    data.tasks += 1;
    if (isTaskCompleted(task)) data.completed += 1;
    if (typeof task.metadata?.masteryScore === "number") {
      data.masteries.push(task.metadata.masteryScore);
    }
    if (typeof task.confidence === "number") {
      data.confidences.push(task.confidence);
    }
    if (typeof task.completionQuality === "number") {
      data.qualities.push(task.completionQuality);
    }
    for (const session of task.metadata?.learningData?.studySessions ?? []) {
      if (typeof session.minutes === "number") {
        data.studyMins.push(session.minutes);
      }
    }
    for (const wt of task.metadata?.weakTopics ?? []) {
      data.weakTopics.set(
        wt.topic,
        (data.weakTopics.get(wt.topic) ?? 0) + wt.flaggedCount,
      );
    }
  }

  // ── Subject insights ──
  const subjectInsights: SubjectInsight[] = [];
  let mostStudiedSubject: string | null = null;
  let mostStudiedCount = 0;
  let weakestSubject: string | null = null;
  let weakestMastery = Infinity;
  let strongestSubject: string | null = null;
  let strongestMastery = -Infinity;

  for (const [subject, data] of subjectData) {
    const subjMastery = average(data.masteries);
    if (data.tasks > mostStudiedCount) {
      mostStudiedCount = data.tasks;
      mostStudiedSubject = subject;
    }
    if (subjMastery !== null && subjMastery < weakestMastery) {
      weakestMastery = subjMastery;
      weakestSubject = subject;
    }
    if (subjMastery !== null && subjMastery > strongestMastery) {
      strongestMastery = subjMastery;
      strongestSubject = subject;
    }

    // Determine weak topics for this subject
    const weakTopicEntries = Array.from(data.weakTopics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Trend from mastery history
    const allMasteryScores = tasks
      .filter((t) => t.subject === subject)
      .flatMap((t) => t.metadata?.learningData?.masteryHistory ?? [])
      .map((e) => e.score)
      .filter((s): s is number => typeof s === "number" && Number.isFinite(s))
      .sort();

    subjectInsights.push({
      subject,
      taskCount: data.tasks,
      completedCount: data.completed,
      averageMastery: subjMastery,
      averageConfidence: average(data.confidences),
      averageCompletionQuality: average(data.qualities),
      averageStudyMinutes:
        data.studyMins.length > 0
          ? data.studyMins.reduce((a, b) => a + b, 0) / data.studyMins.length
          : null,
      weakTopics: weakTopicEntries,
      trend: computeTrend(allMasteryScores),
    });
  }

  // ── Strengths & weaknesses ──
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (strongestSubject) strengths.push(`Strongest in ${strongestSubject}`);
  if (avgCompletionQuality !== null && avgCompletionQuality > 75) {
    strengths.push("High completion quality");
  }
  if (avgConfidence !== null && avgConfidence > 70) {
    strengths.push("Generally confident");
  }
  if (totalStudyMinutes > 500) {
    strengths.push("Consistent study habits");
  }

  if (weakestSubject) weaknesses.push(`Struggles with ${weakestSubject}`);
  if (avgConfidence !== null && avgConfidence < 50) {
    weaknesses.push("Low confidence overall");
  }
  if (avgMastery !== null && avgMastery < 60) {
    weaknesses.push("Low mastery retention");
  }

  // ── Common weak topics ──
  const allWeakTopics = new Map<string, number>();
  for (const task of tasks) {
    for (const wt of task.metadata?.weakTopics ?? []) {
      allWeakTopics.set(
        wt.topic,
        (allWeakTopics.get(wt.topic) ?? 0) + wt.flaggedCount,
      );
    }
  }
  const commonWeakTopics = Array.from(allWeakTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
  for (const topic of commonWeakTopics.slice(0, 2)) {
    if (!weaknesses.includes(`Struggles with ${topic}`)) {
      weaknesses.push(`Struggles with ${topic}`);
    }
  }

  // ── Preferred session length (median of study minutes) ──
  const preferredSessionLength = median(studyMinutes);

  // ── Favorite study type ──
  const typeCounts = new Map<string, number>();
  for (const task of completed) {
    const type = task.type;
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  }
  let favoriteStudyType: StudyTypePreference | null = null;
  let maxTypeCount = 0;
  for (const [type, count] of typeCounts) {
    if (count > maxTypeCount) {
      maxTypeCount = count;
      // Map PlannerTaskType to StudyTypePreference
      if (type === "lesson") favoriteStudyType = "learn";
      else if (type === "assignment") favoriteStudyType = "work";
      else if (type === "practice") favoriteStudyType = "practice";
      else if (type === "review") favoriteStudyType = "review";
    }
  }

  // ── Completion rate ──
  const completionRate =
    tasks.length > 0
      ? (completed.length / tasks.length) * 100
      : null;

  // ── Estimated vs actual ──
  const estimateRatios: number[] = [];
  for (const task of tasks) {
    for (const entry of task.timeEstimateHistory ?? []) {
      if (entry.estimatedMinutes > 0) {
        estimateRatios.push(entry.actualMinutes / entry.estimatedMinutes);
      }
    }
  }
  const avgEstimateRatio = average(estimateRatios);

  // ── Review metrics ──
  const tasksWithReviews = tasks.filter(
    (t) => (t.reviewCount ?? 0) > 0,
  ).length;
  const reviewConsistency =
    tasks.length > 0 ? (tasksWithReviews / tasks.length) * 100 : null;

  const totalReviews = tasks.reduce(
    (sum, t) => sum + (t.reviewCount ?? 0),
    0,
  );
  const reviewFrequency =
    tasks.length > 0 ? totalReviews / tasks.length : null;

  // ── Average review interval ──
  const reviewIntervals: number[] = [];
  for (const task of tasks) {
    const sr = task.metadata?.spacedRepetition;
    if (sr && typeof sr.interval === "number" && sr.interval > 0) {
      reviewIntervals.push(sr.interval);
    }
  }
  const averageReviewInterval = average(reviewIntervals);

  // ── Mastery growth rate ──
  let masteryGrowthRate: number | null = null;
  const allMasteryTimeline: number[] = [];
  for (const task of tasks) {
    for (const entry of task.metadata?.learningData?.masteryHistory ?? []) {
      if (typeof entry.score === "number" && Number.isFinite(entry.score)) {
        allMasteryTimeline.push(entry.score);
      }
    }
  }
  if (allMasteryTimeline.length >= 2) {
    const first = allMasteryTimeline[0];
    const last = allMasteryTimeline[allMasteryTimeline.length - 1];
    masteryGrowthRate = last - first;
  }

  return {
    strengths,
    weaknesses,
    preferredSessionLength,
    favoriteStudyType,
    averageConfidence: avgConfidence,
    averageMastery: avgMastery,
    averageCompletionQuality: avgCompletionQuality,
    averagePracticeScore: average(practiceScores),
    averageAssignmentScore: average(assignmentGrades),
    averageStudySessionMinutes: avgStudySessionMinutes,
    mostStudiedSubject,
    weakestSubject,
    strongestSubject,
    commonWeakTopics,
    completionRate,
    averageEstimatedVsActual: avgEstimateRatio,
    reviewConsistency,
    reviewFrequency,
    averageReviewInterval,
    masteryGrowthRate,
    totalStudyMinutes,
    totalTasks: tasks.length,
    completedTasks: completed.length,
  };
}

export { computeTrend, average, mode };