import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./index";
import { manualJobs } from "./schema";
import { eq, desc } from "drizzle-orm";

describe("manualJobs table", () => {
  beforeEach(async () => {
    await db.delete(manualJobs).run();
  });

  it("inserts and retrieves a manual job", async () => {
    await db.insert(manualJobs)
      .values({
        id: "manual-1",
        title: "Test Job",
        description: "A test job description",
        pubDate: new Date().toISOString(),
        skills: JSON.stringify(["TypeScript", "React"]),
        country: "Remote",
      })
      .run();

    const rows = await db.select().from(manualJobs).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Test Job");
    expect(JSON.parse(rows[0].skills)).toEqual(["TypeScript", "React"]);
  });

  it("orders by createdAt desc", async () => {
    await db.insert(manualJobs)
      .values({ id: "m-1", title: "First", description: "d", pubDate: "2026-01-01", createdAt: "2026-01-01T00:00:00Z" })
      .run();
    await db.insert(manualJobs)
      .values({ id: "m-2", title: "Second", description: "d", pubDate: "2026-01-02", createdAt: "2026-01-02T00:00:00Z" })
      .run();

    const rows = await db.select().from(manualJobs).orderBy(desc(manualJobs.createdAt)).all();
    expect(rows[0].id).toBe("m-2");
  });

  it("deletes a manual job", async () => {
    await db.insert(manualJobs)
      .values({ id: "m-1", title: "Delete Me", description: "d", pubDate: "2026-01-01" })
      .run();

    await db.delete(manualJobs).where(eq(manualJobs.id, "m-1")).run();
    const rows = await db.select().from(manualJobs).all();
    expect(rows).toHaveLength(0);
  });
});
