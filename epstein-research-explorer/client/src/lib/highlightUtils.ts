/**
 * Utility functions for highlighting search terms in text
 */

export interface HighlightMatch {
  text: string;
  isHighlight: boolean;
}

/**
 * Split text into segments with highlight information
 * @param text - The text to process
 * @param searchTerm - The term to highlight (case-insensitive)
 * @returns Array of text segments with highlight flags
 */
export function getHighlightSegments(text: string, searchTerm: string): HighlightMatch[] {
  if (!searchTerm || !text) {
    return [{ text, isHighlight: false }];
  }

  const segments: HighlightMatch[] = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  let lastIndex = 0;

  let index = lowerText.indexOf(lowerSearch);
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, index),
        isHighlight: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: text.substring(index, index + searchTerm.length),
      isHighlight: true,
    });

    lastIndex = index + searchTerm.length;
    index = lowerText.indexOf(lowerSearch, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isHighlight: false,
    });
  }

  return segments.length === 0 ? [{ text, isHighlight: false }] : segments;
}

/**
 * Count occurrences of search term in text
 */
export function countMatches(text: string, searchTerm: string): number {
  if (!searchTerm || !text) return 0;
  const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Extract context around matches (e.g., 50 chars before/after)
 */
export function extractContextSnippets(
  text: string,
  searchTerm: string,
  contextLength: number = 50
): string[] {
  if (!searchTerm || !text) return [];

  const snippets: string[] = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  let index = lowerText.indexOf(lowerSearch);

  while (index !== -1) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + searchTerm.length + contextLength);
    const snippet = text.substring(start, end);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";
    snippets.push(prefix + snippet + suffix);
    index = lowerText.indexOf(lowerSearch, index + 1);
  }

  return snippets;
}
