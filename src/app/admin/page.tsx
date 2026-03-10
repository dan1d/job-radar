"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Stats {
  categories: number;
  applied: number;
  manualJobs: number;
  apiKeySet: boolean;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [catRes, appliedRes, manualRes, settingsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/jobs/applied"),
        fetch("/api/jobs/manual"),
        fetch("/api/admin/settings"),
      ]);
      const cats = await catRes.json();
      const applied = await appliedRes.json();
      const manual = await manualRes.json();
      const settings = await settingsRes.json();

      setStats({
        categories: cats.length,
        applied: applied.length,
        manualJobs: manual.jobs.length,
        apiKeySet: !!(settings.anthropic_api_key && !settings.anthropic_api_key.startsWith("*".repeat(4)) === false && settings.anthropic_api_key.length > 0),
      });
    }
    load();
  }, []);

  if (!stats) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  const cards = [
    { title: "Categories", value: stats.categories, href: "/admin/categories" },
    { title: "Applied Jobs", value: stats.applied, href: "/admin/applied" },
    { title: "Manual Jobs", value: stats.manualJobs, href: "/admin/jobs" },
    {
      title: "API Key",
      value: stats.apiKeySet ? "Configured" : "Not set",
      href: "/admin/settings",
      highlight: !stats.apiKeySet,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:border-zinc-400 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-500">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${card.highlight ? "text-amber-600" : ""}`}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
