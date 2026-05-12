// /lib/db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "app.db");
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);

// Tasks table
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
    status TEXT DEFAULT 'learning',
    visualData TEXT DEFAULT '{}',
    assignmentContent TEXT DEFAULT '{}'
  )
`).run();

// Migration for tasks table
const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
const columnNames = tableInfo.map(col => col.name);
if (!columnNames.includes("progress")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0").run();
}
if (!columnNames.includes("status")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'learning'").run();
}
if (!columnNames.includes("visualData")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN visualData TEXT DEFAULT '{}'").run();
}
if (!columnNames.includes("assignmentContent")) {
  db.prepare("ALTER TABLE tasks ADD COLUMN assignmentContent TEXT DEFAULT '{}'").run();
}

// ---------- Assignment progress table ----------
db.prepare(`
  CREATE TABLE IF NOT EXISTS assignment_progress (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    progress_data TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  )
`).run();

// Migration for assignment_progress table (if columns missing)
const progressTableInfo = db.prepare("PRAGMA table_info(assignment_progress)").all() as Array<{ name: string }>;
const progressColumnNames = progressTableInfo.map(col => col.name);
if (!progressColumnNames.includes("task_id")) {
  db.prepare("ALTER TABLE assignment_progress ADD COLUMN task_id TEXT NOT NULL").run();
}
if (!progressColumnNames.includes("progress_data")) {
  db.prepare("ALTER TABLE assignment_progress ADD COLUMN progress_data TEXT NOT NULL").run();
}
if (!progressColumnNames.includes("updated_at")) {
  db.prepare("ALTER TABLE assignment_progress ADD COLUMN updated_at INTEGER DEFAULT (unixepoch())").run();
}