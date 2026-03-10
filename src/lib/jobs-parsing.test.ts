import { describe, it, expect } from "vitest";
import { extractField, extractSkills, parseJob } from "@/app/api/jobs/route";

describe("extractField", () => {
  it("extracts budget from html", () => {
    const html = `<b>Budget</b>: $500`;
    expect(extractField(html, "Budget")).toBe("$500");
  });

  it("extracts hourly range", () => {
    const html = `<b>Hourly Range</b>: $25.00-$50.00`;
    expect(extractField(html, "Hourly Range")).toBe("$25.00-$50.00");
  });

  it("extracts country", () => {
    const html = `<b>Country</b>: United States`;
    expect(extractField(html, "Country")).toBe("United States");
  });

  it("returns empty for missing field", () => {
    expect(extractField("<b>Other</b>: value", "Budget")).toBe("");
  });
});

describe("extractSkills", () => {
  it("extracts comma-separated skills", () => {
    const html = `<b>Skills</b>: TypeScript, Node.js, React<br>`;
    expect(extractSkills(html)).toEqual(["TypeScript", "Node.js", "React"]);
  });

  it("returns empty array for no skills", () => {
    expect(extractSkills("<b>Budget</b>: $100")).toEqual([]);
  });

  it("strips html tags from skills", () => {
    const html = `<b>Skills</b>: <a>TypeScript</a>, <span>React</span>`;
    expect(extractSkills(html)).toEqual(["TypeScript", "React"]);
  });
});

describe("parseJob", () => {
  it("parses a full RSS item", () => {
    const item = {
      guid: "job-123",
      title: "Build MCP Server - Upwork",
      link: "https://upwork.com/jobs/123",
      pubDate: "2026-03-07T10:00:00Z",
      description:
        '<b>Budget</b>: $1000<br><b>Skills</b>: TypeScript, MCP<br><b>Country</b>: Argentina<br>We need an MCP server built.',
    };
    const job = parseJob(item, "mcp");
    expect(job.id).toBe("job-123");
    expect(job.title).toBe("Build MCP Server");
    expect(job.budget).toBe("$1000");
    expect(job.skills).toEqual(["TypeScript", "MCP"]);
    expect(job.country).toBe("Argentina");
    expect(job.category).toBe("mcp");
    expect(job.link).toBe("https://upwork.com/jobs/123");
  });

  it("handles missing fields gracefully", () => {
    const item = { description: "" } as Record<string, string>;
    const job = parseJob(item, "test");
    expect(job.title).toBe("");
    expect(job.budget).toBe("");
    expect(job.skills).toEqual([]);
    expect(job.country).toBe("");
  });

  it("uses content field as fallback", () => {
    const item = {
      guid: "j1",
      title: "Job",
      link: "https://upwork.com/j1",
      pubDate: "",
      content: "<b>Budget</b>: $200",
    };
    const job = parseJob(item, "test");
    expect(job.budget).toBe("$200");
  });
});
