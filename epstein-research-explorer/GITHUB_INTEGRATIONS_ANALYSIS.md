# GitHub Integrations Analysis for Research Explorer

## Overview
Explored 5 GitHub repositories that could enhance the Epstein Medical Research Explorer with academic paper search, parsing, and analysis capabilities.

---

## 1. **pubmed_parser** (titipata/pubmed_parser)
**Status**: Active | **Stars**: 725 | **Language**: Python

### What It Does
- Parses PubMed Open-Access (OA) XML subset and MEDLINE XML datasets
- Extracts detailed article information: citations, images, captions, paragraphs, tables, references
- Supports Entrez Programming Utilities (E-utils) API
- Converts XML into Python dictionaries for easy processing

### Integration Potential
**HIGH** - Perfect for:
- Parsing PubMed articles linked from your DOI/PMID badges
- Extracting structured data (authors, abstract, keywords) from PubMed records
- Building a secondary data layer that enriches your existing Epstein data

### Use Case
```
User finds "NAD+ metabolism" in Epstein files 
→ Clicks PubMed badge 
→ Explorer fetches full article metadata via pubmed_parser
→ Displays abstract, keywords, citation count in a side panel
```

### Implementation Complexity
- **Easy**: Install via pip, straightforward API
- **Effort**: 2-3 hours to integrate into backend

---

## 2. **pymed** (gijswobben/pymed)
**Status**: Archived (Jun 2020) | **Stars**: 215 | **Language**: Python

### What It Does
- Provides Python access to PubMed API
- Queries PubMed database with standard PubMed query language
- Batches requests for performance
- Parses and cleans retrieved articles

### Integration Potential
**MEDIUM** - Useful but archived
- Could query PubMed for related papers on topics found in Epstein files
- Enables "Find similar papers" functionality
- **Caveat**: No longer maintained; PubMed API is "chaotic" per author

### Use Case
```
User selects "mitochondrial transplantation" topic
→ Explorer queries PubMed for related papers
→ Shows top 10 results with abstracts
→ Links to full PubMed records
```

### Implementation Complexity
- **Medium**: API is undocumented, may require workarounds
- **Effort**: 4-6 hours, plus maintenance risk

---

## 3. **paper-search-mcp** (openags/paper-search-mcp)
**Status**: Active | **Stars**: 680 | **Language**: Python

### What It Does
- Model Context Protocol (MCP) server for academic paper search
- **Multi-source support**: arXiv, PubMed, bioRxiv, medRxiv, Google Scholar, Semantic Scholar, IACR ePrint
- Standardized output format (Paper class)
- Asynchronous HTTP requests
- Integrates with Claude Desktop and other LLM clients

