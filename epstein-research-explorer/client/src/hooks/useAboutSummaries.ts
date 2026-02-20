import { useEffect, useMemo, useState } from "react";
import type { AboutSummary } from "@/lib/aboutTypes";
import { loadAboutSummaries } from "@/lib/loadAboutSummaries";

export function useAboutSummaries() {
  const [data, setData] = useState<AboutSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadAboutSummaries()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message ?? "Failed to load");
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const docs = data ?? [];
    const docTypes: Record<string, number> = {};
    const topics: Record<string, number> = {};
    const buckets: Record<string, number> = {};
    let doi = 0, pubmed = 0, arxiv = 0;

    for (const d of docs) {
      docTypes[d.doc_type] = (docTypes[d.doc_type] ?? 0) + 1;
      for (const t of d.top_topics ?? []) {
        topics[t] = (topics[t] ?? 0) + 1;
      }
      if (d.timeline_bucket) buckets[d.timeline_bucket] = (buckets[d.timeline_bucket] ?? 0) + 1;
      if (d.has_doi) doi++;
      if (d.has_pubmed_or_pmid) pubmed++;
      if (d.has_arxiv) arxiv++;
    }

    return {
      total: docs.length,
      docTypes,
      topTopics: Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 12),
      buckets: Object.entries(buckets).sort((a, b) => a[0].localeCompare(b[0])),
      artifacts: { doi, pubmed, arxiv },
    };
  }, [data]);

  return { data, error, loading, stats };
}
