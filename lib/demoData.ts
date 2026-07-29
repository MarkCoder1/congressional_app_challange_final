// // Demo data seeder for Phase 11
// // Creates realistic sample tasks for demonstration

// import { db } from "@/lib/db";
// import type { Task } from "@/types/task";

// export const demoTasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = [
//   {
//     title: "Events Leading to World War I",
//     subject: "History",
//     type: "lesson",
//     status: "in_progress",
//     progress: 35,
//     description: "Understand the complex web of alliances, militarism, and nationalism that led to the Great War.",
//     deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
//     estimatedMinutes: 120,
//     difficulty: "medium",
//     startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
//     lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
//     learningContent: {
//       overview: "Explore the complex causes of World War I, including militarism, alliances, imperialism, and nationalism.",
//       keyPoints: ["Militarism", "Alliances", "Imperialism", "Nationalism"],
//       example: "The assassination of Archduke Franz Ferdinand triggered a chain reaction of alliances.",
//       steps: ["Understand the alliance system", "Analyze the arms race", "Examine imperial tensions"],
//     },
//     learningMaps: [],
//     practice: [],
//     master: [],
//     resources: {},
//     assignments: [],
//   },
//   {
//     title: "Dynamic Air Quality and Weather Dashboard",
//     subject: "Computer Science",
//     type: "assignment",
//     status: "not_started",
//     progress: 0,
//     description: "Build a real-time dashboard visualizing air quality and weather data using APIs and data visualization.",
//     deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
//     estimatedMinutes: 180,
//     difficulty: "hard",
//     startedAt: undefined,
//     lastActivityAt: undefined,
//     learningContent: {
//       overview: "Create a dynamic dashboard that visualizes real-time air quality and weather data.",
//       keyPoints: ["API integration", "Data visualization", "Real-time updates"],
//       example: "Use OpenWeatherMap API to fetch and display weather data.",
//       steps: ["Set up API connections", "Design dashboard layout", "Implement data fetching"],
//     },
//     learningMaps: [],
//     practice: [],
//     master: [],
//     resources: {},
//     assignments: [],
//   },
//   {
//     title: "Pythagorean Theorem",
//     subject: "Math",
//     type: "lesson",
//     status: "not_started",
//     progress: 0,
//     description: "Master the Pythagorean theorem and its applications in geometry and real-world problems.",
//     deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
//     estimatedMinutes: 90,
//     difficulty: "easy",
//     startedAt: undefined,
//     lastActivityAt: undefined,
//     learningContent: {
//       overview: "Learn and apply the Pythagorean theorem: a² + b² = c²",
//       keyPoints: ["Right triangles", "Formula application", "Real-world problems"],
//       example: "Find the hypotenuse: 3² + 4² = c², so c = 5",
//       steps: ["Understand the formula", "Practice with examples", "Solve real-world problems"],
//     },
//     learningMaps: [],
//     practice: [],
//     master: [],
//     resources: {},
//     assignments: [],
//   },
// ];

// export function seedDemoData() {
//   // Check if demo data already exists
//   const existingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
  
//   if (existingTasks.count > 0) {
//     console.log("Demo data already seeded");
//     return;
//   }

//   console.log("Seeding demo data...");

//   const insert = db.prepare(`
//     INSERT INTO tasks (
//       id, title, subject, type, status, progress, description,
//       deadline, estimated_minutes, difficulty,
//       started_at, completed_at, last_activity_at,
//       resources, learningMaps, practice, master,
//       assignments, progress_meta, visualData, assignmentContent
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `);

//   const now = new Date().toISOString();

//   for (const task of demoTasks) {
//     // Merge learningContent into resources (matching createTask pattern)
//     const mergedResources = {
//       ...task.resources,
//       deadline: task.deadline,
//       progress: task.progress ?? 0,
//       learningContent: task.learningContent,
//     };

//     insert.run(
//       crypto.randomUUID(),
//       task.title,
//       task.subject,
//       task.type,
//       task.status,
//       task.progress,
//       task.description,
//       task.deadline,
//       task.estimatedMinutes,
//       task.difficulty,
//       task.startedAt ?? (task.progress > 0 ? now : null),
//       task.progress >= 100 ? now : null,
//       task.lastActivityAt ?? now,
//       JSON.stringify(mergedResources),
//       JSON.stringify(task.learningMaps),
//       JSON.stringify(task.practice),
//       JSON.stringify(task.master),
//       JSON.stringify(task.assignments),
//       JSON.stringify({}),
//       JSON.stringify({}),
//       JSON.stringify({}),
//     );
//   }

//   console.log("Demo data seeded successfully!");
// }
