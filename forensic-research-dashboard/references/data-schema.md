# Data Schema Reference

## ResearchDocument Interface

Complete TypeScript definition for documents in the forensic research dashboard:

```typescript
interface ResearchDocument {
  // Required fields
  file: string;                      // Unique identifier, typically filename
  doc_type: string;                  // Document classification (PAPER_LIKE, REPORT_LIKE, etc.)
  about: string;                     // Summary or abstract of document content
  significance: string;              // Why this document matters, key findings
  key_excerpts: string[];            // Important quotes or passages from document
  top_topics: string[];              // Extracted topics/themes/concepts
  timeline_bucket: string;           // Date in YYYY-MM format (e.g., "2018-03")
  
  // Citation credibility signals
  has_doi: boolean;                  // Document has Digital Object Identifier
  has_pubmed_or_pmid: boolean;       // Document has PubMed/PMID citation
  has_arxiv: boolean;                // Document has arXiv identifier
  
  // Optional enrichment fields
  topic_scores?: [string, number][]; // Array of [topic, score] pairs for ranking
  procedure_density?: number;        // Count of therapeutic/procedural mentions
}
```

## Field Definitions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `file` | string | Unique document identifier | `EFTA00799222.pdf` |
| `doc_type` | string | Document type classification | `PAPER_LIKE`, `REPORT_LIKE` |
| `about` | string | Summary/abstract (100-500 chars) | `"Mitochondrial transplantation protocols..."` |
| `significance` | string | Key findings and importance (100-500 chars) | `"Demonstrates efficacy in restoring..."` |
| `key_excerpts` | string[] | Important quotes (3-5 per document) | `["Protocol requires...", "Results show..."]` |
| `top_topics` | string[] | Extracted concepts (3-8 topics) | `["mitochondria", "OXPHOS", "senescence"]` |
| `timeline_bucket` | string | Month-year format | `"2018-03"` |
| `has_doi` | boolean | DOI present | `true` |
| `has_pubmed_or_pmid` | boolean | PubMed ID present | `true` |
| `has_arxiv` | boolean | arXiv ID present | `false` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `topic_scores` | [string, number][] | Topic with relevance score (0-1) | `[["mitochondria", 0.95], ["aging", 0.72]]` |
| `procedure_density` | number | Count of procedural mentions | `12` |

## Credibility Tier Calculation

Tiers are automatically calculated from citation fields:

```typescript
function getCredibilityTier(doc: ResearchDocument): string {
  if (doc.has_doi && doc.has_pubmed_or_pmid) return "Tier 1"; // Gold - highest credibility
  if (doc.has_doi || doc.has_pubmed_or_pmid) return "Tier 2"; // Silver
  if (doc.has_arxiv) return "Tier 3";                         // Bronze
  return "Tier 4";                                             // Gray - uncited
}
```

## Sample Document

```json
{
  "file": "EFTA00799222.pdf",
  "doc_type": "PAPER_LIKE",
  "about": "Mitochondrial transplantation and OXPHOS optimization. Discusses protocols for mitochondrial isolation, transfer, and integration in recipient cells to restore energy production.",
  "significance": "Demonstrates feasibility of mitochondrial transplantation as therapeutic intervention for mitochondrial dysfunction. Shows 60% improvement in ATP production in treated cells.",
  "key_excerpts": [
    "Protocol requires isolation of healthy mitochondria from donor tissue using differential centrifugation",
    "Recipients showed 60% improvement in ATP production within 48 hours of transplantation",
    "Long-term engraftment achieved in 78% of treated cells"
  ],
  "top_topics": [
    "mitochondrial transplant",
    "OXPHOS",
    "ATP production",
    "cellular energy"
  ],
  "timeline_bucket": "2018-03",
  "has_doi": true,
  "has_pubmed_or_pmid": true,
  "has_arxiv": false,
  "topic_scores": [
    ["mitochondrial transplant", 0.98],
    ["OXPHOS", 0.95],
    ["ATP production", 0.87],
    ["cellular energy", 0.82]
  ],
  "procedure_density": 14
}
```

## Data Validation

When loading data, validate:

1. **Required fields present**: All required fields must exist
2. **Type correctness**: Fields match their TypeScript types
3. **String length**: Summaries 50-500 chars, excerpts 20-1000 chars
4. **Array lengths**: topics 1-10 items, excerpts 1-10 items
5. **Date format**: timeline_bucket matches YYYY-MM pattern
6. **Boolean values**: Citation fields are true/false
7. **Score ranges**: topic_scores between 0-1

## Fallback Values

For missing optional fields:

```typescript
const withDefaults = {
  ...document,
  topic_scores: document.topic_scores || [],
  procedure_density: document.procedure_density || 0,
  timeline_bucket: document.timeline_bucket || "UNDATED"
};
```

## Statistics Computation

Common statistics derived from document collection:

```typescript
interface DocumentStats {
  totalDocuments: number;
  citedDocuments: number;
  citationPercentage: number;
  topicFrequency: Record<string, number>;
  timelineDistribution: Record<string, number>;
  avgProcedureDensity: number;
  credibilityTiers: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };
}
```

## Integration with OpenClaw

When using OpenClaw crawler to populate documents:

1. **Extraction**: OpenClaw extracts text from source documents
2. **Summarization**: Generate `about` and `significance` fields
3. **Topic extraction**: Use NLP to populate `top_topics`
4. **Citation detection**: Scan for DOI, PMID, arXiv patterns
5. **Dating**: Extract publication date → `timeline_bucket`
6. **Validation**: Ensure all required fields populated before storing

Example OpenClaw output transformation:

```python
def transform_crawled_content(raw_content):
    return {
        "file": raw_content["source_id"],
        "doc_type": classify_document_type(raw_content["text"]),
        "about": generate_summary(raw_content["text"]),
        "significance": extract_significance(raw_content["text"]),
        "key_excerpts": extract_key_excerpts(raw_content["text"]),
        "top_topics": extract_topics(raw_content["text"]),
        "timeline_bucket": extract_date(raw_content),
        "has_doi": "10." in raw_content["text"],
        "has_pubmed_or_pmid": "PMID:" in raw_content["text"],
        "has_arxiv": "arxiv.org" in raw_content["text"],
    }
```
