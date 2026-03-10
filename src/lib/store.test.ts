import { describe, it, expect, beforeEach } from "vitest";
import { getCategories, upsertCategory, deleteCategory } from "./store";
import { db } from "./db";
import { categories } from "./db/schema";
import { JobCategory } from "./types";

describe("store", () => {
  beforeEach(() => {
    // Clear and re-seed categories for each test
    db.delete(categories).run();
    const seed = [
      { id: "test-a", label: "Test A", query: "a query", proposalTemplate: "tpl a", sortOrder: 0 },
      { id: "test-b", label: "Test B", query: "b query", proposalTemplate: "tpl b", sortOrder: 1 },
    ];
    for (const s of seed) {
      db.insert(categories).values(s).run();
    }
  });

  it("returns categories from db", () => {
    const cats = getCategories();
    expect(cats.length).toBe(2);
    expect(cats[0]).toHaveProperty("id");
    expect(cats[0]).toHaveProperty("label");
    expect(cats[0]).toHaveProperty("query");
  });

  it("upserts a new category", () => {
    const newCat: JobCategory = {
      id: "new-cat",
      label: "New",
      query: "new query",
      proposalTemplate: "new template",
    };
    const result = upsertCategory(newCat);
    expect(result.length).toBe(3);
    expect(result.find((c) => c.id === "new-cat")).toMatchObject(newCat);
  });

  it("upserts an existing category", () => {
    const updated: JobCategory = {
      id: "test-a",
      label: "Updated Label",
      query: "a query",
      proposalTemplate: "tpl a",
    };
    const result = upsertCategory(updated);
    expect(result.length).toBe(2);
    expect(result.find((c) => c.id === "test-a")?.label).toBe("Updated Label");
  });

  it("deletes a category", () => {
    const result = deleteCategory("test-a");
    expect(result.length).toBe(1);
    expect(result.find((c) => c.id === "test-a")).toBeUndefined();
  });
});
