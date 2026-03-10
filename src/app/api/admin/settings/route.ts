import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setSetting } from "@/lib/settings";

const ALLOWED_KEYS = new Set([
  "anthropic_api_key",
  "ai_model",
  "ai_max_tokens",
  "cache_ttl_ms",
  "blocked_locations",
]);

export async function GET() {
  const all = getAllSettings();
  // Redact API key for display
  if (all.anthropic_api_key) {
    const key = all.anthropic_api_key;
    all.anthropic_api_key = key.length > 8
      ? `${"*".repeat(key.length - 4)}${key.slice(-4)}`
      : "*".repeat(key.length);
  }
  return NextResponse.json(all);
}

export async function PUT(request: NextRequest) {
  const { key, value } = await request.json();

  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: `Unknown setting: ${key}` }, { status: 400 });
  }

  setSetting(key, value);
  return NextResponse.json({ ok: true });
}
