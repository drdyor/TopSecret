# Crawler Configuration Guide

Complete configuration for OpenClaw to crawl Epstein sources and extract medical research content.

## Medical Concept Taxonomy

### Primary Concepts (High Signal)

These are the core medical/longevity research concepts to search for:

```python
PRIMARY_CONCEPTS = {
    "MITOCHONDRIA": {
        "aliases": ["mitochondrial", "mitochondrion", "OXPHOS", "ATP", "electron transport"],
        "co_terms": ["energy", "cellular respiration", "Complex I", "Complex IV"],
        "weight": 1.0
    },
    "SENESCENCE": {
        "aliases": ["cellular senescence", "senescent", "aging", "age-related"],
        "co_terms": ["p16", "p21", "telomere", "autophagy"],
        "weight": 0.95
    },
    "NAD_METABOLISM": {
        "aliases": ["NAD+", "NAD", "nicotinamide adenine", "NADH", "sirtuin"],
        "co_terms": ["mitochondria", "energy", "aging", "longevity"],
        "weight": 0.98
    },
    "PLASMA_EXCHANGE": {
        "aliases": ["plasmapheresis", "plasma exchange", "apheresis", "TPE"],
        "co_terms": ["antibodies", "autoimmune", "therapeutic"],
        "weight": 0.92
    },
    "STEM_CELLS": {
        "aliases": ["mesenchymal stem cells", "MSC", "hematopoietic", "pluripotent"],
        "co_terms": ["regeneration", "tissue repair", "differentiation"],
        "weight": 0.90
    },
    "PHOTOBIOMODULATION": {
        "aliases": ["red light therapy", "PBM", "light therapy", "phototherapy"],
        "co_terms": ["mitochondria", "cytochrome c oxidase", "ATP"],
        "weight": 0.88
    },
    "CAR_T_CELLS": {
        "aliases": ["CAR-T", "chimeric antigen receptor", "adoptive cell therapy"],
        "co_terms": ["cancer", "immunotherapy", "engineering"],
        "weight": 0.85
    },
    "IMMUNOTHERAPY": {
        "aliases": ["checkpoint inhibitor", "PD-1", "PD-L1", "CTLA-4", "immune checkpoint"],
        "co_terms": ["cancer", "antibody", "T cell"],
        "weight": 0.87
    },
    "EXOSOMES": {
        "aliases": ["extracellular vesicles", "EVs", "microvesicles", "exosome therapy"],
        "co_terms": ["regeneration", "signaling", "delivery"],
        "weight": 0.83
    },
    "LONGEVITY": {
        "aliases": ["lifespan", "healthspan", "life extension", "anti-aging"],
        "co_terms": ["aging", "senescence", "disease prevention"],
        "weight": 0.91
    }
}
```

### Secondary Concepts (Medium Signal)

```python
SECONDARY_CONCEPTS = {
    "AUTOPHAGY": {
        "aliases": ["macroautophagy", "chaperone-mediated autophagy", "mTOR"],
        "co_terms": ["cellular cleanup", "aging", "disease"],
        "weight": 0.75
    },
    "TELOMERES": {
        "aliases": ["telomere", "telomerase", "TERT"],
        "co_terms": ["aging", "senescence", "replicative limit"],
        "weight": 0.78
    },
    "EPIGENETICS": {
        "aliases": ["DNA methylation", "histone modification", "epigenetic clock"],
        "co_terms": ["aging", "gene expression", "reversibility"],
        "weight": 0.72
    },
    "METABOLIC_HEALTH": {
        "aliases": ["metabolic syndrome", "insulin sensitivity", "glucose metabolism"],
        "co_terms": ["aging", "disease", "mitochondria"],
        "weight": 0.70
    },
    "INFLAMMATION": {
        "aliases": ["inflammaging", "chronic inflammation", "cytokine"],
        "co_terms": ["aging", "disease", "immune"],
        "weight": 0.73
    },
    "PROTEIN_FOLDING": {
        "aliases": ["proteostasis", "chaperone", "unfolded protein response"],
        "co_terms": ["aging", "neurodegeneration", "disease"],
        "weight": 0.68
    }
}
```

### Therapeutic Interventions (Action Signal)

