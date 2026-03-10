"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Job } from "@/lib/types";

export default function ManualJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", link: "", budget: "", skills: "", country: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/jobs/manual");
    const data = await res.json();
    setJobs(data.jobs);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    await fetch("/api/jobs/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", link: "", budget: "", skills: "", country: "" });
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/jobs/manual?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manual Jobs</h2>
        <Badge variant="secondary">{jobs.length} total</Badge>
      </div>

      {/* Add form */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          <p className="text-sm font-medium">Add Job</p>
          <Input
            placeholder="Job title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Job description *"
            className="min-h-[100px] text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Link (optional)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <Input
              placeholder="Budget (optional)"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Skills, comma-separated"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <Input
              placeholder="Country (optional)"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <Button onClick={save} disabled={saving || !form.title || !form.description}>
            {saving ? "Saving..." : "Add Job"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Job list */}
      {jobs.length === 0 ? (
        <p className="text-sm text-zinc-400">No manual jobs yet.</p>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-start justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-zinc-500 line-clamp-2">{job.description.slice(0, 150)}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    {job.budget && <span>{job.budget}</span>}
                    {job.country && <span>· {job.country}</span>}
                    <span>· {new Date(job.pubDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-4 shrink-0" onClick={() => remove(job.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
