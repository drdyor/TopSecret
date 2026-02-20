import { getMultiHighlightSegments, getColorForTermIndex } from "@/lib/multiHighlightUtils";

interface MultiHighlightedTextProps {
  text: string;
  searchTerms?: string[];
  className?: string;
}

/**
 * Component that renders text with multi-term highlighting in different colors
 */
export default function MultiHighlightedText({
  text,
  searchTerms = [],
  className = "",
}: MultiHighlightedTextProps) {
  // Filter out empty terms
  const validTerms = searchTerms.filter((t) => t.trim().length > 0);

  if (!validTerms.length) {
    return <span className={className}>{text}</span>;
  }

  const segments = getMultiHighlightSegments(text, validTerms);

  return (
    <span className={className}>
      {segments.map((segment, idx) => {
        // No highlights for this segment
        if (segment.highlights.length === 0) {
          return <span key={idx}>{segment.text}</span>;
        }

        // Single highlight
        if (segment.highlights.length === 1) {
          const termIndex = segment.highlights[0];
          const color = getColorForTermIndex(termIndex);
          return (
            <mark
              key={idx}
              className={`${color.bgClass} ${color.textClass} font-semibold`}
              style={{ backgroundColor: color.color }}
            >
              {segment.text}
            </mark>
          );
        }

        // Multiple highlights (overlapping matches)
        // Use a gradient or pattern to show multiple matches
        const colors = segment.highlights.map((idx) => getColorForTermIndex(idx));
        const bgColor = colors[0].color;

        return (
          <mark
            key={idx}
            className="font-semibold border-2 border-dashed"
            style={{
              backgroundColor: bgColor,
              borderColor: colors.length > 1 ? "#666" : "transparent",
              opacity: 0.85,
            }}
            title={`Matches: ${colors.map((c, i) => validTerms[segment.highlights[i]]).join(", ")}`}
          >
            {segment.text}
          </mark>
        );
      })}
    </span>
  );
}
