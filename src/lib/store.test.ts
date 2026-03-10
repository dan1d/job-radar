import { describe, it, expect, beforeEach } from "vitest";
import { getCategories, upsertCategory, deleteCategory } from "./store";
import { db } from "./db";
import { categories } from "./db/schema";
import { JobCategory } from "./types";

describe("store", () => {
  beforeEach(async () => {
    await db.delete(categories).run();
    await db.insert(categories).values({ id: "test-a", label: "Test A", query: "a query", proposalTemplate: "tpl a", sortOrder: 0 }).run();
    await db.insert(categories).values({ id: "test-b", label: "Test B", query: "b query", proposalTemplate: "tpl b", sortOrder: 1 }).run();
  });

  it("returns categories from db", async () => {
    const cats = await getCategories();
    expect(cats.find((c) => c.id === "test-a")).toBeTruthy();
    expect(cats.find((c) => c.id === "test-b")).toBeTruthy();
  });

  it("upserts a new category", async () => {
    const newCat: JobCategory = {
      id: "store-test-new",
      label: "New",
      query: "new query",
      proposalTemplate: "new template",
    };
    const result = await upsertCategory(newCat);
    expect(result.find((c) => c.id === "store-test-new")).toMatchObject(newCat);
    await deleteCategory("store-test-new");
  });

  it("upserts an existing category", async () => {
    const updated: JobCategory = {
      id: "test-a",
      label: "Updated Label",
      query: "a query",
      proposalTemplate: "tpl a",
    };
    const result = await upsertCategory(updated);
    expect(result.find((c) => c.id === "test-a")?.label).toBe("Updated Label");
  });

  it("deletes a category", async () => {
    const result = await deleteCategory("test-b");
    expect(result.find((c) => c.id === "test-b")).toBeUndefined();
  });
});
