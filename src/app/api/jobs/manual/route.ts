import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { manualJobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Job } from "@/lib/types";

function rowToJob(row: typeof manualJobs.$inferSelect): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    link: row.link,
    pubDate: row.pubDate,
    budget: row.budget,
    category: row.category,
    skills: JSON.parse(row.skills),
    country: row.country,
    source: "manual",
  };
}

export async function GET() {
  const rows = await db.select().from(manualJobs).orderBy(desc(manualJobs.createdAt)).all();
  return NextResponse.json({ jobs: rows.map(rowToJob) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, link, budget, skills, country } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const parsedSkills =
    typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : skills || [];

  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const pubDate = new Date().toISOString();

  await db.insert(manualJobs)
    .values({
      id,
      title,
      description,
      link: link || "",
      pubDate,
      budget: budget || "",
      skills: JSON.stringify(parsedSkills),
      country: country || "",
    })
    .run();

  const job: Job = {
    id,
    title,
    description,
    link: link || "",
    pubDate,
    budget: budget || "",
    category: "manual",
    skills: parsedSkills,
    country: country || "",
    source: "manual",
  };

  return NextResponse.json({ job });
}

export async function DELETE(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");
  if (!jobId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await db.delete(manualJobs).where(eq(manualJobs.id, jobId)).run();
  return NextResponse.json({ ok: true });
}
