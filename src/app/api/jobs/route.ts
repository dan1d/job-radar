import { NextRequest, NextResponse } from "next/server";
import { Job, JobSource } from "@/lib/types";
import { getCategories } from "@/lib/store";
import { getSetting } from "@/lib/settings";

// --- Parsing helpers (still exported for tests) ---

export function extractField(html: string, label: string): string {
  const regex = new RegExp(`<b>${label}<\\/b>:?\\s*([^<]+)`, "i");
  const match = html.match(regex);
  return match ? match[1].trim() : "";
}

export function extractSkills(html: string): string[] {
  const match = html.match(/<b>Skills<\/b>:?\s*(.*?)(?:<br|$)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((s) => s.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean);
}

export function parseJob(
  item: Record<string, string>,
  categoryId: string
): Job {
  const desc = item.description || item.content || "";
  return {
    id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
    title: (item.title || "").replace(/ - Upwork$/, ""),
    description: desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    link: item.link || "",
    pubDate: item.pubDate || "",
    budget:
      extractField(desc, "Budget") || extractField(desc, "Hourly Range"),
    category: categoryId,
    skills: extractSkills(desc),
    country: extractField(desc, "Country"),
    source: "remoteok",
  };
}

// --- Generic keyword matcher ---

function textMatchesQuery(text: string, query: string): boolean {
  const keywords = query.split(/\s+or\s+/i).map((k) => k.trim().toLowerCase());
  return keywords.some((kw) => text.toLowerCase().includes(kw));
}

// --- RemoteOK ---

interface RemoteOKJob {
  id: string;
  slug: string;
  position: string;
  description: string;
  url: string;
  date: string;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  location?: string;
  company?: string;
}

async function fetchRemoteOK(): Promise<RemoteOKJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "JobRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.slice(1) : [];
  } catch {
    return [];
  }
}

function remoteOKToJob(item: RemoteOKJob, categoryId: string): Job {
  const salary =
    item.salary_min && item.salary_max
      ? `$${(item.salary_min / 1000).toFixed(0)}k-$${(item.salary_max / 1000).toFixed(0)}k`
      : "";
  return {
    id: `rok-${item.id}-${categoryId}`,
    title: item.position,
    description: (item.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1000),
    link: `https://remoteok.com/remote-jobs/${item.slug}`,
    pubDate: item.date || "",
    budget: salary,
    category: categoryId,
    skills: (item.tags || []).slice(0, 10),
    country: item.location || "Remote",
    source: "remoteok",
  };
}

// --- Remotive ---

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  description: string;
  publication_date: string;
  salary: string;
  tags: string[];
  candidate_required_location: string;
  company_name: string;
}

async function fetchRemotive(): Promise<RemotiveJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=100", {
      headers: { "User-Agent": "JobRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

function remotiveToJob(item: RemotiveJob, categoryId: string): Job {
  return {
    id: `rem-${item.id}-${categoryId}`,
    title: item.title,
    description: (item.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1000),
    link: item.url,
    pubDate: item.publication_date || "",
    budget: item.salary || "",
    category: categoryId,
    skills: (item.tags || []).slice(0, 10),
    country: item.candidate_required_location || "Remote",
    source: "remotive",
  };
}

// --- Jobicy ---

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  jobDescription: string;
  pubDate?: string;
  jobGeo: string;
  jobType: string[];
  jobIndustry: string[];
  companyName: string;
}

