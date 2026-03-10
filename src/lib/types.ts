export type JobSource = "remoteok" | "remotive" | "jobicy" | "himalayas" | "manual";

export interface Job {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  budget: string;
  category: string;
  skills: string[];
  country: string;
  source: JobSource;
}

export interface JobCategory {
  id: string;
  label: string;
  query: string;
  proposalTemplate: string;
}
