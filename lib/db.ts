// /lib/db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "app.db");
const dataDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

type DB = Database.Database;

interface AppDb extends DB {
  _openedDev?: number;
  _openedIno?: number;
}

// ========== SCHEMA + MIGRATIONS ==========
// Idempotent: safe to run on first open and again if the file is replaced.
function migrate(db: DB): void {
  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    subject TEXT,
    description TEXT,
    type TEXT,
    resources TEXT,
    learningContent TEXT,
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
    deadline TEXT
  )
`,
  ).run();

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS assignment_progress (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    progress_data TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  )
`,
  ).run();

  db.prepare(
    `
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT UNIQUE NOT NULL,
    submission_data TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  ).run();

  // ========== MIGRATIONS ==========
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
    name: string;
  }>;
  const columns = tableInfo.map((c) => c.name);

  if (!columns.includes("deadline")) {
    console.log("🔧 Adding deadline column...");
    db.prepare("ALTER TABLE tasks ADD COLUMN deadline TEXT").run();
  }

  if (!columns.includes("difficulty")) {
    try {
      console.log("🔧 Adding difficulty column...");
      db.prepare("ALTER TABLE tasks ADD COLUMN difficulty TEXT DEFAULT 'medium'").run();
    } catch {
      console.log("⚠️ difficulty column already exists (race condition)");
    }
  }

  if (!columns.includes("estimated_minutes")) {
    try {
      console.log("🔧 Adding estimated_minutes column...");
      db.prepare("ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER").run();
    } catch {
      console.log("⚠️ estimated_minutes column already exists (race condition)");
    }
  }

  if (!columns.includes("learningContent")) {
    try {
      console.log("🔧 Adding learningContent column...");
      db.prepare("ALTER TABLE tasks ADD COLUMN learningContent TEXT DEFAULT '{}'").run();
    } catch {
      console.log("⚠️ learningContent column already exists (race condition)");
    }
  }
}

function currentFileId(): { dev: number; ino: number } | null {
  try {
    const st = fs.statSync(dbPath);
    return { dev: st.dev, ino: st.ino };
  } catch {
    return null;
  }
}

function openDatabase(): AppDb {
  const handle = new Database(dbPath) as AppDb;
  const id = currentFileId();
  if (id) {
    handle._openedDev = id.dev;
    handle._openedIno = id.ino;
  }
  migrate(handle);
  return handle;
}

let liveDb: AppDb = openDatabase();

// If the database file at the stable project path is replaced/moved while a
// connection is open (which leaves better-sqlite3 stuck in
// SQLITE_READONLY_DBMOVED for the life of the server), reopen a fresh
// connection so a running server keeps working instead of failing on every
// subsequent write. All existing call sites keep using `db.prepare(...)`.
function ensureLive(): AppDb {
  const id = currentFileId();
  if (!id) return liveDb; // file missing; let the caller surface the error
  if (liveDb._openedDev === id.dev && liveDb._openedIno === id.ino) {
    return liveDb;
  }
  try {
    liveDb.close();
  } catch {
    /* ignore close errors on a stale handle */
  }
  console.log("🔁 Database file was replaced; reopening connection…");
  liveDb = openDatabase();
  return liveDb;
}

// `db` is a stable reference so every `import { db }` call site keeps working,
// while each `db.prepare(...)` resolves against the live, self-healing handle.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const current: AppDb = ensureLive();
    const value = (current as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(current) : value;
  },
});

console.log(
  "✅ Database initialized with deadline, difficulty, estimated_minutes, and learningContent support",
);

export default db;