async function fetchJobicy(): Promise<JobicyJob[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50", {
      headers: { "User-Agent": "JobRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

function jobicyToJob(item: JobicyJob, categoryId: string): Job {
  return {
    id: `jcy-${item.id}-${categoryId}`,
    title: (item.jobTitle || "").replace(/&amp;#8211;/g, "–").replace(/&amp;/g, "&"),
    description: (item.jobDescription || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1000),
    link: item.url,
    pubDate: item.pubDate || "",
    budget: "",
    category: categoryId,
    skills: (item.jobIndustry || []).slice(0, 10),
    country: item.jobGeo || "Remote",
    source: "jobicy",
  };
}

// --- Himalayas ---

interface HimalayasJob {
  title: string;
  excerpt: string;
  description: string;
  companyName: string;
  applicationLink: string;
  guid: string;
  pubDate: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  locationRestrictions: string[];
  categories: string[];
  seniority: string;
}

async function fetchHimalayas(): Promise<HimalayasJob[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=100", {
      headers: { "User-Agent": "JobRadar/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch {
    return [];
  }
}

function himalayasToJob(item: HimalayasJob, categoryId: string): Job {
  const salary =
    item.minSalary && item.maxSalary
      ? `${item.currency || "$"}${(item.minSalary / 1000).toFixed(0)}k-${(item.maxSalary / 1000).toFixed(0)}k`
      : "";
  const location = (item.locationRestrictions || []).join(", ") || "Remote";
  return {
    id: `him-${item.guid}-${categoryId}`,
    title: item.title,
    description: (item.description || item.excerpt || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1000),
    link: item.applicationLink || "",
    pubDate: item.pubDate || "",
    budget: salary,
    category: categoryId,
    skills: (item.categories || []).slice(0, 10),
    country: location,
    source: "himalayas",
  };
}

// --- Location filter ---

function getBlockedLocations(): Set<string> {
  try {
    const raw = getSetting("blocked_locations");
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return new Set(arr.map((s) => s.toLowerCase().trim()));
  } catch {
    return new Set();
  }
}

export function isLocationOpen(location: string, blocked?: Set<string>): boolean {
  if (!location) return true;
  const loc = location.toLowerCase().trim();
  if (loc === "remote" || loc === "worldwide" || loc === "anywhere" || loc === "") return true;
  const blockedSet = blocked ?? getBlockedLocations();
  if (blockedSet.has(loc)) return false;
  if (blockedSet.has(loc.replace(/^remote - /, ""))) return false;
  if (/\bus[a]?\b/.test(loc) && !loc.includes("worldwide")) return false;
  const commaCount = (loc.match(/,/g) || []).length;
  if (commaCount >= 2) return true;
  for (const b of blockedSet) {
    if (loc.startsWith(b)) return false;
  }
  return true;
}

// --- In-memory cache ---

function getCacheTtl(): number {
  return parseInt(getSetting("cache_ttl_ms") || "300000", 10);
}

interface CacheEntry<T> {
  data: T[];
  fetchedAt: number;
}

const sourceCache = new Map<string, CacheEntry<any>>();

async function cachedFetch<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  const entry = sourceCache.get(key);
  if (entry && Date.now() - entry.fetchedAt < getCacheTtl()) {
    return entry.data;
  }
  const data = await fetcher();
  sourceCache.set(key, { data, fetchedAt: Date.now() });
  return data;
}

// --- Source pipeline registry ---

type SourcePipeline<T> = {
  fetch: () => Promise<T[]>;
  searchText: (item: T) => string;
  toJob: (item: T, categoryId: string) => Job;
};

const SOURCE_PIPELINES: Record<string, SourcePipeline<any>> = {
  remoteok: {
    fetch: fetchRemoteOK,
    searchText: (j: RemoteOKJob) =>
      `${j.position} ${j.description} ${(j.tags || []).join(" ")}`,
    toJob: remoteOKToJob,
  },
  remotive: {
    fetch: fetchRemotive,
    searchText: (j: RemotiveJob) =>
      `${j.title} ${j.description} ${(j.tags || []).join(" ")}`,
    toJob: remotiveToJob,
  },
  jobicy: {
    fetch: fetchJobicy,
    searchText: (j: JobicyJob) =>
      `${j.jobTitle} ${j.jobDescription} ${(j.jobIndustry || []).join(" ")}`,
    toJob: jobicyToJob,
  },
  himalayas: {
    fetch: fetchHimalayas,
    searchText: (j: HimalayasJob) =>
      `${j.title} ${j.description} ${(j.categories || []).join(" ")}`,
    toJob: himalayasToJob,
  },
};

// --- Main handler ---

const seenIds = new Set<string>();

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category");
  const sourceFilter = request.nextUrl.searchParams.get("source");
  const allCategories = getCategories();

  const cats =
    categoryId && categoryId !== "all"
      ? allCategories.filter((c) => c.id === categoryId)
      : allCategories;

  const activeSources = sourceFilter
    ? { [sourceFilter]: SOURCE_PIPELINES[sourceFilter] }
    : SOURCE_PIPELINES;

  // Fetch from all active sources in parallel (with cache)
  const sourceEntries = Object.entries(activeSources);
  const fetchedData = await Promise.all(
    sourceEntries.map(([key, pipeline]) => cachedFetch(key, pipeline.fetch))
  );
  const sourceData = new Map(
    sourceEntries.map(([key], i) => [key, fetchedData[i]])
  );

  const allJobs: Job[] = [];
  const blocked = getBlockedLocations();

  for (const cat of cats) {
    for (const [sourceKey, pipeline] of Object.entries(activeSources)) {
      const items = sourceData.get(sourceKey) || [];
      const matched = items
        .filter((item: any) => textMatchesQuery(pipeline.searchText(item), cat.query))
        .map((item: any) => pipeline.toJob(item, cat.id))
        .filter((job: Job) => isLocationOpen(job.country, blocked));
      allJobs.push(...matched);
    }
  }

  // Dedup
  const newJobs: Job[] = [];
  const dedupedJobs: Job[] = [];
  for (const job of allJobs) {
    if (!seenIds.has(job.id)) {
      seenIds.add(job.id);
      newJobs.push(job);
    }
    dedupedJobs.push(job);
  }

  // Sort by date descending
  dedupedJobs.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return NextResponse.json({
    jobs: dedupedJobs,
    newCount: newJobs.length,
    totalSeen: seenIds.size,
  });
}
