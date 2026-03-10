import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";
import * as schema from "./schema";
import { seed } from "./seed";

// Turso remote URL for production (Vercel), local file for dev
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

const localUrl = `file:${process.env.DB_PATH || path.join(process.cwd(), "job-radar.db")}`;

const globalForDb = globalThis as unknown as {
  __db?: ReturnType<typeof createDb>;
  __dbInitialized?: boolean;
};

function createDb() {
  const client = TURSO_URL
    ? createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
    : createClient({ url: localUrl });

  const db = drizzle(client, { schema });
  return db;
}

async function initTables(db: ReturnType<typeof createDb>) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      query TEXT NOT NULL,
      proposal_template TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS manual_jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT '',
      pub_date TEXT NOT NULL,
      budget TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'manual',
      skills TEXT NOT NULL DEFAULT '[]',
      country TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS applied_jobs (
      job_id TEXT PRIMARY KEY,
      job_title TEXT NOT NULL DEFAULT '',
      job_link TEXT NOT NULL DEFAULT '',
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];

  for (const ddl of tables) {
    try { await db.run(ddl as any); } catch { /* idempotent */ }
  }

  try { await seed(db); } catch { /* race-safe */ }
}

export const db = globalForDb.__db ?? createDb();

if (!globalForDb.__dbInitialized) {
  globalForDb.__dbInitialized = true;
  // Fire-and-forget init — tables created before first real query
  initTables(db);
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}

export type DB = typeof db;
