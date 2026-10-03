// /lib/exam/studyPlan.ts
// Deterministic Study Plan engine. No AI for dates/priorities.

import type {
  AdaptiveState,
  ExamTopic,
  StudyPlan,
  StudySession,
  SpacedReviewState,
  TopicMasteryLevel,
} from "../../types/task.ts";
import { calculateReviewUrgency, getBaseInterval } from "./spacedReview.ts";

export const STUDY_PLAN_CONFIG = {
  MAX_DAILY_MINUTES: 90,
  MIN_SESSION_MINUTES: 15,
  MAX_SESSION_MINUTES: 45,
  DEFAULT_DAILY_MINUTES: 60,
  MIN_DAYS_FOR_FULL_PLAN: 1,
} as const;

type SessionType = StudySession["type"];

function toDateOnly(iso: string): string {
  return iso.includes("T") ? iso.split("T")[0] : iso;
}

function todayISO(): string {
  return new Date().toISOString();
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysBetweenInclusive(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24));
  return diff;
}

function daysRemaining(examDate: string, currentDate: string): number {
  const cur = toDateOnly(currentDate);
  const exam = toDateOnly(examDate);
  const d = daysBetweenInclusive(cur, exam);
  return d;
}

function uuid(): string {
  // Node + browser compatible
  try {
    if (typeof crypto !== "undefined" && (crypto as unknown as { randomUUID?: () => string }).randomUUID) return (crypto as unknown as { randomUUID: () => string }).randomUUID!();
  } catch {}
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Topic priority for study plan (reuses adaptive) ──

export interface TopicScore {
  topicId: string;
  topicName: string;
  priorityScore: number; // 0-100 from adaptive
  reviewUrgency: number; // 0-100
  finalScore: number; // combined
  reason: string;
}

export function calculateTopicScores(
  topics: ExamTopic[],
  adaptive: AdaptiveState | null | undefined,
  reviews: SpacedReviewState[],
  examDate: string | undefined,
  currentDate: string,
): TopicScore[] {
  const now = toDateOnly(currentDate);
  const reviewMap = new Map(reviews.map((r) => [r.topicId, r]));

  return topics.map((t) => {
    const ad = adaptive?.topics[t.id];
    const basePriority = ad?.priorityScore ?? 50;
    const baseReason = ad?.reason ?? (ad ? `${ad.masteryLevel} ${ad.masteryScore}%` : "no data");

    // review urgency
    const review = reviewMap.get(t.id);
    let reviewUrgency = 0;
    if (review) {
      // inline: reuse spacedReview calculateReviewUrgency but we can approximate here
      // to avoid circular import, we inline simple logic or import function.
      // We already imported calculateReviewUrgency, use it.
      reviewUrgency = calculateReviewUrgency(review, ad, examDate, now);
    } else if (ad) {
      // no review yet but low mastery => urgency
      if (ad.masteryLevel === "Needs Review") reviewUrgency = 8;
    }

    // Final score: 70% adaptive priority + 30% review, plus exam proximity already in adaptive
    const finalScore = Math.max(0, Math.min(100, Math.round(basePriority * 0.7 + reviewUrgency * 0.3 + (basePriority > 80 && reviewUrgency > 15 ? 5 : 0))));

    // Ensure at least some priority for every topic (minimum exposure)
    const normalized = Math.max(10, finalScore);

    const reason =
      ad
        ? `${baseReason}${reviewUrgency > 10 ? ` + review due` : ""}`
        : "new topic";

    return {
      topicId: t.id,
      topicName: t.name,
      priorityScore: basePriority,
      reviewUrgency,
      finalScore: normalized,
      reason,
    };
  });
}

// ── Session type ──

export function getSessionType(
  topicId: string,
  adaptive: AdaptiveState | null | undefined,
  reviewDue: boolean,
): SessionType {
  if (reviewDue) return "review";
  const ad = adaptive?.topics[topicId];
  if (!ad || ad.attempts === 0) return "learn";
  switch (ad.masteryLevel) {
    case "Mastered":
      return "review";
    case "Strong":
      return ad.trend === "declining" ? "review" : "practice";
    case "Developing":
      return "practice";
    case "Needs Review":
      // First time needs review → learn, else practice
      return ad.attempts < 2 ? "learn" : "practice";
    default:
      return "practice";
  }
}

// ── Time allocation ──

export function allocateMinutes(
  scores: TopicScore[],
  totalAvailableMinutes: number,
): Map<string, number> {
  const totalScore = scores.reduce((sum, s) => sum + s.finalScore, 0) || 1;
  const out = new Map<string, number>();

  // First pass: proportional
  for (const s of scores) {
    const share = s.finalScore / totalScore;
    const mins = Math.round(share * totalAvailableMinutes);
    out.set(s.topicId, mins);
  }

  // Enforce minimum exposure: every topic gets at least MIN_SESSION_MINUTES if we have enough budget
  // And cap: no topic gets > 50% of total
  const maxPerTopic = Math.floor(totalAvailableMinutes * 0.5);
  const minPerTopic = STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES;

  let total = Array.from(out.values()).reduce((a, b) => a + b, 0);
  // If total > available due to rounding/minimum, we need to adjust
  // Ensure each topic at least min if possible
  if (totalAvailableMinutes >= scores.length * minPerTopic) {
    for (const s of scores) {
      const cur = out.get(s.topicId) ?? 0;
      if (cur < minPerTopic) {
        out.set(s.topicId, minPerTopic);
      } else if (cur > maxPerTopic) {
        out.set(s.topicId, maxPerTopic);
      }
    }
  } else {
    // Not enough total time: distribute proportionally but respect min
    // In low-budget case, just proportional (some may get <min)
  }

  // Re-normalize if we changed totals to still fit available
  total = Array.from(out.values()).reduce((a, b) => a + b, 0);
  if (total !== totalAvailableMinutes && total > 0) {
    const factor = totalAvailableMinutes / total;
    for (const [k, v] of out.entries()) {
      const adjusted = Math.round(v * factor);
      // clamp to min/max after factor
      const clamped = Math.max(
        totalAvailableMinutes >= scores.length * minPerTopic ? minPerTopic : 0,
        Math.min(STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES * 3, adjusted), // allow multiple sessions summing
      );
      out.set(k, clamped);
    }
    // fix rounding drift: adjust largest topic to match total
    const newTotal = Array.from(out.values()).reduce((a, b) => a + b, 0);
    const drift = totalAvailableMinutes - newTotal;
    if (drift !== 0) {
      const sorted = [...scores].sort((a, b) => b.finalScore - a.finalScore);
      const topId = sorted[0]?.topicId;
      if (topId) out.set(topId, (out.get(topId) ?? 0) + drift);
    }
  }

  return out;
}

// ── Scheduling ──

export interface GenerateStudyPlanInput {
  examDate: string | undefined;
  currentDate: string; // YYYY-MM-DD or ISO
  topics: ExamTopic[];
  adaptive: AdaptiveState | null | undefined;
  existingPlan?: StudyPlan | null;
  availableDailyMinutes?: number; // defaults to DEFAULT_DAILY_MINUTES
  estimatedMinutes?: number; // total estimated from task
  nowIso?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateSessionsForTopic(
  topicId: string,
  topicName: string,
  totalMinutes: number,
  sessionType: SessionType,
  priority: number,
  reason: string,
  source: StudySession["source"],
  dates: string[], // available dates to schedule on (already ordered)
  dailyLoad: Map<string, number>,
  sessions: StudySession[],
  nowIso: string,
) {
  if (totalMinutes <= 0) return;
  // Split evenly into chunks of ~35 within MIN/MAX (reduces session count to fit daily cap)
  const targetChunk = 35;
  let numSessions = Math.ceil(totalMinutes / targetChunk);
  // Ensure each chunk respects MIN/MAX
  // If any chunk would be <MIN, reduce sessions
  while (numSessions > 1 && totalMinutes / numSessions < STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES) {
    numSessions -= 1;
  }
  // Also ensure chunk <= MAX; if totalMinutes large, this is already satisfied by ceil( /30)
  const base = Math.floor(totalMinutes / numSessions);
  const remainder = totalMinutes - base * numSessions;
  const chunks: number[] = Array(numSessions).fill(base);
  for (let i = 0; i < remainder; i++) chunks[i] += 1;
  // Clamp any over MAX (should not happen with target 30) but handle
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] > STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES) {
      const extra = chunks[i] - STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES;
      chunks[i] = STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES;
      // push extra as new session if needed, or distribute
      if (i + 1 < chunks.length) chunks[i + 1] += extra;
      else chunks.push(extra);
    }
  }

  // Distribute chunks across dates round-robin respecting daily cap
  let dateIdx = 0;
  for (const dur of chunks) {
    let placed = false;
    // try to find next date with capacity
    for (let attempt = 0; attempt < dates.length; attempt++) {
      const idx = (dateIdx + attempt) % dates.length;
      const d = dates[idx];
      const load = dailyLoad.get(d) ?? 0;
      if (load + dur <= STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES) {
        sessions.push({
          id: uuid(),
          topicId,
          topicName,
          date: d,
          type: sessionType,
          durationMinutes: dur,
          priority,
          reason,
          status: "planned",
          source,
          createdAt: nowIso,
        });
        dailyLoad.set(d, load + dur);
        dateIdx = (idx + 1) % dates.length;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // All days full, force onto earliest least-loaded day
      let bestDate = dates[0];
      let bestLoad = Infinity;
      for (const d of dates) {
        const l = dailyLoad.get(d) ?? 0;
        if (l < bestLoad) {
          bestLoad = l;
          bestDate = d;
        }
      }
      sessions.push({
        id: uuid(),
        topicId,
        topicName,
        date: bestDate,
        type: sessionType,
        durationMinutes: dur,
        priority,
        reason: reason + " (overflow)",
        status: "planned",
        source,
        createdAt: nowIso,
      });
      dailyLoad.set(bestDate, (dailyLoad.get(bestDate) ?? 0) + dur);
    }
  }
}

