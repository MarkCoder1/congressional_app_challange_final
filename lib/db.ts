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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline TEXT                    -- ← Fixed: comma was missing before
  )
`).run();

// ========== OTHER TABLES ==========
db.prepare(`
  CREATE TABLE IF NOT EXISTS assignment_progress (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    progress_data TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE NOT NULL,
    submission_data TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ========== MIGRATIONS ==========
const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
const columns = tableInfo.map((c) => c.name);

if (!columns.includes("deadline")) {
  console.log("🔧 Adding deadline column...");
  db.prepare("ALTER TABLE tasks ADD COLUMN deadline TEXT").run();
}

console.log("✅ Database initialized with deadline support");

export default db;