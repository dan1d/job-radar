import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./index";
import { appliedJobs } from "./schema";
import { eq } from "drizzle-orm";

describe("appliedJobs table", () => {
  beforeEach(async () => {
    await db.delete(appliedJobs).run();
  });

  it("inserts and retrieves an applied job", async () => {
    await db.insert(appliedJobs)
      .values({ jobId: "job-1", jobTitle: "Test Job", jobLink: "https://example.com" })
      .run();

    const rows = await db.select().from(appliedJobs).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].jobId).toBe("job-1");
    expect(rows[0].jobTitle).toBe("Test Job");
    expect(rows[0].jobLink).toBe("https://example.com");
    expect(rows[0].appliedAt).toBeTruthy();
  });

  it("onConflictDoNothing prevents duplicates", async () => {
    await db.insert(appliedJobs).values({ jobId: "job-1" }).run();
    await db.insert(appliedJobs).values({ jobId: "job-1" }).onConflictDoNothing().run();

    const rows = await db.select().from(appliedJobs).all();
    expect(rows).toHaveLength(1);
  });

  it("deletes an applied job", async () => {
    await db.insert(appliedJobs).values({ jobId: "job-1" }).run();
    await db.insert(appliedJobs).values({ jobId: "job-2" }).run();

    await db.delete(appliedJobs).where(eq(appliedJobs.jobId, "job-1")).run();

    const rows = await db.select().from(appliedJobs).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].jobId).toBe("job-2");
  });
});
