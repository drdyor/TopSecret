# Epstein Medical Research Explorer

A professional research intelligence platform that makes medical and health research from the Epstein files searchable, analyzable, and ready for investigation.

## What This Does

**Research Explorer**: Browse, search, and analyze medical research documents with structured intelligence including topics, significance analysis, timeline evidence, and direct links to source documents.

**Data Pipeline**: OpenClaw crawls all Epstein data sources (emails, drive, wiki, etc.), extracts medical content, and feeds it into the explorer as structured JSON.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Crawler                         │
│  (Autonomous AI agent that crawls all Epstein sources)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │   Medical Content Extraction         │
        │  - Filter by health/research terms   │
        │  - Analyze document type             │
        │  - Extract topics & dates            │
        │  - Find citations (DOI/PMID/arXiv)   │
        │  - Generate significance analysis    │
        └──────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │   about_summaries.json               │
        │  (Structured research intelligence)  │
        └──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           Research Explorer (This Website)                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Search & Filter                                    │   │
│  │  - Full-text search                                 │   │
│  │  - Filter by doc type, artifacts, timeline          │   │
│  │  - Sort by signal strength, date, filename          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Document Intelligence                              │   │
│  │  - About: What the document is about                │   │
│  │  - So What: Why it matters                          │   │
│  │  - Dates: Timeline evidence                         │   │
│  │  - Evidence: Key excerpts                           │   │
│  │  - Links: Direct to Justice Department archives     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Analysis Tools                                     │   │
│  │  - Topic clustering                                 │   │
│  │  - Timeline visualization                           │   │
│  │  - Citation network mapping                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### For Users (Browse the Explorer)

1. Visit the research explorer
2. Use search to find topics (e.g., "NAD+", "stem cells", "consciousness")
3. Filter by document type or citation status
4. Click "Open Document" to view source at Justice Department
5. Read the intelligence tabs (About, Significance, Dates, Evidence)

### For Researchers (Set Up the Crawler)

1. **Install OpenClaw**: https://github.com/openclaw/openclaw
2. **Read the integration guide**: See `OPENCLAW_INTEGRATION.md`
3. **Configure sources**: Point to all Epstein data URLs
4. **Run the crawler**: Generate `about_summaries.json`
5. **Deploy**: Copy JSON to `client/public/` and publish

## Data Sources

OpenClaw crawls these Epstein archives:

- **Emails**: https://jmail.world
- **Photos**: https://jmail.world/photos
- **Google Drive**: https://jmail.world/drive/
- **Facebook**: https://jmail.world/jacebook
- **Amazon**: https://jmail.world/jamazon
- **Flight Logs**: https://jmail.world/flights
- **Encyclopedia**: https://jmail.world/wiki
- **Spotify**: https://jmail.world/jotify
- **YouTube**: https://jmail.world/jefftube
- **File Explorer**: https://epstein-file-explorer.com
- **Network Graph**: https://epsteinexposed.com/network

## Research Categories

The explorer indexes documents across these medical research domains:

1. **Aging & Longevity** (28 docs) - Senescence, telomeres, biological age
2. **Mitochondrial Health** (20 docs) - NAD+, ATP, cellular energy
3. **Nutrition & Supplements** (38 docs) - Vitamins, CoQ10, plant compounds
4. **Cancer & Oncology** (24 docs) - Immunotherapy, CAR-T, prevention
5. **Consciousness & Brain** (28 docs) - Cognitive decline, neuroplasticity
6. **Experimental Treatments** (30 docs) - Stem cells, gene therapy
7. **Cardiovascular Health** (22 docs) - Endothelial function, atherosclerosis
8. **Metabolic Health** (18 docs) - Insulin resistance, glucose metabolism
9. **Inflammation & Immunity** (20 docs) - Inflammaging, immune optimization
10. **Physical Health & Recovery** (22 docs) - Exercise, muscle, athletic performance

## Features

