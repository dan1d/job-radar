"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Job, JobCategory, JobSource } from "@/lib/types";
import { filterJobs } from "@/lib/filter";

const SOURCES: { key: JobSource | "all"; label: string }[] = [
  { key: "all", label: "All Sources" },
  { key: "remoteok", label: "RemoteOK" },
  { key: "remotive", label: "Remotive" },
  { key: "jobicy", label: "Jobicy" },
  { key: "himalayas", label: "Himalayas" },
];

const SOURCE_COLORS: Record<JobSource, string> = {
  remoteok: "bg-blue-100 text-blue-700",
  remotive: "bg-amber-100 text-amber-700",
  jobicy: "bg-teal-100 text-teal-700",
  himalayas: "bg-purple-100 text-purple-700",
  manual: "bg-violet-100 text-violet-700",
};

const SOURCE_LABELS: Record<JobSource, string> = {
  remoteok: "RemoteOK",
  remotive: "Remotive",
  jobicy: "Jobicy",
  himalayas: "Himalayas",
  manual: "Manual",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AddJobDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    budget: "",
    skills: "",
    country: "",
  });

  const save = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    try {
      await fetch("/api/jobs/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ title: "", description: "", link: "", budget: "", skills: "", country: "" });
      setOpen(false);
      onSaved();
    } catch {
      alert("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        + Add Job
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Job Manually</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Job title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Job description *"
            className="min-h-[120px] text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Budget (optional)"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
            <Input
              placeholder="Country (optional)"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <Input
            placeholder="Skills, comma-separated (optional)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />
          <Button onClick={save} disabled={saving || !form.title || !form.description}>
            {saving ? "Saving..." : "Save Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JobCard({
  job,
  template,
  applied,
  onToggleApplied,
}: {
  job: Job;
  template: string;
  applied: boolean;
  onToggleApplied: (jobId: string, applied: boolean, jobTitle?: string, jobLink?: string) => void;
}) {
  const [proposal, setProposal] = useState(template);
  const [copied, setCopied] = useState<"link" | "proposal" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [extraInstructions, setExtraInstructions] = useState("");

  const copy = (text: string, type: "link" | "proposal") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateProposal = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          template,
          instructions: extraInstructions,
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        setProposal(data.proposal);
      } else {
        alert(data.error || "Failed to generate");
      }
    } catch {
      alert("Failed to generate proposal");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className={`group transition-colors ${applied ? "opacity-50 border-emerald-300" : "hover:border-zinc-400"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {job.title}
              </a>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
              <Badge className={`text-xs ${SOURCE_COLORS[job.source]}`}>
                {SOURCE_LABELS[job.source]}
              </Badge>
              {applied && (
                <Badge className="text-xs bg-emerald-100 text-emerald-700">
                  Applied
                </Badge>
              )}
              <span>{timeAgo(job.pubDate)}</span>
              {job.budget && (
                <>
                  <span>·</span>
                  <span className="font-medium text-emerald-600">
                    {job.budget}
                  </span>
                </>
              )}
              {job.country && (
                <>
                  <span>·</span>
                  <span>{job.country}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant={applied ? "default" : "outline"}
              size="sm"
              className={applied ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              onClick={() => onToggleApplied(job.id, !applied, job.title, job.link)}
            >
              {applied ? "Applied" : "Mark Applied"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(job.link, "link")}
            >
              {copied === "link" ? "Copied!" : "Link"}
            </Button>
            <Dialog>
              <DialogTrigger render={<Button size="sm" />}>
                Apply
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base leading-snug pr-8">
                    {job.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="text-sm text-zinc-500 max-h-32 overflow-y-auto">
                    {job.description.slice(0, 500)}
                    {job.description.length > 500 && "..."}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Extra instructions for AI (optional)..."
                      value={extraInstructions}
                      onChange={(e) => setExtraInstructions(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={generateProposal}
                      disabled={generating}
                    >
                      {generating ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-[200px] text-sm"
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => copy(proposal, "proposal")}>
                      {copied === "proposal" ? "Copied!" : "Copy Proposal"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(job.link, "_blank", "noopener")
                      }
                    >
                      Open Job
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-zinc-600 line-clamp-2 mb-2">
          {job.description.slice(0, 200)}
          {job.description.length > 200 && "..."}
        </p>
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 8).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 8 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 8}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [stats, setStats] = useState({ newCount: 0, totalSeen: 0 });
  const [sourceFilter, setSourceFilter] = useState<JobSource | "all">("all");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [hideApplied, setHideApplied] = useState(false);

  const fetchApplied = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs/applied");
      const data = await res.json();
      setAppliedIds(new Set(data.map((e: { jobId: string }) => e.jobId)));
    } catch { /* ignore */ }
  }, []);

  const toggleApplied = useCallback(async (jobId: string, mark: boolean, jobTitle?: string, jobLink?: string) => {
    if (mark) {
      await fetch("/api/jobs/applied", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, jobTitle, jobLink }),
      });
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } else {
      await fetch(`/api/jobs/applied?jobId=${encodeURIComponent(jobId)}`, {
        method: "DELETE",
      });
      setAppliedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }, []);

  const fetchJobs = useCallback(
    async (categoryId?: string, source?: JobSource | "all") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId && categoryId !== "all" && categoryId !== "manual") {
          params.set("category", categoryId);
        }
        if (source && source !== "all") {
          params.set("source", source);
        }
        const qs = params.toString();
        const url = `/api/jobs${qs ? `?${qs}` : ""}`;

        const [apiRes, manualRes] = await Promise.all([
          categoryId === "manual" ? null : fetch(url),
          fetch("/api/jobs/manual"),
        ]);

        const apiData = apiRes ? await apiRes.json() : { jobs: [], newCount: 0, totalSeen: 0 };
        const manualData = await manualRes.json();

        const combined = categoryId === "manual"
          ? manualData.jobs
          : [...apiData.jobs, ...manualData.jobs];

        setJobs(combined);
        setStats({ newCount: apiData.newCount, totalSeen: apiData.totalSeen });
        setLastRefresh(new Date());
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchApplied();
    fetchCategories().then(() => fetchJobs("all", sourceFilter));
  }, [fetchApplied, fetchCategories, fetchJobs, sourceFilter]);

  const filteredJobs = filterJobs(jobs, activeTab, search)
    .filter((job) => !hideApplied || !appliedIds.has(job.id));

  const getTemplate = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.proposalTemplate || categories[0]?.proposalTemplate || "";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              Job Radar
            </h1>
            <Badge variant="secondary" className="text-xs font-mono">
              {filteredJobs.length} jobs
            </Badge>
            {stats.newCount > 0 && (
              <Badge className="text-xs bg-emerald-100 text-emerald-700">
                {stats.newCount} new
              </Badge>
            )}
            {appliedIds.size > 0 && (
              <Badge className="text-xs bg-emerald-50 text-emerald-600">
                {appliedIds.size} applied
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {appliedIds.size > 0 && (
              <Button
                variant={hideApplied ? "default" : "outline"}
                size="sm"
                onClick={() => setHideApplied(!hideApplied)}
              >
                {hideApplied ? "Show Applied" : "Hide Applied"}
              </Button>
            )}
            {lastRefresh && (
              <span className="text-xs text-zinc-400">
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <AddJobDialog onSaved={() => fetchJobs(activeTab, sourceFilter)} />
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchJobs(activeTab, sourceFilter)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Filter jobs by keyword, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-1 flex-wrap">
            {SOURCES.map(({ key, label }) => (
              <Button
                key={key}
                variant={sourceFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSourceFilter(key);
                  fetchJobs(activeTab, key);
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            fetchJobs(v, sourceFilter);
          }}
        >
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {jobs.filter((j) => j.category === cat.id).length}
                </Badge>
              </TabsTrigger>
            ))}
            <TabsTrigger value="manual">
              Manual
              <Badge variant="secondary" className="ml-1 text-xs">
                {jobs.filter((j) => j.category === "manual").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <TabsContent value={activeTab} className="mt-0">
              {loading && filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  Fetching jobs...
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  No jobs found. Try refreshing or changing filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      template={getTemplate(job.category)}
                      applied={appliedIds.has(job.id)}
                      onToggleApplied={toggleApplied}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
}
