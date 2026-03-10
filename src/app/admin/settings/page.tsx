"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SettingsForm {
  anthropic_api_key: string;
  ai_model: string;
  ai_max_tokens: string;
  cache_ttl_ms: string;
  blocked_locations: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    anthropic_api_key: "",
    ai_model: "",
    ai_max_tokens: "",
    cache_ttl_ms: "",
    blocked_locations: "",
  });
  const [redactedKey, setRedactedKey] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setRedactedKey(data.anthropic_api_key || "");

        // Parse blocked locations from JSON to newline-separated
        let blockedText = "";
        try {
          const arr = JSON.parse(data.blocked_locations || "[]");
          blockedText = arr.join("\n");
        } catch {
          blockedText = data.blocked_locations || "";
        }

        setForm({
          anthropic_api_key: "", // don't prefill the actual key
          ai_model: data.ai_model || "claude-sonnet-4-6",
          ai_max_tokens: data.ai_max_tokens || "500",
          cache_ttl_ms: data.cache_ttl_ms || "300000",
          blocked_locations: blockedText,
        });
      });
  }, []);

  const saveSetting = async (key: string, value: string) => {
    setSaving(key);
    setSaved(null);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const saveApiKey = () => {
    if (!form.anthropic_api_key) return;
    saveSetting("anthropic_api_key", form.anthropic_api_key).then(() => {
      const k = form.anthropic_api_key;
      setRedactedKey(`${"*".repeat(k.length - 4)}${k.slice(-4)}`);
      setForm((f) => ({ ...f, anthropic_api_key: "" }));
    });
  };

  const saveBlockedLocations = () => {
    const arr = form.blocked_locations
      .split("\n")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    saveSetting("blocked_locations", JSON.stringify(arr));
  };

  const testApiKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: "Test",
          jobDescription: "This is a connectivity test. Reply with: API key works!",
          template: "",
          instructions: "Just say: API key works!",
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        setTestResult({ ok: true, message: "API key is working" });
      } else {
        setTestResult({ ok: false, message: data.error || "Unknown error" });
      }
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  const SaveButton = ({ settingKey, onClick }: { settingKey: string; onClick: () => void }) => (
    <Button size="sm" onClick={onClick} disabled={saving === settingKey}>
      {saving === settingKey ? "Saving..." : saved === settingKey ? "Saved!" : "Save"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anthropic API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {redactedKey && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Current:</span>
              <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">
                {redactedKey}
              </code>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-ant-api03-..."
              value={form.anthropic_api_key}
              onChange={(e) => setForm({ ...form, anthropic_api_key: e.target.value })}
              className="flex-1"
            />
            <SaveButton settingKey="anthropic_api_key" onClick={saveApiKey} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={testApiKey} disabled={testing}>
              {testing ? "Testing..." : "Test API Key"}
            </Button>
            {testResult && (
              <Badge className={testResult.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                {testResult.message}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <div className="flex gap-2">
              <Input
                value={form.ai_model}
                onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
                placeholder="claude-sonnet-4-6"
                className="flex-1"
              />
              <SaveButton settingKey="ai_model" onClick={() => saveSetting("ai_model", form.ai_model)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={form.ai_max_tokens}
                onChange={(e) => setForm({ ...form, ai_max_tokens: e.target.value })}
                className="w-32"
              />
              <SaveButton settingKey="ai_max_tokens" onClick={() => saveSetting("ai_max_tokens", form.ai_max_tokens)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cache</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-sm font-medium">
            Cache TTL (seconds)
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={Math.round(parseInt(form.cache_ttl_ms || "300000") / 1000)}
              onChange={(e) =>
                setForm({ ...form, cache_ttl_ms: String(parseInt(e.target.value || "0") * 1000) })
              }
              className="w-32"
            />
            <span className="text-sm text-zinc-500">
              ({Math.round(parseInt(form.cache_ttl_ms || "300000") / 60000)} min)
            </span>
            <SaveButton settingKey="cache_ttl_ms" onClick={() => saveSetting("cache_ttl_ms", form.cache_ttl_ms)} />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Blocked Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-500">
            Jobs from these locations will be hidden. One per line.
          </p>
          <Textarea
            value={form.blocked_locations}
            onChange={(e) => setForm({ ...form, blocked_locations: e.target.value })}
            className="min-h-[200px] text-sm font-mono"
            placeholder={"us\nusa\nunited states\n..."}
          />
          <SaveButton settingKey="blocked_locations" onClick={saveBlockedLocations} />
        </CardContent>
      </Card>
    </div>
  );
}
