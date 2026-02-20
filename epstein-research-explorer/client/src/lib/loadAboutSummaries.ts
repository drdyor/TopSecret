import type { AboutSummary } from "./aboutTypes";

export async function loadAboutSummaries(): Promise<AboutSummary[]> {
  const res = await fetch("/about_summaries.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load about_summaries.json (${res.status})`);
  }
  const data = await res.json();
  return data as AboutSummary[];
}
