import { Job } from "./types";

export function filterJobs(
  jobs: Job[],
  activeTab: string,
  search: string
): Job[] {
  return jobs.filter((job) => {
    const matchesTab = activeTab === "all" || job.category === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });
}
