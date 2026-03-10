import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";
import { seed } from "./seed";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "job-radar.db");

const globalForDb = globalThis as unknown as {
  __db?: ReturnType<typeof createDb>;
};

function createDb() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 10000");
  sqlite.pragma("foreign_keys = ON");

  // Create tables — idempotent, each statement is independent to minimize lock time
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
    try { sqlite.exec(ddl); } catch { /* another worker may hold the lock — tables are idempotent */ }
  }

  const db = drizzle(sqlite, { schema });

  // Seed defaults — all use ON CONFLICT DO NOTHING, safe for concurrent workers
  try { seed(db); } catch { /* race with another worker is fine */ }

  return db;
}

export const db = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}

export type DB = typeof db;
