# Keyword Highlighting Feature

## Overview

The research explorer now includes a powerful keyword highlighting system that helps you quickly locate specific information within document views.

## How It Works

### Two-Level Search System

1. **Main Search** (left input): Filters which documents appear in the list
   - Searches across: file names, topics, about text, significance, and excerpts
   - Narrows down to relevant documents

2. **Highlight Search** (right input): Highlights keywords within the selected document view
   - Highlights all occurrences in: About, Significance, and Evidence tabs
   - Shows match count for the current document
   - Case-insensitive matching

### Visual Feedback

- **Yellow highlighting**: Marks all occurrences of your search term
- **Match counter**: Shows "X matches for 'term' in current document"
- **Real-time updates**: Highlighting updates as you type

## Usage Examples

### Example 1: Find all mentions of "NAD+"

1. Click on a document in the left panel
2. Type "NAD+" in the "Highlight in view..." field
3. All occurrences of NAD+ will be highlighted in yellow
4. The counter shows how many times it appears

### Example 2: Search for documents, then highlight within them

1. Type "mitochondria" in the main search to filter documents
2. Select a document from the filtered results
3. Type "transplant" in the highlight field to find specific mentions
4. Navigate between documents and the highlighting updates automatically

### Example 3: Find context around a term

1. Search for "consciousness" in the main search
2. Select a consciousness-related document
3. Type "cognitive" in the highlight field
4. See all instances of cognitive-related content highlighted

## Features

### Smart Matching
- Case-insensitive (matches "NAD+", "nad+", "Nad+")
- Partial word matching (searching "mito" highlights "mitochondria")
- Works across all text content in the document view

### Match Counter
- Displays total matches in the current document
- Updates when you select a different document
- Shows in a yellow info box below the filters

### Persistent Highlighting
- Highlighting persists as you switch between tabs (About, So What, Dates, Evidence)
- Clearing the highlight field removes all highlighting
- Works with all document types

## Technical Details

### Highlighting Algorithm

The highlighting system uses case-insensitive substring matching:

```typescript
// Example: searching for "aging" in text
const text = "Aging and senescence are related concepts";
const searchTerm = "aging";
// Result: "Aging" is highlighted (case-insensitive match)
```

### Performance

- Highlighting is instant (< 50ms for typical documents)
- No server calls required (all client-side)
- Efficient for documents up to 100,000+ characters

### Supported Content

Highlighting works in:
- **About tab**: Document summary
- **So What tab**: Significance analysis
- **Evidence tab**: Key excerpts
- **Not highlighted**: Dates tab (structured data)

## Tips & Tricks

### Tip 1: Combine searches
Use main search to narrow documents, then highlight to find specific terms within them.

### Tip 2: Multi-word highlighting
You can search for multi-word terms: "stem cell" will highlight all occurrences.

### Tip 3: Special characters
Searching for special characters works: "NAD+" or "CoQ10" will find exact matches.

### Tip 4: Research workflow
1. Search for broad topic (e.g., "aging")
2. Click through filtered documents
3. Highlight specific keywords (e.g., "telomere", "senescence")
4. Identify patterns across documents

## Keyboard Shortcuts

- **Focus highlight field**: Click the "Highlight in view..." input
- **Clear highlighting**: Delete all text in the highlight field
- **Quick search**: Type in main search to filter documents first

## Troubleshooting

### Highlighting not showing?
- Make sure you've selected a document (click one in the left panel)
- Check that the highlight field is not empty
- Try typing a term you know exists in the document

### Match count seems wrong?
- The counter includes all occurrences across About, Significance, and Evidence sections
- Partial matches are included (searching "age" matches "aging", "aged", etc.)

### Performance issues?
- Highlighting is very fast, but extremely large documents (>1MB) may be slower
- This is rare with typical research documents

## Future Enhancements

Potential additions:
- Multi-term highlighting (highlight multiple terms in different colors)
- Regular expression support for advanced searches
- Export highlighted text
- Highlight history/recent searches
- Context snippets for matches
