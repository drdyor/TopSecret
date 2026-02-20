# OpenClaw Integration Guide

## Architecture Overview

This research explorer is designed to work with **OpenClaw as the autonomous crawler**. OpenClaw will:

1. **Crawl all Epstein data sources** for medical research content
2. **Extract and analyze** documents using LLM capabilities
3. **Generate `about_summaries.json`** with structured intelligence
4. **Feed data into** this research explorer for browsing and analysis

## Data Flow

```
OpenClaw Agent
    ↓
[Crawls all sources]
    ├─ jmail.world (emails)
    ├─ jmail.world/photos
    ├─ jmail.world/drive
    ├─ jmail.world/jacebook
    ├─ jmail.world/jamazon
    ├─ jmail.world/flights
    ├─ jmail.world/wiki
    ├─ jmail.world/jotify
    ├─ jmail.world/jefftube
    ├─ epstein-file-explorer.com
    └─ epsteinexposed.com/network
    ↓
[Extracts medical content]
    ↓
[Generates about_summaries.json]
    ↓
Research Explorer
    ├─ Search & Filter
    ├─ Document Intelligence (About, Significance, Dates, Evidence)
    ├─ Links to Justice Department archives
    └─ Topic/Timeline Analysis
```

## OpenClaw Skill Template

Create an OpenClaw skill that:

### 1. Medical Content Detection
- Identify documents containing medical/health research keywords
- Filter for: aging, longevity, consciousness, treatments, supplements, etc.
- Use the medical lexicon from `epstein_medical_crawler_enhanced.py`

### 2. Document Analysis
For each medical document found:

```json
{
  "file": "EFTA00611136.pdf",
  "doc_type": "PAPER_LIKE|CHAT_LOG|PROPOSAL_MEMO|PRESS_RELEASE|UNKNOWN",
  "about": "1-2 sentence summary of what the document is about",
  "top_topics": ["topic1", "topic2", "topic3"],
  "has_doi": true/false,
  "has_pubmed_or_pmid": true/false,
  "has_arxiv": true/false,
  "procedure_density": 0.0-1.0,
  "dates_found": [
    {"date": "YYYY-MM-DD", "context": "brief context"}
  ],
  "timeline_bucket": "YYYY-MM",
  "significance": "2-3 sentence analysis of why this matters",
  "confidence_notes": ["note1", "note2"],
  "topic_scores": [["topic", score], ...],
  "key_excerpts": ["excerpt1", "excerpt2"]
}
```

### 3. Output Format
Generate a JSON array and output to:
```
client/public/about_summaries.json
```

## Running the OpenClaw Crawler

### Option A: Browser Automation (Recommended)
```bash
openclaw skill install openclaw/web-scraper
openclaw run --skill web-scraper \
  --urls "jmail.world,jmail.world/drive,jmail.world/wiki,epstein-file-explorer.com" \
  --filter "medical|health|aging|longevity|consciousness|treatment" \
  --output "about_summaries.json"
```

### Option B: Custom OpenClaw Skill
Create `skills/epstein-medical-crawler/skill.yaml`:

```yaml
name: epstein-medical-crawler
description: Crawls Epstein data sources for medical research content
version: 1.0.0

tools:
  - name: crawl_source
    description: Crawl a single Epstein data source
    parameters:
      url: string
      filter_keywords: string[]
      
  - name: extract_medical_content
    description: Extract medical research from document
    parameters:
      document_text: string
      
  - name: generate_summary
    description: Generate about_summaries.json entry
    parameters:
      document_data: object

workflow:
  - step: crawl_all_sources
    sources:
      - jmail.world
      - jmail.world/drive
      - jmail.world/wiki
      - epstein-file-explorer.com
      - epsteinexposed.com/network
      
  - step: filter_medical_content
    keywords:
      - aging
      - longevity
      - consciousness
      - mitochondria
      - NAD+
      - stem cells
      - gene therapy
      - immunotherapy
      - supplements
      - regenerative medicine
      
  - step: analyze_each_document
    actions:
      - detect_doc_type
      - extract_topics
      - find_citations (DOI, PMID, arXiv)
      - extract_dates
      - generate_significance
      - extract_key_excerpts
      
  - step: output_json
    format: about_summaries.json
    location: client/public/
```

## Medical Keywords Reference

Use this comprehensive lexicon for filtering:

**Aging & Longevity**
- senescence, telomeres, biological age, age reversal, gerontology, healthspan, lifespan

**Mitochondrial Health**
- NAD+, ATP, mitochondrial transplant, OXPHOS, mtDNA, cellular energy, mitochondrial dysfunction

**Nutrition & Supplements**
- vitamins, resveratrol, CoQ10, probiotics, microbiome, nutraceuticals, plant compounds

**Cancer & Oncology**
- immunotherapy, CAR-T, checkpoint inhibitors, tumor biology, cancer prevention

**Consciousness & Brain**
- cognitive decline, Alzheimer, Parkinson, neuroplasticity, consciousness, brain health

**Experimental Treatments**
- stem cells, gene therapy, regenerative medicine, peptides, cell therapy

**Cardiovascular Health**
- atherosclerosis, endothelial function, blood pressure, cholesterol, vascular health

**Metabolic Health**
- insulin resistance, glucose metabolism, metabolic syndrome, obesity

**Inflammation & Immunity**
- inflammaging, immune system, autoimmune, oxidative stress, cytokines

**Physical Health**
- exercise, muscle, strength, athletic performance, rehabilitation

## Integration Steps

1. **Install OpenClaw**: Follow setup at https://github.com/openclaw/openclaw
2. **Create the skill**: Use template above or install from ClawHub
3. **Configure sources**: Point to all Epstein data URLs
4. **Set medical filters**: Use keyword list above
5. **Run crawler**: Generate `about_summaries.json`
6. **Deploy to site**: Copy JSON to `client/public/`
7. **Publish explorer**: Users can now search all extracted medical content

## Expected Output

After running OpenClaw, you'll have:
- 100+ medical documents extracted
- Structured metadata (topics, dates, significance)
- Links to original Justice Department archives
- Ready-to-publish research explorer

## Next Steps

1. Set up OpenClaw locally
2. Test with one source (e.g., jmail.world/wiki)
3. Refine medical keyword filters
4. Run full crawl across all sources
5. Generate final `about_summaries.json`
6. Deploy to production

## Notes

- **No PDF storage needed**: Links go directly to justice.gov
- **LLM-powered analysis**: OpenClaw handles summarization and significance
- **Scalable**: Can add more sources or refine filters anytime
- **Reproducible**: Same keywords = same results across runs
