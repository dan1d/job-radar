import { describe, it, expect, beforeEach } from "vitest";
import { getSetting, setSetting, getAllSettings, getSettingOrDefault } from "./settings";
import { db } from "./db";
import { settings } from "./db/schema";

describe("settings", () => {
  beforeEach(async () => {
    await db.delete(settings).run();
    await db.insert(settings).values({ key: "test_key", value: "test_value" }).run();
    await db.insert(settings).values({ key: "another_key", value: "another_value" }).run();
  });

  it("gets a setting by key", async () => {
    expect(await getSetting("test_key")).toBe("test_value");
  });

  it("returns null for missing key", async () => {
    expect(await getSetting("nonexistent")).toBeNull();
  });

  it("sets a new setting", async () => {
    await setSetting("new_key", "new_value");
    expect(await getSetting("new_key")).toBe("new_value");
  });

  it("overwrites an existing setting", async () => {
    await setSetting("test_key", "updated");
    expect(await getSetting("test_key")).toBe("updated");
  });

  it("returns all settings as a record", async () => {
    const all = await getAllSettings();
    expect(all.test_key).toBe("test_value");
    expect(all.another_key).toBe("another_value");
  });

  it("returns default for missing key", async () => {
    expect(await getSettingOrDefault("missing", "fallback")).toBe("fallback");
  });

  it("returns actual value over default", async () => {
    expect(await getSettingOrDefault("test_key", "fallback")).toBe("test_value");
  });
});
