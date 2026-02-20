import { useState, useMemo } from "react";
import { Search, FileText, Zap, BookOpen, ExternalLink, Github, Mail, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { AboutSummary } from "@/lib/aboutTypes";
import { useAboutSummaries } from "@/hooks/useAboutSummaries";
import PDFLink from "@/components/PDFLink";
import HighlightedText from "@/components/HighlightedText";
import MultiHighlightedText from "@/components/MultiHighlightedText";
import HighlightLegend from "@/components/HighlightLegend";
import { countMultiMatches } from "@/lib/multiHighlightUtils";

function prettyDocType(t: string) {
  return t.replaceAll("_", " ").toLowerCase();
}

function artifactLabel(d: AboutSummary) {
  const parts = [];
  if (d.has_doi) parts.push("DOI");
  if (d.has_pubmed_or_pmid) parts.push("PMID");
  if (d.has_arxiv) parts.push("arXiv");
  return parts.length ? parts.join(" • ") : "None";
}

export default function ResearchExplorer() {
  const { data, loading, error, stats } = useAboutSummaries();

  const [query, setQuery] = useState("");
  const [docType, setDocType] = useState<string>("ALL");
  const [bucket, setBucket] = useState<string>("ALL");
  const [artifact, setArtifact] = useState<string>("ALL");
  const [sort, setSort] = useState<string>("SCORE");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [highlightTerm, setHighlightTerm] = useState<string>("");
  const [multiHighlightTerms, setMultiHighlightTerms] = useState<string[]>([]);
  const [showMultiMode, setShowMultiMode] = useState(false);
  const [showIntelligenceBrief, setShowIntelligenceBrief] = useState(false);

  const handleAddHighlightTerm = (term: string) => {
    if (term.trim() && !multiHighlightTerms.includes(term)) {
      setMultiHighlightTerms([...multiHighlightTerms, term]);
    }
  };

  const handleRemoveHighlightTerm = (term: string) => {
    setMultiHighlightTerms(multiHighlightTerms.filter((t) => t !== term));
  };

  const filtered = useMemo(() => {
    const docs = data ?? [];
    let out = docs;

    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((d) => {
        const hay = [
          d.file,
          d.about,
          d.significance,
          d.doc_type,
          ...(d.top_topics ?? []),
          ...(d.key_excerpts ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (docType !== "ALL") {
      out = out.filter((d) => d.doc_type === docType);
    }
    if (bucket !== "ALL") {
      out = out.filter((d) => (d.timeline_bucket ?? "NONE") === bucket);
    }
    if (artifact !== "ALL") {
      out = out.filter((d) => {
        if (artifact === "DOI") return d.has_doi;
        if (artifact === "PUBMED") return d.has_pubmed_or_pmid;
        if (artifact === "ARXIV") return d.has_arxiv;
        return true;
      });
    }

    out = [...out].sort((a, b) => {
      if (sort === "FILE") return a.file.localeCompare(b.file);
      if (sort === "DATE") return (a.timeline_bucket ?? "9999-99").localeCompare(b.timeline_bucket ?? "9999-99");
      const scoreA = (a.topic_scores?.reduce((s, x) => s + (x?.[1] ?? 0), 0) ?? 0) + (a.procedure_density ?? 0);
      const scoreB = (b.topic_scores?.reduce((s, x) => s + (x?.[1] ?? 0), 0) ?? 0) + (b.procedure_density ?? 0);
      return scoreB - scoreA;
    });

    return out;
  }, [data, query, docType, bucket, artifact, sort]);

  const selected = useMemo(() => {
    if (!filtered.length) return null;
    const file = selectedFile ?? filtered[0]?.file;
    return filtered.find((d) => d.file === file) ?? filtered[0] ?? null;
  }, [filtered, selectedFile]);

  const multiMatchCounts = useMemo(() => {
    if (!selected || !showMultiMode) return {};
    const fullText = (selected.about || "") + (selected.significance || "") + ((selected.key_excerpts?.join(" ")) || "");
    return countMultiMatches(fullText, multiHighlightTerms);
  }, [selected, multiHighlightTerms, showMultiMode]);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    (data ?? []).forEach((d) => {
      (d.top_topics ?? []).forEach((t) => topics.add(t));
    });
    return Array.from(topics).sort();
  }, [data]);

  const recurringInterventions = useMemo(() => {
    const interventions: Record<string, number> = {};
    (filtered ?? []).forEach((d) => {
      (d.top_topics ?? []).forEach((t) => {
        interventions[t] = (interventions[t] || 0) + 1;
      });
    });
    return Object.entries(interventions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [filtered]);

  const citedPercentage = useMemo(() => {
    if (!filtered.length) return 0;
    const cited = filtered.filter((d) => d.has_doi || d.has_pubmed_or_pmid || d.has_arxiv).length;
    return Math.round((cited / filtered.length) * 100);
  }, [filtered]);

  const generateIntelligenceBrief = () => {
    const brief = `
# Intelligence Brief: Epstein Medical Research Analysis

## Signal Overview
- Total Documents: ${filtered.length}
- DOI Citations: ${stats.artifacts.doi}
- PubMed/PMID: ${stats.artifacts.pubmed}
- Cited Documents: ${citedPercentage}%

## Dominant Themes
${allTopics.slice(0, 5).map((t) => `- ${t}`).join("\n")}

## Recurring Interventions
${recurringInterventions.map(([intervention, count]) => `- ${intervention}: ${count} documents`).join("\n")}

## Timeline Coverage
${stats.buckets?.slice(0, 5).map(([bucket, count]) => `- ${bucket}: ${count} documents`).join("\n")}

## Key Findings
- Pattern analysis across ${filtered.length} documents
- Signal density: ${((stats.artifacts.doi + stats.artifacts.pubmed) / filtered.length).toFixed(2)} citations per document
- Research momentum indicates focus on: ${allTopics.slice(0, 3).join(", ")}

---
Generated from Epstein Medical Research Explorer
    `;
    return brief;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-slate-50 mb-1" style={{ fontFamily: "Georgia, serif" }}>
                EPSTEIN MEDICAL INTELLIGENCE
              </h1>
              <p className="text-sm text-slate-400">Forensic extraction of biomedical research signals.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Signal Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
            <div className="flex items-center gap-6">
              <span>{filtered.length} Documents</span>
              <span>•</span>
              <span>{stats.artifacts.doi} DOI</span>
              <span>•</span>
              <span>{stats.artifacts.pubmed} PubMed</span>
              <span>•</span>
              <span>{citedPercentage}% Cited</span>
            </div>
          </div>

          {/* Theme Strip */}
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {allTopics.slice(0, 12).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  className="px-3 py-1 text-xs font-medium text-slate-300 border border-slate-600/50 rounded hover:border-slate-400 hover:text-slate-100 transition-colors whitespace-nowrap"
                >
                  {topic.toUpperCase()}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </header>

      <main className="container py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents, topics, concepts..."
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
              />
            </div>
            <Button
              onClick={() => setShowIntelligenceBrief(!showIntelligenceBrief)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Intelligence Brief
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap text-xs">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-100 rounded hover:border-slate-500"
            >
              <option value="SCORE">Sort: Signal</option>
              <option value="DATE">Sort: Date</option>
              <option value="FILE">Sort: File</option>
            </select>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-100 rounded hover:border-slate-500"
            >
              <option value="ALL">All doc types</option>
              <option value="PAPER_LIKE">Paper</option>
              <option value="REPORT_LIKE">Report</option>
            </select>
            <select
              value={artifact}
              onChange={(e) => setArtifact(e.target.value)}
              className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-100 rounded hover:border-slate-500"
            >
              <option value="ALL">All artifacts</option>
              <option value="DOI">Has DOI</option>
              <option value="PUBMED">Has PubMed</option>
            </select>
          </div>
        </div>

        {/* Intelligence Brief Panel */}
        {showIntelligenceBrief && (
          <div className="mb-8 p-6 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <pre className="text-xs text-slate-300 font-mono overflow-auto max-h-64 whitespace-pre-wrap">
              {generateIntelligenceBrief()}
            </pre>
            <Button
              size="sm"
              className="mt-4 bg-slate-700 hover:bg-slate-600"
              onClick={() => {
                const brief = generateIntelligenceBrief();
                navigator.clipboard.writeText(brief);
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        )}

        {loading && <div className="text-center py-12 text-slate-500">Loading research data...</div>}
        {error && (
          <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm">
            <p className="font-semibold">Error loading data</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
            {/* Left: Document List */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-700/30 bg-slate-800/40">
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Documents</h2>
              </div>
              <ScrollArea className="h-[70vh]">
                <div className="p-4 space-y-3">
                  {filtered.map((d) => {
                    const active = selected?.file === d.file;
                    const credibilityTier = d.has_doi && d.has_pubmed_or_pmid ? "Tier 1" : d.has_doi || d.has_pubmed_or_pmid ? "Tier 2" : d.has_arxiv ? "Tier 3" : "Tier 4";
                    const tierColor = credibilityTier === "Tier 1" ? "text-yellow-400" : credibilityTier === "Tier 2" ? "text-slate-300" : credibilityTier === "Tier 3" ? "text-slate-400" : "text-slate-600";

                    return (
                      <button
                        key={d.file}
                        onClick={() => setSelectedFile(d.file)}
                        className={`w-full text-left p-3 rounded transition-all border ${
                          active
                            ? "border-slate-500 bg-slate-700/30 shadow-lg shadow-slate-900/50"
                            : "border-slate-700/30 bg-slate-800/10 hover:border-slate-600/50 hover:bg-slate-800/20"
                        }`}
                      >
                        <div className="font-mono text-xs text-slate-300 mb-1">{d.file}</div>
                        <div className="text-xs text-slate-400 line-clamp-2 mb-2">{d.about}</div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
                            {(d.top_topics ?? []).slice(0, 2).map((t) => (
                              <span key={t} className="px-2 py-0.5 text-xs bg-slate-700/40 text-slate-300 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className={`text-xs font-mono ${tierColor}`}>{credibilityTier}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Intelligence Panel */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-700/30 bg-slate-800/40">
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Analysis</h2>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {!selected ? (
                  <div className="text-center py-12 text-slate-500">Select a document to begin analysis</div>
                ) : (
                  <div className="space-y-8">
                    {/* Multi-Highlight Toggle */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMultiMode(!showMultiMode)}
                        className={showMultiMode ? "border-slate-500 bg-slate-700/30" : "border-slate-700 bg-slate-800/30"}
                      >
                        {showMultiMode ? "Multi-Highlight ON" : "Multi-Highlight OFF"}
                      </Button>
                      {showMultiMode && (
                        <Input
                          type="text"
                          placeholder="Add term..."
                          className="text-sm flex-1 bg-slate-800/50 border-slate-700"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget;
                              handleAddHighlightTerm(input.value);
                              input.value = "";
                            }
                          }}
                        />
                      )}
                    </div>

                    {showMultiMode && multiHighlightTerms.length > 0 && (
                      <HighlightLegend
                        searchTerms={multiHighlightTerms}
                        matchCounts={multiMatchCounts}
                        onRemoveTerm={handleRemoveHighlightTerm}
                      />
                    )}

                    {/* Document Header */}
                    <div>
                      <div className="font-mono text-xs text-slate-400 mb-2">{selected.file}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-200 mb-1">{selected.doc_type}</div>
                          <div className="text-xs text-slate-500">{selected.timeline_bucket || "Undated"}</div>
                        </div>
                        <PDFLink fileName={selected.file} />
                      </div>
                    </div>

                    <Separator className="bg-slate-700/30" />

                    {/* ABOUT Section */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">About</h3>
                      <div className="text-sm text-slate-300 leading-relaxed">
                        {showMultiMode && multiHighlightTerms.length > 0 ? (
                          <MultiHighlightedText text={selected.about} searchTerms={multiHighlightTerms} />
                        ) : (
                          <HighlightedText text={selected.about} searchTerm={highlightTerm} />
                        )}
                      </div>
                    </div>

                    <Separator className="bg-slate-700/30" />

                    {/* SO WHAT Section */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Significance</h3>
                      <div className="text-sm text-slate-300 leading-relaxed">
                        {showMultiMode && multiHighlightTerms.length > 0 ? (
                          <MultiHighlightedText text={selected.significance} searchTerms={multiHighlightTerms} />
                        ) : (
                          <HighlightedText text={selected.significance} searchTerm={highlightTerm} />
                        )}
                      </div>
                    </div>

                    <Separator className="bg-slate-700/30" />

                    {/* EVIDENCE Section */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Evidence</h3>
                      <div className="space-y-3">
                        {(selected.key_excerpts ?? []).slice(0, 3).map((ex, idx) => (
                          <div key={idx} className="p-3 bg-slate-800/30 border border-slate-700/30 rounded text-xs text-slate-300">
                            {showMultiMode && multiHighlightTerms.length > 0 ? (
                              <MultiHighlightedText text={ex} searchTerms={multiHighlightTerms} />
                            ) : (
                              <HighlightedText text={ex} searchTerm={highlightTerm} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selected.top_topics ?? []).map((t) => (
                          <span key={t} className="px-2 py-1 text-xs bg-slate-700/40 text-slate-200 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm mt-16">
        <div className="container py-6 flex items-center justify-between text-xs text-slate-500">
          <div>Forensic biomedical research intelligence</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-300 h-auto p-0">
              GitHub
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-300 h-auto p-0">
              Support
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