export function generateStudyPlan(input: GenerateStudyPlanInput): StudyPlan | null {
  const { examDate, currentDate, topics, adaptive, existingPlan, availableDailyMinutes, estimatedMinutes } = input;
  const nowIso = input.nowIso ?? todayISO();
  const nowDate = toDateOnly(currentDate);

  if (!examDate) return null;
  if (topics.length === 0) return null;

  const exam = toDateOnly(examDate);
  if (exam <= nowDate) return null; // exam already passed or today

  const days = daysRemaining(examDate, nowDate);
  if (days < STUDY_PLAN_CONFIG.MIN_DAYS_FOR_FULL_PLAN) return null;

  // Validate dates: if examDate invalid, return null
  const d = new Date(exam + "T00:00:00");
  if (isNaN(d.getTime())) return null;

  const dailyMinutes = availableDailyMinutes ?? STUDY_PLAN_CONFIG.DEFAULT_DAILY_MINUTES;
  const effectiveDaily = Math.max(
    STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES,
    Math.min(STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES, dailyMinutes),
  );

  // Build date array from tomorrow? Include today if we have time?
  // Spec: plan from currentDate (today) up to examDate exclusive
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(nowDate, i));
  }

  // Total available minutes = days * daily, but also respect estimatedMinutes if provided and larger?
  // If estimatedMinutes is provided, use it as required total, but cap by available.
  let totalAvailable = days * effectiveDaily;
  if (typeof estimatedMinutes === "number" && estimatedMinutes > 0) {
    // Use estimated as lower bound? Actually required study minutes may be estimated.
    // We take max of estimated and available? No, we should not exceed available.
    // We'll use estimated as hint but still cap by daily.
    // If estimated is much larger than available, we still cap to available.
    // If estimated is smaller, we use estimated.
    if (estimatedMinutes < totalAvailable) {
      totalAvailable = estimatedMinutes;
      // But ensure at least one session per topic
      totalAvailable = Math.max(totalAvailable, topics.length * STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES);
      totalAvailable = Math.min(totalAvailable, days * effectiveDaily);
    }
  }

  // Prepare reviews state: from existing plan or initialize from adaptive
  let reviews: SpacedReviewState[] = existingPlan?.reviews ? [...existingPlan.reviews] : [];
  if (reviews.length === 0) {
    // Initialize from adaptive or topics
    reviews = topics.map((t) => {
      const ad = adaptive?.topics[t.id];
      const level: TopicMasteryLevel = ad?.masteryLevel ?? "Needs Review";
      const base = getBaseInterval(level);
      return {
        topicId: t.id,
        lastReviewedAt: undefined,
        nextReviewAt: addDays(nowDate, base),
        intervalDays: base,
        reviewCount: 0,
        retentionScore: ad?.masteryScore ?? 50,
      };
    });
  }

  // Preserve completed/missed sessions from existing plan; they are not regenerated
  const preserved: StudySession[] = existingPlan
    ? existingPlan.sessions.filter((s) => s.status === "completed" || s.status === "missed" || s.status === "skipped")
    : [];

  // For recalc, we should also keep planned sessions that are in the past? But we will regenerate only future planned.
  // Simplify: generate fresh plan for all dates, then merge preserved.

  const dailyLoad = new Map<string, number>();
  // Account for preserved sessions load
  for (const s of preserved) {
    const load = dailyLoad.get(s.date) ?? 0;
    dailyLoad.set(s.date, load + s.durationMinutes);
  }

  // Calculate topic scores
  const scores = calculateTopicScores(topics, adaptive ?? null, reviews, examDate, nowDate);

  // Allocate minutes proportionally
  // For recalc, we should consider already completed minutes? But spec says recalc after performance changes: we regenerate remaining plan, not counting completed as part of allocation? We'll allocate based on remaining available.
  // Compute remaining available after preserved
  const preservedTotal = preserved.reduce((sum, s) => sum + s.durationMinutes, 0);
  const remainingAvailable = Math.max(0, totalAvailable - preservedTotal);

  // If no remaining minutes, return preserved + reviews
  if (remainingAvailable <= 0 && preserved.length > 0) {
    return {
      sessions: [...preserved].sort((a, b) => a.date.localeCompare(b.date)),
      reviews,
      generatedAt: nowIso,
      planVersion: (existingPlan?.planVersion ?? 0) + 1,
    };
  }

  const allocation = allocateMinutes(scores, remainingAvailable || totalAvailable);

  const newSessions: StudySession[] = [];

  // Daily scheduling: distribute allocated minutes across dates respecting daily cap
  // Build remaining map
  const remaining = new Map<string, number>();
  for (const sc of scores) {
    const mins = allocation.get(sc.topicId) ?? 0;
    if (mins > 0) remaining.set(sc.topicId, mins);
  }
  // If no allocation (e.g., tiny total), ensure at least one topic gets minimal session
  if (remaining.size === 0 && scores.length > 0) {
    const sc = scores[0];
    remaining.set(sc.topicId, STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES);
  }

  // Sort scores by priority for daily selection
  const sortedScores = [...scores].sort((a, b) => b.finalScore - a.finalScore);

  // For each date, fill up to effectiveDaily (but never exceed MAX)
  for (const date of dates) {
    let dailyRemaining = effectiveDaily - (dailyLoad.get(date) ?? 0);
    // Also respect MAX cap
    const maxForDay = STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES - (dailyLoad.get(date) ?? 0);
    dailyRemaining = Math.min(dailyRemaining, maxForDay);
    if (dailyRemaining < STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES) continue;

    // Try to allocate sessions for this day, cycling through topics by priority
    let attempts = 0;
    while (dailyRemaining >= STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES && remaining.size > 0 && attempts < 20) {
      attempts++;
      // Pick highest priority topic with remaining >0
      let picked: (typeof sortedScores)[number] | undefined;
      for (const sc of sortedScores) {
        const rem = remaining.get(sc.topicId) ?? 0;
        if (rem > 0) {
          picked = sc;
          break;
        }
      }
      if (!picked) break;

      const rem = remaining.get(picked!.topicId) ?? 0;
      // Determine session type/source
      const review = reviews.find((r) => r.topicId === picked!.topicId);
      const isDue = review ? review.nextReviewAt !== undefined && review.nextReviewAt <= addDays(nowDate, 2) : false;
      const type = getSessionType(picked!.topicId, adaptive ?? null, isDue);
      const source: StudySession["source"] = isDue ? "spaced-review" : "adaptive";

      // Duration: try to allocate a balanced chunk, but respect dailyRemaining and remaining
      let dur = Math.min(rem, dailyRemaining, STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES);
      // Prefer at least MIN, but if remaining is small, take it
      if (dur < STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES) {
        // If remaining is less than MIN but we have other topics, skip this topic for now and try next
        // Find next topic with enough remaining
        let foundAlternative = false;
        for (const alt of sortedScores) {
          if (alt.topicId === picked.topicId) continue;
          const altRem = remaining.get(alt.topicId) ?? 0;
          if (altRem >= STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES && altRem <= dailyRemaining) {
            picked = alt;
            foundAlternative = true;
            break;
          }
        }
        if (foundAlternative && picked) {
          const altRem2 = remaining.get(picked!.topicId) ?? 0;
          const review2 = reviews.find((r) => r.topicId === picked!.topicId);
          const isDue2 = review2 ? review2.nextReviewAt !== undefined && review2.nextReviewAt <= addDays(nowDate, 2) : false;
          const type2 = getSessionType(picked!.topicId, adaptive ?? null, isDue2);
          const source2: StudySession["source"] = isDue2 ? "spaced-review" : "adaptive";
          dur = Math.min(altRem2, dailyRemaining, STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES);
          newSessions.push({
            id: uuid(),
            topicId: picked!.topicId,
            topicName: picked!.topicName,
            date,
            type: type2,
            durationMinutes: dur,
            priority: picked!.finalScore,
            reason: picked!.reason,
            status: "planned",
            source: source2,
            createdAt: nowIso,
          });
          remaining.set(picked!.topicId, altRem2 - dur);
          if ((remaining.get(picked!.topicId) ?? 0) <= 0) remaining.delete(picked!.topicId);
          dailyLoad.set(date, (dailyLoad.get(date) ?? 0) + dur);
          dailyRemaining -= dur;
          continue;
        }
        // Otherwise, take the small remaining as is (even if <MIN, to ensure coverage)
        dur = rem;
      }
      // For larger remaining, try to keep session around 30-35 to allow multiple topics per day
      if (dur > 35 && rem > 35) dur = 30 + Math.min(5, rem - 30); // 30-35

      newSessions.push({
        id: uuid(),
        topicId: picked!.topicId,
        topicName: picked!.topicName,
        date,
        type,
        durationMinutes: dur,
        priority: picked!.finalScore,
        reason: picked!.reason,
        status: "planned",
        source,
        createdAt: nowIso,
      });
      remaining.set(picked!.topicId, rem - dur);
      if ((remaining.get(picked!.topicId) ?? 0) <= 0) remaining.delete(picked!.topicId);
      dailyLoad.set(date, (dailyLoad.get(date) ?? 0) + dur);
      dailyRemaining -= dur;
    }
  }

  // If still remaining after filling all days (e.g., daily cap prevented full allocation), distribute leftover by expanding existing days up to MAX
  if (remaining.size > 0) {
    for (const [topicId, mins] of remaining.entries()) {
      const sc = scores.find((s) => s.topicId === topicId);
      if (!sc) continue;
      const review = reviews.find((r) => r.topicId === topicId);
      const isDue = review ? review.nextReviewAt !== undefined && review.nextReviewAt <= addDays(nowDate, 2) : false;
      const type = getSessionType(topicId, adaptive ?? null, isDue);
      const source: StudySession["source"] = isDue ? "spaced-review" : "adaptive";
      // Find day with most remaining capacity (up to MAX)
      let bestDate: string | null = null;
      let bestCap = -1;
      for (const d of dates) {
        const cap = STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES - (dailyLoad.get(d) ?? 0);
        if (cap >= Math.min(mins, STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES) && cap > bestCap) {
          bestCap = cap;
          bestDate = d;
        }
      }
      if (bestDate) {
        const cap = STUDY_PLAN_CONFIG.MAX_DAILY_MINUTES - (dailyLoad.get(bestDate) ?? 0);
        const dur = Math.min(mins, cap, STUDY_PLAN_CONFIG.MAX_SESSION_MINUTES);
        if (dur >= STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES || mins < STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES) {
          newSessions.push({
            id: uuid(),
            topicId,
            topicName: sc.topicName,
            date: bestDate,
            type,
            durationMinutes: dur,
            priority: sc.finalScore,
            reason: sc.reason,
            status: "planned",
            source,
            createdAt: nowIso,
          });
          dailyLoad.set(bestDate, (dailyLoad.get(bestDate) ?? 0) + dur);
          const newRem = mins - dur;
          if (newRem > 0) remaining.set(topicId, newRem);
          else remaining.delete(topicId);
        }
      }
    }
  }

  // If still no sessions, fallback to single minimal
  if (newSessions.length === 0 && scores.length > 0) {
    const sc = scores[0];
    newSessions.push({
      id: uuid(),
      topicId: sc.topicId,
      topicName: sc.topicName,
      date: dates[0],
      type: getSessionType(sc.topicId, adaptive ?? null, false),
      durationMinutes: STUDY_PLAN_CONFIG.MIN_SESSION_MINUTES,
      priority: sc.finalScore,
      reason: sc.reason,
      status: "planned",
      source: "adaptive",
      createdAt: nowIso,
    });
  }

  // Sort new sessions by date, then priority desc
  newSessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return b.priority - a.priority;
  });

  const allSessions = [...preserved, ...newSessions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return b.priority - a.priority;
  });

  // Filter out any sessions on or after exam date
  const filtered = allSessions.filter((s) => s.date < exam);

  return {
    sessions: filtered,
    reviews,
    generatedAt: nowIso,
    planVersion: (existingPlan?.planVersion ?? 0) + 1,
  };
}

// Helper for plan recalculation triggers
export function shouldRecalculate(
  prev: { examDate?: string; adaptiveUpdatedAt?: string; availableDailyMinutes?: number },
  next: { examDate?: string; adaptiveUpdatedAt?: string; availableDailyMinutes?: number },
): boolean {
  return (
    prev.examDate !== next.examDate ||
    prev.adaptiveUpdatedAt !== next.adaptiveUpdatedAt ||
    prev.availableDailyMinutes !== next.availableDailyMinutes
  );
}