```python
INTERVENTIONS = {
    "SENOLYTICS": {
        "aliases": ["senolytic", "senescent cell clearance"],
        "examples": ["dasatinib", "quercetin", "fisetin"],
        "weight": 0.85
    },
    "NAD_BOOSTERS": {
        "aliases": ["NAD+ precursor", "NMN", "NR", "nicotinamide riboside"],
        "examples": ["NMN", "NR", "NADH"],
        "weight": 0.90
    },
    "RAPAMYCIN": {
        "aliases": ["mTOR inhibitor", "sirolimus"],
        "examples": ["rapamycin", "everolimus"],
        "weight": 0.82
    },
    "METFORMIN": {
        "aliases": ["biguanide", "anti-diabetic"],
        "examples": ["metformin"],
        "weight": 0.75
    },
    "CALORIC_RESTRICTION": {
        "aliases": ["CR", "intermittent fasting", "IF", "time-restricted eating"],
        "examples": ["fasting", "caloric restriction"],
        "weight": 0.78
    },
    "EXERCISE": {
        "aliases": ["physical activity", "aerobic", "resistance training"],
        "examples": ["exercise", "workout"],
        "weight": 0.65
    }
}
```

## Citation Detection Patterns

### DOI Pattern
```regex
\b(10\.\d{4,}/[^\s]+)\b
```

### PubMed/PMID Pattern
```regex
\b(PMID:\s*\d+|PubMed ID:\s*\d+|pubmed\.ncbi\.nlm\.nih\.gov/(\d+))\b
```

### arXiv Pattern
```regex
\b(arxiv\.org/abs/\d+\.\d+|arXiv:\d+\.\d+)\b
```

### DOI URL Pattern
```regex
\b(https?://doi\.org/[^\s]+)\b
```

## Source-Specific Configurations

### jmail.world/emails

```python
SOURCE_CONFIG = {
    "name": "Epstein Emails",
    "base_url": "https://jmail.world",
    "endpoints": [
        "/emails",
        "/emails?page=2",
        "/emails?search=medical",
        "/emails?search=health"
    ],
    "selectors": {
        "email_list": ".email-item",
        "subject": ".subject",
        "sender": ".from",
        "date": ".date",
        "body": ".body-preview"
    },
    "pagination": {
        "type": "url_param",
        "param": "page",
        "max_pages": 100
    },
    "keywords": list(PRIMARY_CONCEPTS.keys()) + list(SECONDARY_CONCEPTS.keys()),
    "min_confidence": 0.75,
    "extract_pdf_links": True
}
```

### jmail.world/wiki

```python
SOURCE_CONFIG = {
    "name": "Epstein Encyclopedia",
    "base_url": "https://jmail.world/wiki",
    "endpoints": [
        "/wiki",
        "/wiki/index",
        "/wiki?category=medical"
    ],
    "selectors": {
        "article_list": ".wiki-article",
        "title": "h2",
        "content": ".article-content",
        "links": "a[href]"
    },
    "pagination": {
        "type": "next_button",
        "selector": "a.next"
    },
    "keywords": list(PRIMARY_CONCEPTS.keys()),
    "min_confidence": 0.80,
    "follow_internal_links": True
}
```

### epstein-file-explorer.com

```python
SOURCE_CONFIG = {
    "name": "Epstein File Explorer",
    "base_url": "https://epstein-file-explorer.com",
    "endpoints": [
        "/search",
        "/documents",
        "/documents?type=medical"
    ],
    "selectors": {
        "document_list": ".document-item",
        "title": ".doc-title",
        "metadata": ".doc-meta",
        "content": ".doc-preview",
        "download_link": "a.download"
    },
    "pagination": {
        "type": "infinite_scroll",
        "load_more_selector": "button.load-more"
    },
    "keywords": list(PRIMARY_CONCEPTS.keys()) + list(INTERVENTIONS.keys()),
    "min_confidence": 0.75,
    "extract_pdf_links": True,
    "follow_download_links": False  # Don't actually download PDFs
}
```

### jmail.world/drive

```python
SOURCE_CONFIG = {
    "name": "Epstein Google Drive",
    "base_url": "https://jmail.world/drive",
    "endpoints": [
        "/drive",
        "/drive?folder=medical",
        "/drive?folder=research"
    ],
    "selectors": {
        "file_list": ".file-item",
        "filename": ".filename",
        "size": ".filesize",
        "date": ".modified-date",
        "preview": ".preview-text"
    },
    "pagination": {
        "type": "scroll",
        "load_more_selector": ".load-more"
    },
    "keywords": list(PRIMARY_CONCEPTS.keys()),
    "min_confidence": 0.80,
    "extract_pdf_links": True
}
```

