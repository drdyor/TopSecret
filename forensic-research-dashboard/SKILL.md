---
name: forensic-research-dashboard
description: Build dark forensic biomedical research intelligence dashboards with pattern detection, multi-document analysis, and chapter-ready synthesis. Use for investigative research projects, medical intelligence platforms, or publishing tools that need credible, authoritative interfaces with cross-document pattern recognition.
---

# Forensic Research Intelligence Dashboard Skill

This skill provides a complete workflow for building premium, authoritative research intelligence dashboards. It transforms raw research documents into forensic analysis interfaces with pattern detection, credibility tiers, and intelligence synthesis.

## When to Use This Skill

Use this skill when you need to:

1. **Build investigative research platforms** - Analyze collections of documents (medical papers, legal files, research archives) with forensic-grade intelligence
2. **Create publishing tools** - Generate chapter-ready synthesis from document collections for books, reports, or articles
3. **Develop SaaS research products** - Build premium research tools that feel authoritative and expensive
4. **Implement pattern detection** - Identify recurring themes, interventions, or concepts across multiple documents
5. **Add credibility signals** - Display citation tiers, signal density, and evidence quality

## Core Workflow

### Phase 1: Data Structure Design

Define your document schema with these required fields:

```typescript
interface ResearchDocument {
  file: string;                    // Unique identifier (filename)
  doc_type: string;                // PAPER_LIKE | REPORT_LIKE | etc.
  about: string;                   // Summary/abstract
  significance: string;            // Why this matters
  key_excerpts: string[];          // Evidence quotes
  top_topics: string[];            // Extracted topics/themes
  timeline_bucket: string;         // YYYY-MM format
  has_doi: boolean;                // Citation credibility
  has_pubmed_or_pmid: boolean;     // Citation credibility
  has_arxiv: boolean;              // Citation credibility
  topic_scores?: [string, number][]; // Topic + relevance score
  procedure_density?: number;      // Therapeutic protocol mentions
}
```

**Key principle**: Structure data for cross-document analysis, not just display.

### Phase 2: UI Architecture

Build with these components:

1. **Signal Header** (top)
   - Document count, citation metrics, credibility percentage
   - Thin divider, minimal styling

2. **Theme Strip** (scrollable)
   - Clickable topic tags extracted from all documents
   - Enables quick filtering and exploration

3. **Document List** (left panel)
   - Flat typography-driven design (no heavy boxes)
   - Credibility tier badges (Tier 1-4 based on citations)
   - Topics inline, signal score visible

4. **Analysis Panel** (right panel)
   - Stacked sections: About, Significance, Evidence, Topics
   - Multi-highlighting support for comparative analysis
   - Intelligence Brief button for synthesis

### Phase 3: Visual Design

**Color Palette**:
- Background: Dark slate (slate-950 to slate-900)
- Text: Light slate (slate-100 to slate-300)
- Accents: Muted gold, soft glows on interaction
- Borders: Slate-700/30 (subtle, transparent)

**Typography**:
- Headers: Serif (Georgia, serif) for authority
- Body: Modern sans (system font stack)
- Monospace: File IDs, technical terms

**Interaction**:
- 200-300ms smooth transitions
- Soft glow on selected items
- Glassmorphism effects (backdrop blur)
- Micro-interactions on hover

### Phase 4: Intelligence Features

Implement these high-value features:

1. **Multi-Highlighting**
   - Add multiple search terms simultaneously
   - Each term gets unique color
   - Shows match counts per term
   - Highlights across all text sections

2. **Credibility Tiers**
   - Tier 1: DOI + PMID (Gold)
   - Tier 2: PubMed only (Silver)
   - Tier 3: arXiv/preprint (Bronze)
   - Tier 4: Uncited (Gray)

3. **Intelligence Brief**
   - One-click synthesis of filtered documents
   - Outputs: themes, timeline shifts, recurring interventions, citation density
   - Chapter-ready format (markdown/text)
   - Copy-to-clipboard functionality

4. **Pattern Detection**
   - Recurring interventions panel (sorted by frequency)
   - Timeline momentum (theme shifts year-over-year)
   - Signal density (citations per document)

## Implementation Steps

### Step 1: Set Up Data Pipeline

Create a data loader that:
- Reads JSON with your document schema
- Validates required fields
- Computes statistics (citation counts, topic frequency)
- Handles missing data gracefully

Reference: See `references/data-schema.md` for full schema documentation.

### Step 2: Build Core Components

Create these React components:

- **ResearchExplorer**: Main container (layout, state management)
- **DocumentList**: Left panel with filtering/sorting
- **AnalysisPanel**: Right panel with stacked sections
- **MultiHighlightedText**: Renders text with multiple color highlights
- **HighlightLegend**: Shows active highlight terms and match counts
- **PDFLink**: External link component to source documents

### Step 3: Implement Styling

