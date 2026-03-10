import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  query: text("query").notNull(),
  proposalTemplate: text("proposal_template").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const manualJobs = sqliteTable("manual_jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  link: text("link").notNull().default(""),
  pubDate: text("pub_date").notNull(),
  budget: text("budget").notNull().default(""),
  category: text("category").notNull().default("manual"),
  skills: text("skills").notNull().default("[]"), // JSON array
  country: text("country").notNull().default(""),
  source: text("source").notNull().default("manual"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const appliedJobs = sqliteTable("applied_jobs", {
  jobId: text("job_id").primaryKey(),
  jobTitle: text("job_title").notNull().default(""),
  jobLink: text("job_link").notNull().default(""),
  appliedAt: text("applied_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
