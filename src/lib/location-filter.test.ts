import { describe, it, expect } from "vitest";
import { isLocationOpen } from "@/app/api/jobs/route";

const blocked = new Set(["us", "usa", "united states", "uk", "europe", "germany"]);

describe("isLocationOpen", () => {
  it("allows empty location", () => {
    expect(isLocationOpen("", blocked)).toBe(true);
  });

  it("allows Remote", () => {
    expect(isLocationOpen("Remote", blocked)).toBe(true);
  });

  it("allows Worldwide", () => {
    expect(isLocationOpen("Worldwide", blocked)).toBe(true);
  });

  it("allows Anywhere", () => {
    expect(isLocationOpen("Anywhere", blocked)).toBe(true);
  });

  it("blocks exact match", () => {
    expect(isLocationOpen("US", blocked)).toBe(false);
  });

  it("blocks case-insensitive", () => {
    expect(isLocationOpen("United States", blocked)).toBe(false);
  });

  it("blocks 'Remote - Country'", () => {
    expect(isLocationOpen("Remote - US", blocked)).toBe(false);
  });

  it("allows multi-region strings (3+ commas)", () => {
    expect(isLocationOpen("Argentina, Chile, Mexico, Colombia", blocked)).toBe(true);
  });

  it("blocks string starting with blocked country even with commas", () => {
    expect(isLocationOpen("US, UK", blocked)).toBe(false);
  });

  it("blocks prefix match", () => {
    expect(isLocationOpen("Germany, Berlin", blocked)).toBe(false);
  });

  it("allows non-blocked country", () => {
    expect(isLocationOpen("Argentina", blocked)).toBe(true);
  });
});