Use dark theme with:
- Tailwind CSS with custom slate palette
- Glassmorphism (backdrop-blur) for depth
- Subtle shadows (shadow-lg shadow-slate-900/50)
- Smooth transitions (transition-all)

Reference: See `templates/tailwind-theme.css` for complete theme configuration.

### Step 4: Add Intelligence Features

Implement in this order (highest ROI first):

1. Multi-highlighting (2 hours)
2. Credibility tiers (1 hour)
3. Intelligence Brief button (2 hours)
4. Recurring interventions panel (3 hours)
5. Timeline momentum graph (4 hours)

### Step 5: Connect to Data Sources

Optional: Integrate with external APIs:

- **paper-search-mcp**: Search PubMed/arXiv for related papers
- **pubmed_parser**: Fetch full metadata from PubMed records
- **OpenClaw**: Auto-populate documents from crawled sources

Reference: See `references/api-integrations.md` for setup guides.

## Design Principles

### Forensic Aesthetic

- **Dark, serious tone**: Charcoal backgrounds, minimal colors
- **Typography-driven**: Structure through hierarchy, not boxes
- **Depth through interaction**: Glows, shadows, smooth transitions
- **Authoritative feel**: Serif headers, monospace IDs, clean layout

### Data-First Design

- **Signal visibility**: Always show citation counts, credibility tiers
- **Pattern emphasis**: Recurring themes, timeline shifts, intervention frequency
- **Comparative analysis**: Multi-highlighting for side-by-side concept exploration
- **Export-ready**: Intelligence Brief outputs chapter-ready markdown

### Premium Interaction

- **Smooth 200-300ms transitions**: Never jarring or instant
- **Micro-interactions**: Hover glows, selection feedback, loading states
- **Keyboard shortcuts**: ⌘K for search, arrow keys for navigation
- **Accessibility**: Focus rings, color contrast, semantic HTML

## Common Patterns

### Pattern 1: Adding a New Analysis Tab

```typescript
// In AnalysisPanel, add new section:
<div>
  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
    Section Title
  </h3>
  <div className="text-sm text-slate-300">
    {/* Your content */}
  </div>
</div>
```

### Pattern 2: Adding Filters

```typescript
// In search controls:
<select
  value={filterValue}
  onChange={(e) => setFilterValue(e.target.value)}
  className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-100 rounded"
>
  <option value="ALL">All options</option>
  <option value="OPTION_1">Option 1</option>
</select>
```

### Pattern 3: Computing Statistics

```typescript
const stats = useMemo(() => {
  const result = {
    totalDocs: filtered.length,
    citedDocs: filtered.filter(d => d.has_doi || d.has_pubmed_or_pmid).length,
    topTopics: getTopTopics(filtered),
  };
  return result;
}, [filtered]);
```

## Troubleshooting

**Dashboard feels generic/corporate**
- Increase serif usage in headers
- Darken background (use slate-950 instead of slate-900)
- Add more glow effects on interaction
- Use monospace for technical IDs

**Performance issues with large datasets**
- Implement virtualization for document list (react-window)
- Memoize expensive computations (useMemo)
- Lazy-load analysis panels
- Paginate results

**Data not displaying correctly**
- Validate schema matches interface definition
- Check for null/undefined in optional fields
- Use fallback values ("Undated" for missing dates)
- Log data structure to browser console

## Advanced Features (Optional)

1. **Semantic Similarity**: Embed documents with sentence-transformers, show similar documents
2. **Claim Density Scoring**: Count mechanistic words (inhibits, activates, protects) to separate casual from structured protocols
3. **MeSH Mapping**: Normalize biomedical terms using MeSH ontology
4. **Research Graph**: Node-based visualization of document relationships
5. **Timeline Momentum**: Animated stacked bar chart showing theme evolution over time

Reference: See `references/advanced-features.md` for implementation details.

## Example Implementations

- **Epstein Medical Research Explorer**: Analyzes medical research signals from historical documents
- **Cancer Research Agent**: Combines paper search with analysis for oncology research
- **Longevity Research Platform**: Tracks aging/senescence research across multiple sources

## Resources

- `references/data-schema.md` - Complete data structure documentation
- `references/api-integrations.md` - External API setup (paper-search-mcp, pubmed_parser, OpenClaw)
- `references/advanced-features.md` - Pattern engine, semantic similarity, MeSH mapping
- `templates/tailwind-theme.css` - Complete dark theme configuration
- `templates/sample-data.json` - Example document structure

## Next Steps After Building

1. **Load real data**: Replace sample data with your actual document collection
2. **Connect APIs**: Integrate paper-search-mcp or pubmed_parser for enrichment
3. **Add custom fields**: Extend schema with domain-specific metadata
4. **Implement export**: Add PDF/markdown export for Intelligence Brief
5. **Deploy**: Publish to Manus or external hosting with custom domain
