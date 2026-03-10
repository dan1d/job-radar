import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const mockCategories = [
  {
    id: "mcp",
    label: "MCP Servers",
    query: "MCP server",
    proposalTemplate: "I build MCP servers.",
  },
  {
    id: "rails",
    label: "Ruby on Rails",
    query: "ruby on rails",
    proposalTemplate: "I build Rails apps.",
  },
];

const mockJobs = [
  {
    id: "job-1",
    title: "Build an MCP Server",
    description: "We need an MCP server for our tools.",
    link: "https://upwork.com/jobs/1",
    pubDate: new Date().toISOString(),
    budget: "$1000",
    category: "mcp",
    skills: ["TypeScript", "MCP"],
    country: "US",
    source: "remoteok",
  },
  {
    id: "job-2",
    title: "Rails API Developer",
    description: "Build a REST API with Rails.",
    link: "https://upwork.com/jobs/2",
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    budget: "$50/hr",
    category: "rails",
    skills: ["Ruby", "Rails", "PostgreSQL"],
    country: "UK",
    source: "remotive",
  },
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string) => {
    if (url === "/api/categories") {
      return { ok: true, json: async () => mockCategories };
    }
    if (url === "/api/jobs/applied") {
      return { ok: true, json: async () => [] };
    }
    if (url.startsWith("/api/jobs")) {
      return {
        ok: true,
        json: async () => ({ jobs: mockJobs, newCount: 2, totalSeen: 2 }),
      };
    }
    return { ok: true, json: async () => ({}) };
  });
  vi.stubGlobal("fetch", fetchMock);
});

async function renderLoaded() {
  render(<Home />);
  // Wait for jobs to appear (base-ui may render multiple DOM nodes)
  await waitFor(() => {
    expect(screen.getAllByText("Build an MCP Server").length).toBeGreaterThan(0);
  });
}

describe("Home page", () => {
  it("renders header and loads jobs", async () => {
    await renderLoaded();
    expect(screen.getByText("Job Radar")).toBeInTheDocument();
    expect(screen.getAllByText("Build an MCP Server").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rails API Developer").length).toBeGreaterThan(0);
  });

  it("fetches categories and jobs on mount", async () => {
    await renderLoaded();
    expect(fetchMock).toHaveBeenCalledWith("/api/categories");
    expect(fetchMock).toHaveBeenCalledWith("/api/jobs");
  });

  it("shows category tabs", async () => {
    await renderLoaded();
    const tabs = screen.getAllByRole("tab");
    const names = tabs.map((t) => t.textContent || "");
    expect(names.some((n) => n.includes("MCP Servers"))).toBe(true);
    expect(names.some((n) => n.includes("Ruby on Rails"))).toBe(true);
    expect(names.some((n) => n.includes("All"))).toBe(true);
  });

  it("shows skills as badges", async () => {
    await renderLoaded();
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0);
  });

  it("shows budget", async () => {
    await renderLoaded();
    expect(screen.getAllByText("$1000").length).toBeGreaterThan(0);
  });

  it("has a search input", async () => {
    await renderLoaded();
    const inputs = screen.getAllByPlaceholderText(
      "Filter jobs by keyword, skill..."
    );
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("has admin link", async () => {
    await renderLoaded();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
  });

  it("refresh triggers new fetch", async () => {
    const user = userEvent.setup();
    await renderLoaded();

    const callsBefore = fetchMock.mock.calls.length;
    await user.click(screen.getAllByText("Refresh")[0]);

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
