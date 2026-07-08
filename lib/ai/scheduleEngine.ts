// // /lib/ai/scheduleEngine.ts
// import { Task } from "@/types/task";
// import {
//   LegacyScheduledTask,
//   LegacyDailyPlan,
//   LegacyWeeklyPlan,
//   LegacyAIInsights,
//   LegacyAIPlan,
// } from "@/types/schedule";

// // ================================================
// // SAFE ACCESS HELPERS
// // ================================================
// function getStringProp(task: Task, key: keyof Task, fallback: string): string {
//   const val = task[key];
//   return typeof val === "string" ? val : fallback;
// }

// function getNumberProp(task: Task, key: keyof Task, fallback: number): number {
//   const val = task[key];
//   return typeof val === "number" ? val : fallback;
// }

// function getArrayProp(task: Task, key: keyof Task): any[] {
//   const val = task[key];
//   return Array.isArray(val) ? val : [];
// }

// function getDateProp(task: Task, key: keyof Task): Date | null {
//   const val = task[key];
//   if (typeof val === "string") {
//     const d = new Date(val);
//     return !isNaN(d.getTime()) ? d : null;
//   }
//   return null;
// }

// // ================================================
// // PRIORITY SCORING
// // ================================================
// function computePriority(task: Task): { score: number; reason: string } {
//   let score = 0;
//   const reasons: string[] = [];

//   const type = getStringProp(task, "type", "lesson");
//   const typeWeights: Record<string, number> = {
//     assignment: 80,
//     lesson: 60,
//     practice: 40,
//     review: 20,
//   };
//   const base = typeWeights[type] || 30;
//   score += base;
//   reasons.push(`Type: ${type} (base ${base})`);

//   const deadline = getDateProp(task, "deadline");
//   if (deadline) {
//     const now = new Date();
//     if (deadline < now) {
//       const daysOverdue = Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
//       const bonus = Math.min(daysOverdue * 10, 50);
//       score += bonus;
//       reasons.push(`Overdue by ${daysOverdue} days (+${bonus})`);
//     } else {
//       const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//       if (daysLeft <= 2) {
//         score += 20;
//         reasons.push(`Deadline in ${daysLeft} days (+20)`);
//       }
//     }
//   }

//   const progress = getNumberProp(task, "progress", 0);
//   if (progress > 80) {
//     score += 15;
//     reasons.push(`Almost done (+15)`);
//   } else if (progress < 20) {
//     score += 5;
//     reasons.push(`Low progress (+5)`);
//   }

//   return { score: Math.min(100, Math.max(0, score)), reason: reasons.join("; ") };
// }

// // ================================================
// // TIME ESTIMATION
// // ================================================
// function estimateTime(task: Task): number {
//   const type = getStringProp(task, "type", "lesson");
//   const baseTimes: Record<string, number> = {
//     assignment: 100,
//     lesson: 45,
//     practice: 30,
//     review: 20,
//   };
//   let time = baseTimes[type] || 30;

//   const practice = getArrayProp(task, "practice");
//   const master = getArrayProp(task, "master");
//   time += practice.length * 3;
//   time += master.length * 5;

//   const progress = getNumberProp(task, "progress", 0);
//   if (progress < 30) time *= 1.2;
//   else if (progress > 70) time *= 0.8;

//   return Math.round(time);
// }

// // ================================================
// // SCHEDULING ENGINE
// // ================================================
// function normalizeDate(dateInput?: string): string {
//   const d = dateInput ? new Date(dateInput) : new Date();
//   return d.toISOString().split('T')[0];
// }

// export function generateAIPlan(tasks: Task[]): LegacyAIPlan {
//   const scheduled: LegacyScheduledTask[] = tasks.map(task => {
//     const { score, reason } = computePriority(task);
//     const estimatedTime = estimateTime(task);
//     const deadline = getDateProp(task, "deadline");
//     const deadlineStr = deadline ? deadline.toISOString().split('T')[0] : undefined;
//     const now = new Date();
//     const isOverdue = deadline ? deadline < now : false;
//     const id = getStringProp(task, "id", "");
//     const title = getStringProp(task, "title", "Untitled");
//     const subject = getStringProp(task, "subject", "General");
//     const type = getStringProp(task, "type", "lesson");
//     const progress = getNumberProp(task, "progress", 0);

//     return {
//       taskId: id,
//       title,
//       subject,
//       type,
//       progress,
//       deadline: deadlineStr,
//       estimatedTime,
//       priorityScore: score,
//       priorityReason: reason,
//       suggestedOrder: 0,
//       status: isOverdue ? "overdue" : "pending",
//     };
//   });

