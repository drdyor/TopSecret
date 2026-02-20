# Multi-Term Highlighting Feature Guide

## Overview

The multi-term highlighting feature allows you to simultaneously highlight multiple keywords in different colors for comparative analysis and pattern recognition across research documents.

## How It Works

### Activation

1. Open a document in the research explorer
2. Click the **"Multi-Highlight OFF"** button in the Document Intelligence panel to enable multi-highlighting mode
3. The button will change to **"Multi-Highlight ON"** (shown in blue)

### Adding Terms

Once multi-highlighting is enabled:

1. Type a keyword in the **"Add term..."** input field
2. Press **Enter** to add the term
3. The term appears in the color-coded legend below with a match count
4. Repeat to add up to 8 different terms (each gets a unique color)

### Color Palette

Each term is assigned a unique color automatically:

1. **Yellow** (#FCD34D)
2. **Green** (#86EFAC)
3. **Blue** (#93C5FD)
4. **Pink** (#F472B6)
5. **Amber** (#FBBF24)
6. **Purple** (#A78BFA)
7. **Emerald** (#34D399)
8. **Rose** (#FB7185)

Colors cycle if you add more than 8 terms.

### Removing Terms

- Click the **X button** next to any term in the legend to remove it
- The highlighting for that term disappears immediately
- The color becomes available for new terms

## User Interface Components

### Multi-Highlight Toggle Button
- **Location**: Top of Document Intelligence panel
- **States**: 
  - "Multi-Highlight OFF" (outline style) - disabled
  - "Multi-Highlight ON" (blue/default style) - enabled
- **Function**: Toggles between single-term and multi-term highlighting modes

### Add Term Input
- **Visibility**: Only appears when multi-highlighting is ON
- **Behavior**: Press Enter to add, Escape to clear
- **Placeholder**: "Add term..."

### Color-Coded Legend
- **Visibility**: Shows when at least one term is added
- **Contents**: 
  - Color swatch for each term
  - Term text
  - Match count in parentheses
  - Remove button (X)
- **Updates**: Real-time as you switch documents

### Match Counter
- **Visibility**: Shows when terms are added
- **Display**: "X total unique matches across all terms"
- **Updates**: Automatically when you select a different document

## Highlighting Behavior

### Single vs. Overlapping Matches

**Single Match**: Text highlighted in the term's assigned color with bold font

**Overlapping Matches**: When multiple terms match the same text segment:
- Background color is the first matching term's color
- A dashed border indicates multiple matches
- Hover tooltip shows all matching terms

### Affected Tabs

Highlighting applies to:
- **About**: Document summary
- **So What**: Significance analysis
- **Evidence**: Key excerpts

Highlighting does NOT apply to:
- **Dates**: Structured date data (not highlighted)
- Document metadata (file name, doc type, badges)

## Usage Scenarios

### Scenario 1: Comparative Analysis
Research how two concepts relate in a document:

1. Enable multi-highlighting
2. Add "aging" (yellow)
3. Add "senescence" (green)
4. Review the About tab to see how frequently each term appears
5. Check the Evidence tab for context where they co-occur

### Scenario 2: Thematic Tracking
Follow a specific theme through multiple documents:

1. Add "mitochondria" (yellow)
2. Add "NAD+" (green)
3. Add "energy metabolism" (blue)
4. Switch between documents to see which themes appear together
5. Use the match counts to identify documents rich in specific themes

### Scenario 3: Citation Pattern Recognition
Identify relationships between research areas:

1. Add "transplantation" (yellow)
2. Add "OXPHOS" (green)
3. Add "senescence" (blue)
4. Look for documents where all three appear
5. Review excerpts to understand the connection

### Scenario 4: Temporal Analysis
Track how terminology evolves:

1. Filter documents by date range using the main controls
2. Add "aging" (yellow)
3. Add "longevity" (green)
4. Compare terminology usage across time periods
5. Identify when terminology shifts occur

## Tips & Best Practices

### Tip 1: Start with 2-3 Terms
- 2-3 terms is usually optimal for visual clarity
- More than 5 terms can become overwhelming
- You can always remove and add new terms

### Tip 2: Use Consistent Terminology
- Search for "aging" and "aged" separately if you want to distinguish them
- Use exact terms for precise matching
- Partial word matching is case-insensitive

### Tip 3: Combine with Main Search
- Use main search to filter documents first
- Then use multi-highlighting to analyze within filtered results
- Example: Search for "mitochondria" documents, then highlight "transplant" and "NAD+"

### Tip 4: Document Your Findings
- Screenshot highlighted documents for reports
- Note match counts in your research notes
- Track which documents show interesting patterns

### Tip 5: Leverage the Legend
- The legend shows match counts at a glance
- Click X to quickly test different term combinations
- Reorder terms by removing and re-adding them

## Technical Details

### Matching Algorithm

- **Case-insensitive**: "NAD+", "nad+", "Nad+" all match
- **Partial matching**: "mito" matches "mitochondria", "mitochondrial"
- **Special characters**: Properly escaped for accurate matching
- **Performance**: Instant highlighting (< 50ms per document)

### Segment Rendering

When text contains multiple matching terms:
1. Segments are identified for each match
2. Overlapping segments are merged
3. All matching term indices are preserved
4. Visual hierarchy: color from first match, dashed border for multiples

### State Management

- Multi-highlighting state persists while viewing documents
- Clearing all terms disables multi-highlighting automatically
- Switching between tabs maintains highlighting
- Selecting a new document updates all counts

## Troubleshooting

### Terms not highlighting?
- Ensure multi-highlighting is ON (button should be blue)
- Check that at least one term is added
- Verify the term exists in the current document
- Try a simpler term to test

### Match count seems incorrect?
- Count includes all occurrences across About, Significance, and Evidence
- Partial matches are included (searching "age" matches "aging")
- Overlapping matches are counted separately for each term

### Performance issues?
- Highlighting is very fast for typical documents
- If slow, try removing some terms to reduce complexity
- Very large documents (>1MB) may take slightly longer

### Legend not showing?
- Legend only appears when at least one term is added
- Make sure you pressed Enter after typing
- Check that the term is not empty

## Keyboard Shortcuts

- **Enter**: Add term from input field
- **Escape**: Clear input field (when focused)
- **Click X**: Remove term from legend
- **Click button**: Toggle multi-highlighting mode

## Advanced Use Cases

### Use Case 1: Literature Review
- Add key concepts from your research question
- Highlight across all documents in a category
- Identify documents with the most comprehensive coverage

### Use Case 2: Contradiction Detection
- Add opposing concepts (e.g., "pro-aging" and "anti-aging")
- Find documents discussing both perspectives
- Analyze nuance in the Evidence tab

### Use Case 3: Methodology Tracking
- Add research methods (e.g., "transplantation", "in vitro", "in vivo")
- Identify which methodologies are used in which contexts
- Track methodology evolution over time

### Use Case 4: Author/Institution Analysis
- Add researcher names or institutions
- Track collaboration patterns
- Identify key players in specific research areas

## Limitations & Future Enhancements

### Current Limitations
- Maximum 8 simultaneous colors (cycles after that)
- No regex support (exact/partial string matching only)
- No export of highlighted text
- No search history

### Planned Enhancements
- Regular expression support for advanced patterns
- Export highlighted excerpts to markdown/PDF
- Search history and saved term sets
- Custom color assignment
- Multi-document highlighting statistics
- Heatmap view of term frequency across documents

## FAQ

**Q: Can I highlight the same term twice with different colors?**
A: No, each term is unique. Add it once and it gets one color.

**Q: What happens if I add a term that doesn't exist in the document?**
A: The term appears in the legend with "0" matches. It won't highlight anything.

**Q: Can I use multi-highlighting and single-term highlighting together?**
A: No, they're mutually exclusive. Enable multi-highlighting to use multiple terms, or disable it to use the single "Highlight in view..." field.

**Q: Does highlighting persist when I navigate to another document?**
A: Yes, your terms stay active. The highlighting updates to show matches in the new document.

**Q: Can I export the highlighted content?**
A: Not yet, but you can screenshot the highlighted document. Export feature is planned.

**Q: How many terms can I add?**
A: Technically unlimited, but 8+ terms becomes visually overwhelming due to color cycling.

**Q: Does highlighting affect the underlying data?**
A: No, highlighting is purely visual. It doesn't modify or export the document data.

**Q: Can I search across multiple documents at once?**
A: The highlighting works on the currently selected document only. Use the main search to filter documents first.