## Filtering Rules

### Noise Reduction (Co-occurrence Gates)

```python
NOISE_FILTERS = {
    "generic_terms": {
        "words": ["the", "and", "or", "a", "an", "to", "from"],
        "action": "skip_if_only_match"
    },
    "common_false_positives": {
        "patterns": [
            r"energy\s+drink",  # Not cellular energy
            r"therapy\s+(dog|animal)",  # Not medical therapy
            r"gas\s+(station|pump)",  # Not cellular respiration
        ],
        "action": "exclude"
    },
    "document_quality": {
        "min_length": 100,  # Skip very short snippets
        "max_length": 50000,  # Skip suspiciously long blobs
        "min_medical_terms": 2  # Require at least 2 medical concepts
    }
}
```

### Credibility Scoring

```python
CREDIBILITY_SCORE = {
    "has_doi": +0.30,
    "has_pmid": +0.30,
    "has_arxiv": +0.20,
    "has_author_list": +0.15,
    "has_abstract": +0.15,
    "has_methodology": +0.10,
    "has_results_section": +0.10,
    "multiple_citations": +0.10,
    "peer_reviewed_journal": +0.20,
    
    # Negative signals
    "all_caps": -0.10,
    "excessive_punctuation": -0.05,
    "no_dates": -0.10,
    "generic_language": -0.15
}
```

## Document Type Classification

```python
DOC_TYPE_RULES = {
    "PAPER_LIKE": {
        "patterns": [
            r"abstract\b",
            r"introduction\b",
            r"methodology|methods\b",
            r"results\b",
            r"discussion\b",
            r"conclusion\b",
            r"references\b"
        ],
        "min_matches": 3,
        "weight": 1.0
    },
    "REPORT_LIKE": {
        "patterns": [
            r"executive summary",
            r"findings",
            r"recommendations",
            r"analysis",
            r"conclusion"
        ],
        "min_matches": 2,
        "weight": 0.85
    },
    "MEMO_LIKE": {
        "patterns": [
            r"to:\s*",
            r"from:\s*",
            r"date:\s*",
            r"subject:\s*",
            r"re:\s*"
        ],
        "min_matches": 3,
        "weight": 0.70
    },
    "PROTOCOL_LIKE": {
        "patterns": [
            r"protocol",
            r"procedure",
            r"step\s+\d+",
            r"method",
            r"instruction"
        ],
        "min_matches": 2,
        "weight": 0.80
    },
    "PROPOSAL_LIKE": {
        "patterns": [
            r"proposal",
            r"budget",
            r"timeline",
            r"objective",
            r"deliverable"
        ],
        "min_matches": 2,
        "weight": 0.75
    }
}
```

## OpenClaw Skill Template

