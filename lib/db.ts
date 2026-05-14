// /lib/db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "app.db");
const dataDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// ========== TASKS TABLE ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    subject TEXT,
    description TEXT,
    type TEXT,
    resources TEXT,
    learningMaps TEXT,
    practice TEXT,
    master TEXT,
    assignments TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    started_at TEXT,
    completed_at TEXT,
    last_activity_at TEXT,
    progress_meta TEXT DEFAULT '{}',
    visualData TEXT DEFAULT '{}',
    assignmentContent TEXT DEFAULT '{}',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ========== ASSIGNMENT PROGRESS TABLE ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS assignment_progress (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    progress_data TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  )
`).run();

// ========== NEW: ASSIGNMENT SUBMISSIONS TABLE ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE NOT NULL,
    submission_data TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ========== MIGRATIONS (for existing DBs) ==========
const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
const columns = tableInfo.map(c => c.name);

if (!columns.includes("updated_at")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP").run();
}

if (!columns.includes("started_at")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN started_at TEXT").run();
}

if (!columns.includes("completed_at")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN completed_at TEXT").run();
}

if (!columns.includes("last_activity_at")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN last_activity_at TEXT").run();
}

if (!columns.includes("progress_meta")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN progress_meta TEXT DEFAULT '{}'").run();
}

// Progress table migration
const progressInfo = db.prepare("PRAGMA table_info(assignment_progress)").all() as Array<{ name: string }>;
const pCols = progressInfo.map(c => c.name);

if (!pCols.includes("task_id")) {
  db.prepare("ALTER TABLE assignment_progress ADD COLUMN task_id TEXT").run();
}

// Final check
console.log("✅ Database initialized with assignment_submissions table");

export default db;