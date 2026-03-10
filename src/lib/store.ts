import { db } from "./db";
import { categories } from "./db/schema";
import { eq, asc } from "drizzle-orm";
import { JobCategory } from "./types";

export function getCategories(): JobCategory[] {
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

export function upsertCategory(category: JobCategory): JobCategory[] {
  const existing = db.select().from(categories).where(eq(categories.id, category.id)).get();
  if (existing) {
    db.update(categories)
      .set({
        label: category.label,
        query: category.query,
        proposalTemplate: category.proposalTemplate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, category.id))
      .run();
  } else {
    const maxOrder = db.select({ sortOrder: categories.sortOrder })
      .from(categories)
      .orderBy(asc(categories.sortOrder))
      .all();
    db.insert(categories)
      .values({
        id: category.id,
        label: category.label,
        query: category.query,
        proposalTemplate: category.proposalTemplate,
        sortOrder: maxOrder.length,
      })
      .run();
  }
  return getCategories();
}

export function deleteCategory(id: string): JobCategory[] {
  db.delete(categories).where(eq(categories.id, id)).run();
  return getCategories();
}
