"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { JobCategory } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [editing, setEditing] = useState<JobCategory | null>(null);
  const [form, setForm] = useState({ id: "", label: "", query: "", proposalTemplate: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ id: "", label: "", query: "", proposalTemplate: "" });
    setEditing(null);
  };

  const startEdit = (cat: JobCategory) => {
    setForm({ ...cat });
    setEditing(cat);
  };

  const save = async () => {
    if (!form.id || !form.label || !form.query) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    startNew();
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Categories</h2>

      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-start justify-between py-3">
              <div className="space-y-1">
                <p className="font-medium">{cat.label}</p>
                <p className="text-sm text-zinc-500">
                  Query: <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{cat.query}</code>
                </p>
                {cat.proposalTemplate && (
                  <p className="text-xs text-zinc-400 line-clamp-2 max-w-lg">
                    {cat.proposalTemplate.slice(0, 120)}...
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0 ml-4">
                <Button variant="outline" size="sm" onClick={() => startEdit(cat)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => remove(cat.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editing ? `Editing: ${editing.label}` : "Add Category"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">ID</label>
              <Input
                placeholder="e.g. python"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Label</label>
              <Input
                placeholder="e.g. Python"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Search Query</label>
            <Input
              placeholder="e.g. python OR django"
              value={form.query}
              onChange={(e) => setForm({ ...form, query: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Proposal Template</label>
            <Textarea
              placeholder="Your proposal template for this category..."
              value={form.proposalTemplate}
              onChange={(e) => setForm({ ...form, proposalTemplate: e.target.value })}
              className="min-h-[160px] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={!form.id || !form.label || !form.query}>
              {editing ? "Update" : "Add Category"}
            </Button>
            {editing && (
              <Button variant="outline" onClick={startNew}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
