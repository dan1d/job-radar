"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppliedEntry {
  jobId: string;
  jobTitle: string;
  jobLink: string;
  appliedAt: string;
}

export default function AppliedPage() {
  const [entries, setEntries] = useState<AppliedEntry[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/jobs/applied");
    setEntries(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (jobId: string) => {
    await fetch(`/api/jobs/applied?jobId=${encodeURIComponent(jobId)}`, {
      method: "DELETE",
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Applied Jobs</h2>
        <Badge variant="secondary">{entries.length} total</Badge>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-400">No applied jobs yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.jobId}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {entry.jobTitle || entry.jobId}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>{new Date(entry.appliedAt).toLocaleDateString()}</span>
                    {entry.jobLink && (
                      <>
                        <span>·</span>
                        <a
                          href={entry.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-xs"
                        >
                          View posting
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => remove(entry.jobId)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
