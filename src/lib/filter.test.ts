import { describe, it, expect } from "vitest";
import { filterJobs } from "./filter";
import { Job } from "./types";

const jobs: Job[] = [
  {
    id: "1",
    title: "Build MCP Server",
    description: "Need an MCP server for AI tools",
    link: "",
    pubDate: "",
    budget: "$1000",
    category: "mcp",
    skills: ["TypeScript", "MCP"],
    country: "US",
  },
  {
    id: "2",
    title: "Rails Developer Needed",
    description: "Build a REST API",
    link: "",
    pubDate: "",
    budget: "$50/hr",
    category: "rails",
    skills: ["Ruby", "Rails"],
    country: "UK",
  },
  {
    id: "3",
    title: "React Native App",
    description: "Build a mobile app with TypeScript",
    link: "",
    pubDate: "",
    budget: "$2000",
    category: "react-native",
    skills: ["React Native", "TypeScript"],
    country: "US",
  },
];

describe("filterJobs", () => {
  it("returns all jobs when tab is 'all' and no search", () => {
    expect(filterJobs(jobs, "all", "")).toHaveLength(3);
  });

  it("filters by category tab", () => {
    const result = filterJobs(jobs, "mcp", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by search in title", () => {
    const result = filterJobs(jobs, "all", "Rails");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by search in description", () => {
    const result = filterJobs(jobs, "all", "mobile app");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("filters by search in skills", () => {
    const result = filterJobs(jobs, "all", "typescript");
    expect(result).toHaveLength(2); // jobs 1 and 3 have TypeScript
  });

  it("combines tab and search filters", () => {
    const result = filterJobs(jobs, "mcp", "typescript");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("is case insensitive", () => {
    expect(filterJobs(jobs, "all", "MCP")).toHaveLength(1);
    expect(filterJobs(jobs, "all", "mcp")).toHaveLength(1);
  });

  it("returns empty when no match", () => {
    expect(filterJobs(jobs, "all", "python")).toHaveLength(0);
  });

  it("returns empty when category has no jobs", () => {
    expect(filterJobs(jobs, "python", "")).toHaveLength(0);
  });
});
