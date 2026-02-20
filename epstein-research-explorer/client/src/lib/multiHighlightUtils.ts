/**
 * Multi-term highlighting utilities with color coding
 */

export interface HighlightColor {
  term: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export interface MultiHighlightSegment {
  text: string;
  highlights: number[]; // Array of term indices that match this segment
}

// Predefined color palette for highlighting
export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { term: "", color: "#FCD34D", bgClass: "bg-yellow-300", textClass: "text-yellow-900" },
  { term: "", color: "#86EFAC", bgClass: "bg-green-300", textClass: "text-green-900" },
  { term: "", color: "#93C5FD", bgClass: "bg-blue-300", textClass: "text-blue-900" },
  { term: "", color: "#F472B6", bgClass: "bg-pink-300", textClass: "text-pink-900" },
  { term: "", color: "#FBBF24", bgClass: "bg-amber-300", textClass: "text-amber-900" },
  { term: "", color: "#A78BFA", bgClass: "bg-purple-300", textClass: "text-purple-900" },
  { term: "", color: "#34D399", bgClass: "bg-emerald-300", textClass: "text-emerald-900" },
  { term: "", color: "#FB7185", bgClass: "bg-rose-300", textClass: "text-rose-900" },
];

/**
 * Split text into segments with multi-term highlight information
 * @param text - The text to process
 * @param searchTerms - Array of terms to highlight
 * @returns Array of segments with highlight indices
 */
export function getMultiHighlightSegments(
  text: string,
  searchTerms: string[]
): MultiHighlightSegment[] {
  if (!searchTerms.length || !text) {
    return [{ text, highlights: [] }];
  }

  // Filter out empty terms
  const validTerms = searchTerms.filter((t) => t.trim().length > 0);
  if (!validTerms.length) {
    return [{ text, highlights: [] }];
  }

  // Create a map of positions and their matching term indices
  interface MatchInfo {
    start: number;
    end: number;
    termIndex: number;
  }

  const matches: MatchInfo[] = [];
  const lowerText = text.toLowerCase();

  // Find all matches for each term
  validTerms.forEach((term, termIndex) => {
    const lowerTerm = term.toLowerCase();
    let index = lowerText.indexOf(lowerTerm);

    while (index !== -1) {
      matches.push({
        start: index,
        end: index + term.length,
        termIndex,
      });
      index = lowerText.indexOf(lowerTerm, index + 1);
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Merge overlapping matches (keep all that overlap)
  const segments: MultiHighlightSegment[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    // Add non-highlighted text before this match
    if (match.start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.start),
        highlights: [],
      });
    }

    // Find all matches that overlap with current position
    const overlappingMatches = matches.filter(
      (m) => m.start <= match.start && m.end > match.start
    );

    // Find the end of all overlapping matches
    let endPos = match.end;
    for (const m of overlappingMatches) {
      endPos = Math.max(endPos, m.end);
    }

    // Get unique term indices for this segment
    const uniqueIndices = new Set(overlappingMatches.map((m) => m.termIndex));
    const termIndices = Array.from(uniqueIndices);

    segments.push({
      text: text.substring(match.start, endPos),
      highlights: termIndices,
    });

    lastIndex = endPos;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      highlights: [],
    });
  }

  return segments.length === 0 ? [{ text, highlights: [] }] : segments;
}

/**
 * Count occurrences of multiple search terms in text
 */
export function countMultiMatches(text: string, searchTerms: string[]): Record<string, number> {
  const counts: Record<string, number> = {};

  searchTerms.forEach((term) => {
    if (!term.trim()) return;
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(regex);
    counts[term] = matches ? matches.length : 0;
  });

  return counts;
}

/**
 * Get total unique matches across all terms
 */
export function getTotalUniqueMatches(text: string, searchTerms: string[]): number {
  const segments = getMultiHighlightSegments(text, searchTerms);
  return segments.filter((s) => s.highlights.length > 0).length;
}

/**
 * Get color configuration for a term at a specific index
 */
export function getColorForTermIndex(termIndex: number): HighlightColor {
  return HIGHLIGHT_COLORS[termIndex % HIGHLIGHT_COLORS.length];
}

/**
 * Create a color-coded legend for display
 */
export function createColorLegend(searchTerms: string[]): Array<{ term: string; color: HighlightColor }> {
  return searchTerms
    .filter((t) => t.trim().length > 0)
    .map((term, index) => ({
      term,
      color: getColorForTermIndex(index),
    }));
}
