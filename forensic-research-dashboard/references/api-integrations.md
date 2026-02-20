# API Integrations Reference

## paper-search-mcp (Recommended)

Model Context Protocol server for searching academic papers across 7+ sources.

### Setup

```bash
# Install via Smithery (recommended)
npx -y @smithery/cli install @openags/paper-search-mcp --client claude

# Or manual installation
uv add paper-search-mcp
```

### Integration with OpenClaw

Use paper-search-mcp as a tool within OpenClaw workflows:

```python
# In OpenClaw skill definition
tools = [
    {
        "name": "search_pubmed",
        "description": "Search PubMed for papers on a topic",
        "params": {
            "query": "string",
            "max_results": "int"
        }
    },
    {
        "name": "search_arxiv",
        "description": "Search arXiv for preprints",
        "params": {
            "query": "string",
            "max_results": "int"
        }
    }
]
```

### Workflow Example

```
OpenClaw crawls Epstein files
  ↓
Extracts topics: ["raw milk", "NAD+", "senescence"]
  ↓
Calls paper-search-mcp.search_pubmed("raw milk longevity")
  ↓
Gets standardized Paper objects
  ↓
Stores in explorer database
  ↓
User sees "Found 47 related papers on raw milk + longevity"
```

### Output Format

paper-search-mcp returns standardized Paper objects:

```python
{
    "title": "Paper title",
    "authors": ["Author 1", "Author 2"],
    "abstract": "Abstract text",
    "url": "https://pubmed.ncbi.nlm.nih.gov/...",
    "source": "pubmed",  # or arxiv, biorxiv, etc.
    "publication_date": "2023-01-15",
    "citations": 42
}
```

### Supported Sources

- PubMed (biomedical literature)
- arXiv (preprints)
- bioRxiv (biology preprints)
- medRxiv (medical preprints)
- Google Scholar
- Semantic Scholar
- IACR ePrint Archive

---

## pubmed_parser

Python library for parsing PubMed XML data.

### Setup

```bash
pip install pubmed_parser
```

### Use Case

Fetch and parse full metadata when user clicks PubMed badge in dashboard.

### Example Usage

```python
from pubmed_parser import parse_medline_xml

# Parse PubMed XML file
articles = parse_medline_xml("pubmed_data.xml")

for article in articles:
    enriched_data = {
        "pmid": article.get("pmid"),
        "title": article.get("title"),
        "abstract": article.get("abstract"),
        "authors": article.get("authors"),
        "keywords": article.get("keywords"),
        "publication_date": article.get("publication_date"),
        "journal": article.get("journal"),
        "doi": article.get("doi")
    }
```

### Integration Pattern

```typescript
// In ResearchExplorer component
async function fetchPubMedMetadata(pmid: string) {
  const response = await fetch(`/api/pubmed/${pmid}`);
  const metadata = await response.json();
  
  // Display in side panel
  setSelectedPaperMetadata(metadata);
}
```

---

## BlueBERT (Advanced)

Pre-trained BERT model for biomedical NLP.

### Setup

```bash
pip install transformers torch
```

### Use Cases

1. **Entity Extraction**: Extract medical entities (diseases, drugs, procedures)
2. **Document Classification**: Classify by medical domain
3. **Topic Modeling**: Better topic extraction than keyword matching

### Example: Extract Medical Entities

```python
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline

# Load pre-trained BlueBERT
tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-base-cased-v1.1")
model = AutoModelForTokenClassification.from_pretrained("dmis-lab/biobert-base-cased-v1.1")

# Create NER pipeline
ner = pipeline("ner", model=model, tokenizer=tokenizer)

# Extract entities from document
text = "NAD+ metabolism and mitochondrial function in aging..."
entities = ner(text)

# Filter for medical terms
medical_entities = [e for e in entities if e["entity"] in ["B-Disease", "B-Gene", "B-Chemical"]]
```

### Integration Pattern

```typescript
// Auto-tag documents with medical entities
async function enrichDocumentWithEntities(documentText: string) {
  const response = await fetch("/api/extract-entities", {
    method: "POST",
    body: JSON.stringify({ text: documentText })
  });
  
  const entities = await response.json();
  return entities; // Add to top_topics
}
```

---

## OpenClaw Integration

### Architecture

```
┌─────────────────────────────────────────┐
│  OpenClaw Agent                         │
├─────────────────────────────────────────┤
│  1. Crawl Epstein sources               │
│  2. Extract text + metadata             │
│  3. Call paper-search-mcp for related   │
│  4. Enrich with BlueBERT entities       │
│  5. Transform to ResearchDocument       │
│  6. Store in explorer database          │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Forensic Research Dashboard            │
├─────────────────────────────────────────┤
│  - Display documents                    │
│  - Show related papers                  │
│  - Multi-highlight medical entities     │
│  - Generate Intelligence Brief          │
└─────────────────────────────────────────┘
```

### OpenClaw Skill Template

```python
# openclaw_research_skill.py
import json
from paper_search_mcp import PaperSearchClient
from pubmed_parser import parse_medline_xml

class ResearchExplorerSkill:
    def __init__(self):
        self.paper_search = PaperSearchClient()
        self.documents = []
    
    def crawl_and_enrich(self, sources: list[str]):
        """Crawl sources and enrich with related papers"""
        for source in sources:
            # 1. Crawl source
            raw_content = self.crawl_source(source)
            
            # 2. Extract topics
            topics = self.extract_topics(raw_content)
            
            # 3. Search for related papers
            for topic in topics[:3]:  # Top 3 topics
                related = self.paper_search.search_pubmed(topic, max_results=5)
                
            # 4. Transform to ResearchDocument
            doc = self.transform_to_research_doc(raw_content, topics)
            self.documents.append(doc)
        
        return self.documents
    
    def transform_to_research_doc(self, raw, topics):
        return {
            "file": raw["id"],
            "doc_type": self.classify_type(raw),
            "about": raw["summary"],
            "significance": self.extract_significance(raw),
            "key_excerpts": self.extract_excerpts(raw),
            "top_topics": topics,
            "timeline_bucket": self.extract_date(raw),
            "has_doi": "10." in raw["text"],
            "has_pubmed_or_pmid": "PMID:" in raw["text"],
            "has_arxiv": "arxiv.org" in raw["text"],
        }
```

### Deployment

1. **Local Development**: Run OpenClaw locally, populate JSON file
2. **Production**: Deploy OpenClaw as scheduled job, update explorer database
3. **Real-time**: Stream updates to dashboard as crawling completes

---

## Recommended Integration Order

1. **Phase 1** (Week 1): paper-search-mcp for "Find Related Papers"
2. **Phase 2** (Week 2): pubmed_parser for metadata enrichment
3. **Phase 3** (Week 3): BlueBERT for entity extraction (optional)
4. **Phase 4** (Week 4): Full OpenClaw automation pipeline

---

## Troubleshooting

### paper-search-mcp not finding results
- Check query syntax (use standard PubMed query language)
- Verify API rate limits not exceeded
- Try broader search terms

### pubmed_parser XML parsing errors
- Ensure XML is valid PubMed format
- Check for encoding issues (UTF-8)
- Validate XML structure

### BlueBERT slow inference
- Use GPU acceleration (CUDA)
- Batch process documents
- Cache results for repeated queries

### OpenClaw crawler timeouts
- Increase timeout values
- Reduce crawl depth
- Implement retry logic
