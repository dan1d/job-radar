import { db } from "./db";
import { categories } from "./db/schema";
import { eq, asc } from "drizzle-orm";
import { JobCategory } from "./types";

export async function getCategories(): Promise<JobCategory[]> {
  return db
    .select({
      id: categories.id,
      label: categories.label,
      query: categories.query,
      proposalTemplate: categories.proposalTemplate,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .all();
}

export async function upsertCategory(category: JobCategory): Promise<JobCategory[]> {
  const existing = await db.select().from(categories).where(eq(categories.id, category.id)).get();
  if (existing) {
    await db.update(categories)
      .set({
        label: category.label,
        query: category.query,
        proposalTemplate: category.proposalTemplate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, category.id))
      .run();
  } else {
    const all = await db.select({ sortOrder: categories.sortOrder })
      .from(categories)
      .orderBy(asc(categories.sortOrder))
      .all();
    await db.insert(categories)
      .values({
        id: category.id,
        label: category.label,
        query: category.query,
        proposalTemplate: category.proposalTemplate,
        sortOrder: all.length,
      })
      .run();
  }
  return getCategories();
}

export async function deleteCategory(id: string): Promise<JobCategory[]> {
  await db.delete(categories).where(eq(categories.id, id)).run();
  return getCategories();
}