```python
# openclaw_medical_crawler_skill.py
from datetime import datetime
import re
import json

class MedicalCrawlerSkill:
    def __init__(self):
        self.primary_concepts = PRIMARY_CONCEPTS
        self.secondary_concepts = SECONDARY_CONCEPTS
        self.interventions = INTERVENTIONS
        self.sources = [
            SOURCE_CONFIG_EMAILS,
            SOURCE_CONFIG_WIKI,
            SOURCE_CONFIG_EXPLORER,
            SOURCE_CONFIG_DRIVE
        ]
        self.results = []
    
    def extract_dates(self, text):
        """Extract dates in YYYY-MM-DD format"""
        date_pattern = r'\d{4}-\d{2}-\d{2}'
        return re.findall(date_pattern, text)
    
    def detect_citations(self, text):
        """Detect DOI, PMID, arXiv citations"""
        return {
            "has_doi": bool(re.search(DOI_PATTERN, text)),
            "has_pmid": bool(re.search(PMID_PATTERN, text)),
            "has_arxiv": bool(re.search(ARXIV_PATTERN, text))
        }
    
    def score_concept_hits(self, text):
        """Score medical concept matches"""
        hits = {}
        
        for concept, config in self.primary_concepts.items():
            count = 0
            for alias in config["aliases"]:
                count += len(re.findall(rf'\b{re.escape(alias)}\b', text, re.IGNORECASE))
            
            if count > 0:
                hits[concept] = count * config["weight"]
        
        return hits
    
    def classify_document(self, text):
        """Classify document type"""
        best_type = "UNKNOWN"
        best_score = 0
        
        for doc_type, rules in DOC_TYPE_RULES.items():
            matches = sum(1 for pattern in rules["patterns"] 
                         if re.search(pattern, text, re.IGNORECASE))
            
            if matches >= rules["min_matches"]:
                score = matches * rules["weight"]
                if score > best_score:
                    best_score = score
                    best_type = doc_type
        
        return best_type
    
    def crawl_source(self, source_config):
        """Crawl a single source"""
        for endpoint in source_config["endpoints"]:
            url = source_config["base_url"] + endpoint
            
            # Use Playwright or requests to fetch
            content = self.fetch_content(url)
            
            # Extract items using selectors
            items = self.extract_items(content, source_config["selectors"])
            
            for item in items:
                # Score medical relevance
                concept_hits = self.score_concept_hits(item["content"])
                
                if not concept_hits:
                    continue  # Skip non-medical content
                
                # Detect citations
                citations = self.detect_citations(item["content"])
                
                # Classify document type
                doc_type = self.classify_document(item["content"])
                
                # Extract dates
                dates = self.extract_dates(item["content"])
                
                # Create record
                record = {
                    "source": source_config["name"],
                    "url": item.get("url", ""),
                    "title": item.get("title", ""),
                    "doc_type": doc_type,
                    "concept_hits": concept_hits,
                    "has_doi": citations["has_doi"],
                    "has_pubmed": citations["has_pmid"],
                    "has_arxiv": citations["has_arxiv"],
                    "dates": dates,
                    "snippet": item.get("content", "")[:500],
                    "timestamp": datetime.now().isoformat()
                }
                
                self.results.append(record)
    
    def run(self):
        """Execute full crawl"""
        for source in self.sources:
            self.crawl_source(source)
        
        # Save results
        with open("crawler_output.jsonl", "w") as f:
            for record in self.results:
                f.write(json.dumps(record) + "\n")
        
        return self.results

# Usage
if __name__ == "__main__":
    crawler = MedicalCrawlerSkill()
    results = crawler.run()
    print(f"Extracted {len(results)} medical research documents")
```

## Integration with Dashboard

Once crawler generates `crawler_output.jsonl`, transform to `about_summaries.json`:

```python
def transform_crawler_output(jsonl_file):
    """Transform crawler output to dashboard format"""
    documents = []
    
    with open(jsonl_file) as f:
        for line in f:
            record = json.loads(line)
            
            doc = {
                "file": record["url"].split("/")[-1],
                "doc_type": record["doc_type"],
                "about": generate_about(record),
                "significance": generate_significance(record),
                "key_excerpts": [record["snippet"]],
                "top_topics": list(record["concept_hits"].keys())[:5],
                "timeline_bucket": extract_month_year(record["dates"]),
                "has_doi": record["has_doi"],
                "has_pubmed_or_pmid": record["has_pubmed"],
                "has_arxiv": record["has_arxiv"],
                "topic_scores": [
                    [concept, score] 
                    for concept, score in record["concept_hits"].items()
                ]
            }
            
            documents.append(doc)
    
    return documents
```

## Testing & Validation

```bash
# Test crawler on single source
python -c "
from openclaw_medical_crawler_skill import MedicalCrawlerSkill
crawler = MedicalCrawlerSkill()
crawler.sources = [SOURCE_CONFIG_WIKI]  # Test wiki only
results = crawler.run()
print(f'Found {len(results)} results')
for r in results[:3]:
    print(f\"  - {r['title']}: {list(r['concept_hits'].keys())}\")
"

# Validate output
python -c "
import json
with open('crawler_output.jsonl') as f:
    records = [json.loads(line) for line in f]
    print(f'Total records: {len(records)}')
    print(f'With DOI: {sum(1 for r in records if r[\"has_doi\"])}')
    print(f'With PMID: {sum(1 for r in records if r[\"has_pubmed\"])}')
    print(f'Top concepts: {set(c for r in records for c in r[\"concept_hits\"].keys())}')
"
```