//   // Group by date
//   const groups: Record<string, LegacyScheduledTask[]> = {};
//   scheduled.forEach(task => {
//     let dateKey = task.deadline;
//     if (!dateKey) {
//       dateKey = new Date().toISOString().split('T')[0];
//     }
//     if (!groups[dateKey]) groups[dateKey] = [];
//     groups[dateKey].push(task);
//   });

//   // Build daily plans
//   const dailyPlan: LegacyDailyPlan[] = Object.entries(groups).map(([date, tasks]) => {
//     const sorted = tasks.sort((a, b) => b.priorityScore - a.priorityScore);
//     sorted.forEach((t, idx) => (t.suggestedOrder = idx + 1));
//     const totalTime = sorted.reduce((sum, t) => sum + t.estimatedTime, 0);
//     let workloadLevel: "light" | "medium" | "heavy" | "overloaded" = "light";
//     if (totalTime > 180) workloadLevel = "heavy";
//     else if (totalTime > 120) workloadLevel = "medium";
//     if (totalTime > 240) workloadLevel = "overloaded";
//     return { date, tasks: sorted, totalEstimatedTime: totalTime, workloadLevel };
//   });

//   dailyPlan.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//   // Weekly plan
//   const today = new Date();
//   const weekStart = new Date(today);
//   weekStart.setDate(weekStart.getDate() - weekStart.getDay());
//   const weekDays: LegacyDailyPlan[] = [];
//   for (let i = 0; i < 7; i++) {
//     const d = new Date(weekStart);
//     d.setDate(weekStart.getDate() + i);
//     const dateKey = d.toISOString().split('T')[0];
//     const plan = dailyPlan.find(p => p.date === dateKey);
//     weekDays.push(plan || { date: dateKey, tasks: [], totalEstimatedTime: 0, workloadLevel: "light" });
//   }

//   const overloadedDays = weekDays.filter(d => d.workloadLevel === "overloaded" || d.workloadLevel === "heavy").map(d => d.date);
//   const emptyDays = weekDays.filter(d => d.tasks.length === 0).map(d => d.date);

//   const weeklyPlan: LegacyWeeklyPlan = {
//     weekStart: weekStart.toISOString().split('T')[0],
//     days: weekDays,
//     overloadedDays,
//     emptyDays,
//   };

//   const insights = generateLegacyInsights(tasks, dailyPlan, weeklyPlan);

//   return {
//     dailyPlan,
//     weeklyPlan,
//     insights,
//     generatedAt: new Date().toISOString(),
//   };
// }

// // ================================================
// // LEGACY INSIGHTS GENERATOR
// // ================================================
// function generateLegacyInsights(
//   tasks: Task[],
//   dailyPlan: LegacyDailyPlan[],
//   weeklyPlan: LegacyWeeklyPlan,
// ): LegacyAIInsights {
//   const warnings: string[] = [];
//   const recommendations: string[] = [];
//   let focusSuggestion = "Complete your highest priority task first.";

//   const overloaded = weeklyPlan.overloadedDays;
//   if (overloaded.length > 0) {
//     warnings.push(`You are overloaded on ${overloaded.length} day(s): ${overloaded.join(', ')}`);
//     recommendations.push(`Consider rescheduling some tasks from ${overloaded[0]} to an empty day.`);
//   }

//   const empty = weeklyPlan.emptyDays;
//   if (empty.length > 0 && overloaded.length > 0) {
//     recommendations.push(`You have empty days (${empty.join(', ')}) – move some overload to these days.`);
//   }

//   const now = new Date();
//   const overdueTasks = tasks.filter(task => {
//     const deadline = getDateProp(task, "deadline");
//     return deadline ? deadline < now : false;
//   });

//   if (overdueTasks.length > 0) {
//     const firstTitle = getStringProp(overdueTasks[0], "title", "overdue task");
//     warnings.push(`You have ${overdueTasks.length} overdue task(s).`);
//     recommendations.push(`Prioritize completing overdue tasks first.`);
//     focusSuggestion = `Focus on overdue task: ${firstTitle}`;
//   }

//   const todayKey = new Date().toISOString().split('T')[0];
//   const todayPlan = dailyPlan.find(d => d.date === todayKey);
//   if (todayPlan && todayPlan.tasks.length > 0) {
//     const highPriorityTask = todayPlan.tasks[0];
//     focusSuggestion = `Start with "${highPriorityTask.title}" (priority ${highPriorityTask.priorityScore})`;
//   }

//   let behindSchedule = false;
//   let estimatedRecoveryDays = 0;
//   if (overdueTasks.length > 0) {
//     behindSchedule = true;
//     estimatedRecoveryDays = Math.ceil(overdueTasks.length / 2);
//   }

//   return {
//     workloadWarnings: warnings,
//     recommendations,
//     focusSuggestion,
//     behindSchedule,
//     estimatedRecoveryDays: behindSchedule ? estimatedRecoveryDays : undefined,
//   };
// }