### Search & Discovery
- **Full-text search** across file names, topics, summaries, and excerpts
- **Smart filtering** by document type, citation status, timeline
- **Relevance sorting** by signal strength (topics + procedure density)
- **Real-time results** as you type

### Document Intelligence
- **About**: Concise summary of what the document covers
- **So What**: Significance analysis—why this matters for research
- **Dates**: Timeline evidence extracted from the document
- **Evidence**: Key excerpts supporting the analysis

### Citation Tracking
- **DOI badges**: Documents linked to peer-reviewed research
- **PubMed/PMID**: Medical literature references
- **arXiv**: Preprint research papers
- **Confidence notes**: How reliable the extraction is

### Timeline Analysis
- **Bucket by month**: See research interest over time
- **Temporal patterns**: Identify when topics became relevant
- **Historical context**: Understand research evolution

## Data Format

The explorer expects `about_summaries.json` in this structure:

```json
[
  {
    "file": "EFTA00611136.pdf",
    "doc_type": "PAPER_LIKE",
    "about": "Research on declining NAD+ levels and pseudohypoxic state disruption during cellular aging.",
    "top_topics": ["NAD+", "mitochondria", "aging", "senescence"],
    "has_doi": true,
    "has_pubmed_or_pmid": true,
    "has_arxiv": false,
    "procedure_density": 0.42,
    "dates_found": [
      {"date": "2017-12-19", "context": "Document timestamp"}
    ],
    "timeline_bucket": "2017-12",
    "significance": "Demonstrates understanding of mitochondrial dysfunction as primary aging mechanism.",
    "confidence_notes": ["DOI detected", "PubMed reference found"],
    "topic_scores": [["NAD+", 9], ["mitochondria", 7]],
    "key_excerpts": ["Declining NAD+ levels induce pseudohypoxic state..."]
  }
]
```

## Development

### Install Dependencies
```bash
pnpm install
```

### Run Dev Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Type Check
```bash
pnpm check
```

## File Structure

```
client/
├── public/
│   └── about_summaries.json          ← OpenClaw outputs here
├── src/
│   ├── components/
│   │   ├── PDFLink.tsx               ← Links to Justice Department
│   │   └── ui/                       ← shadcn/ui components
│   ├── hooks/
│   │   └── useAboutSummaries.ts      ← Data fetching & stats
│   ├── lib/
│   │   ├── aboutTypes.ts             ← TypeScript types
│   │   └── loadAboutSummaries.ts     ← JSON loader
│   ├── pages/
│   │   └── ResearchExplorer.tsx      ← Main UI
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
└── index.html

OPENCLAW_INTEGRATION.md                ← Setup guide for crawler
README.md                              ← This file
```

## Integration with OpenClaw

See `OPENCLAW_INTEGRATION.md` for:
- Complete setup instructions
- Medical keyword reference
- OpenClaw skill template
- Workflow configuration
- Expected output format

## Key Design Decisions

1. **No PDF Storage**: Links go directly to justice.gov archives—no storage overhead
2. **Static JSON**: Entire explorer runs as static HTML/JS—no backend needed
3. **LLM-Powered Extraction**: OpenClaw handles all analysis and summarization
4. **Searchable & Filterable**: Full-text search + metadata filters for discovery
5. **Citation-Aware**: Tracks DOI/PMID/arXiv for research credibility

## Next Steps

1. **Set up OpenClaw** locally with the integration guide
2. **Configure medical keyword filters** for your use case
3. **Run initial crawl** on one source to test
4. **Generate `about_summaries.json`** with full data
5. **Deploy explorer** to production
6. **Share with researchers** for collaborative analysis

## Support

For OpenClaw setup: https://github.com/openclaw/openclaw
For this explorer: See code comments and inline documentation

## License

This research explorer is provided as-is for research and analysis purposes.

---

**Built for investigative research. Powered by OpenClaw. Designed for discovery.**
