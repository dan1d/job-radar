import { db } from "./db";
import { settings } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.insert(settings)
    .values({ key, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date().toISOString() },
    })
    .run();
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings).all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getSettingOrDefault(key: string, fallback: string): Promise<string> {
  return (await getSetting(key)) ?? fallback;
}
