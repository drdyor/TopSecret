# Medical Discovery Pipeline

Single-command automated system for discovering and extracting medically relevant content from mirror sites. Uses OpenClaw crawler wrapped with medical term detection, auto-download, and JSON enforcement.

## Architecture

```
Mirror Sites
     ↓
OpenClaw scan (keyword + semantic filter)
     ↓
Return:
   - file URL
   - file title
   - snippet context
   - confidence score
     ↓
Auto-download matching PDFs
     ↓
Local archive
     ↓
Deterministic extraction pipeline
```

## Quick Start

```bash
# Run the pipeline
npx ts-node pipeline/runPipeline.ts

# Or build and run
cd pipeline
npm install
npm run build
node dist/runPipeline.js
```

## Output

The pipeline produces:

1. **Discovery Results** (`output/discovery/discovery_*.json`):
```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-20T06:00:00.000Z",
  "sources_scanned": ["Epstein Emails", "Epstein Encyclopedia"],
  "total_files_found": 42,
  "files": [
    {
      "file_url": "https://...",
      "source": "Epstein Emails",
      "title": "Medical Research Protocol",
      "medical_terms_found": ["mitochondria", "senescence"],
      "confidence": 0.85,
      "snippet": "...",
      "has_doi": true,
      "doc_type": "PAPER_LIKE"
    }
  ],
  "statistics": {
    "by_source": { "Epstein Emails": 20 },
    "by_concept": { "mitochondria": 15 },
    "avg_confidence": 0.78
  }
}
```

2. **Downloaded Files** (`output/downloads/`):
   - All discovered PDFs automatically downloaded

## Configuration

Edit `runPipeline.ts` to configure sources:

```typescript
const config = {
  sources: [
    {
      name: "My Source",
      baseUrl: "https://example.com",
      endpoints: ["/docs", "/docs?page=2"],
      minConfidence: 0.75,
      // ...
    }
  ],
  minConfidence: 0.75,
  maxFiles: 1000,
  outputDir: "./output/discovery",
  downloadDir: "./output/downloads",
  snapshotDir: "./output/snapshots",
};
```

## Medical Concepts Detected

### Primary Concepts (High Signal)
- MITOCHONDRIA, SENESCENCE, NAD_METABOLISM
- PLASMA_EXCHANGE, STEM_CELLS, PHOTOBIOMODULATION
- CAR_T_CELLS, IMMUNOTHERAPY, EXOSOMES, LONGEVITY

### Secondary Concepts (Medium Signal)
- AUTOPHAGY, TELOMERES, EPIGENETICS
- METABOLIC_HEALTH, INFLAMMATION, PROTEIN_FOLDING

### Interventions
- SENOLYTICS, NAD_BOOSTERS, RAPAMYCIN
- METFORMIN, CALORIC_RESTRICTION

## Pipeline Phases

1. **Init** - Setup directories and configuration
2. **Crawl** - Scan sources using OpenClaw adapter
3. **Filter** - Apply confidence threshold and noise filters
4. **Download** - Auto-download discovered PDFs
5. **Extract** - Extract structured data (placeholder)
6. **Validate** - Enforce schema compliance
7. **Snapshot** - Save timestamped JSON to disk

## Integration with Existing System

This pipeline can feed into your existing course generation system:

1. Run pipeline → discovers medical documents
2. Downloaded PDFs → feed into `fileParserService.ts`
3. Structured data → feed into `chunkedCourseGenerator.ts`
4. Generate courses with `courseRouter.ts`

## License

MIT
