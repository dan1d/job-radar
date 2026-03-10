import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appliedJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const entries = db.select().from(appliedJobs).all();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const { jobId, jobTitle, jobLink } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  db.insert(appliedJobs)
    .values({
      jobId,
      jobTitle: jobTitle || "",
      jobLink: jobLink || "",
      appliedAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  db.delete(appliedJobs).where(eq(appliedJobs.jobId, jobId)).run();
  return NextResponse.json({ ok: true });
}