### Integration Potential
**VERY HIGH** - Best option for your use case
- Perfect for OpenClaw integration (it's an MCP server!)
- Enables searching across 7+ academic databases simultaneously
- Standardized output format
- Already designed for AI agent workflows

### Use Case
```
OpenClaw agent crawls Epstein files
→ Extracts topics: "raw milk", "plant compounds", "longevity"
→ Uses paper-search-mcp to search PubMed, arXiv, bioRxiv
→ Aggregates results into research explorer
→ User sees "Found 47 related papers on raw milk + longevity"
```

### Implementation Complexity
- **Easy**: Already an MCP server (perfect for OpenClaw)
- **Effort**: 1-2 hours to configure OpenClaw integration

### Key Features
- Searches: arXiv, PubMed, bioRxiv, medRxiv, Google Scholar, Semantic Scholar, IACR ePrint
- Downloads PDFs (optional Sci-Hub support)
- Consistent output format
- Async/await for performance

---

## 4. **BlueBERT** (ncbi-nlp/bluebert)
**Status**: Active | **Language**: Python

### What It Does
- Pre-trained BERT model for biomedical NLP
- Fine-tuned on PubMed and MIMIC-III clinical notes
- Excellent for biomedical text classification and entity extraction

### Integration Potential
**MEDIUM-HIGH** - For advanced analysis
- Extract medical entities from Epstein documents (diseases, treatments, compounds)
- Classify documents by medical domain
- Generate better topic clustering
- **Requires**: GPU for inference, more complex setup

### Use Case
```
User uploads new Epstein document
→ BlueBERT extracts medical entities: "NAD+", "mitochondria", "senescence"
→ Classifies as "Longevity Research"
→ Auto-tags with relevant topics
```

### Implementation Complexity
- **Hard**: Requires ML infrastructure
- **Effort**: 8-12 hours, needs GPU/backend

---

## 5. **cancer-research-agent-2025** (Sugi-Hcr/cancer-research-agent-2025)
**Status**: Recent | **Language**: Python

### What It Does
- AI agent for cancer research
- Combines multiple tools: paper search, analysis, synthesis
- Demonstrates workflow for research automation

### Integration Potential
**MEDIUM** - Reference implementation
- Shows how to build research agents with paper search
- Could inspire similar workflow for longevity research
- Not directly reusable, but good architectural reference

### Use Case
- Reference for building your own research agent architecture
- Demonstrates OpenClaw-like workflows

---

## Recommended Integration Path

### Phase 1: Quick Win (1-2 weeks)
**Use**: paper-search-mcp
- Configure as OpenClaw MCP server
- Enable "Find related papers" feature
- User workflow: Topic → Search PubMed/arXiv → Results in explorer

### Phase 2: Data Enrichment (2-3 weeks)
**Use**: pubmed_parser
- When user clicks PubMed badge, fetch full metadata
- Display abstract, keywords, authors in side panel
- Cache results for performance

### Phase 3: Advanced Analysis (4-6 weeks)
**Use**: BlueBERT (optional)
- Extract medical entities automatically
- Improve topic clustering
- Auto-tag documents with medical domains

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Epstein Research Explorer               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (React)                                │   │
│  │  - Document browser                              │   │
│  │  - Multi-highlight search                        │   │
│  │  - Related papers panel                          │   │
│  └──────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Backend (Node.js/Python)                        │   │
│  │  - OpenClaw integration                          │   │
│  │  - paper-search-mcp client                       │   │
│  │  - pubmed_parser wrapper                         │   │
│  └──────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  External APIs                                   │   │
│  │  - PubMed (via paper-search-mcp)                 │   │
│  │  - arXiv (via paper-search-mcp)                  │   │
│  │  - bioRxiv (via paper-search-mcp)                │   │
│  │  - Semantic Scholar (via paper-search-mcp)       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Recommendations

### Best Choice: paper-search-mcp
**Why**: 
- Already designed as MCP server (perfect for OpenClaw)
- Multi-source support (7+ databases)
- Active maintenance
- Standardized output format
- Async/await for performance

### Installation
```bash
# Via Smithery (recommended)
npx -y @smithery/cli install @openags/paper-search-mcp --client claude

# Or manual
uv add paper-search-mcp
```

### Integration with OpenClaw
```python
# OpenClaw can use paper-search-mcp as a tool
# Example workflow:
1. OpenClaw crawls Epstein files
2. Extracts topics: ["raw milk", "NAD+", "senescence"]
3. Calls paper-search-mcp.search_pubmed("raw milk longevity")
4. Gets standardized Paper objects
5. Stores in explorer database
6. User sees related papers in UI
```

---

## Next Steps

1. **Immediate**: Set up paper-search-mcp as MCP server for OpenClaw
2. **Short-term**: Add "Find Related Papers" feature to explorer
3. **Medium-term**: Integrate pubmed_parser for metadata enrichment
4. **Long-term**: Consider BlueBERT for advanced entity extraction

---

## References

- **pubmed_parser**: https://github.com/titipata/pubmed_parser
- **pymed**: https://github.com/gijswobben/pymed (archived)
- **paper-search-mcp**: https://github.com/openags/paper-search-mcp
- **BlueBERT**: https://github.com/ncbi-nlp/bluebert
- **cancer-research-agent-2025**: https://github.com/Sugi-Hcr/cancer-research-agent-2025
