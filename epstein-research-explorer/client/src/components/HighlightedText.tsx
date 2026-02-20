import { getHighlightSegments } from "@/lib/highlightUtils";

interface HighlightedTextProps {
  text: string;
  searchTerm?: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Component that renders text with highlighted search terms
 */
export default function HighlightedText({
  text,
  searchTerm,
  className = "",
  highlightClassName = "bg-yellow-200 font-semibold",
}: HighlightedTextProps) {
  if (!searchTerm) {
    return <span className={className}>{text}</span>;
  }

  const segments = getHighlightSegments(text, searchTerm);

  return (
    <span className={className}>
      {segments.map((segment, idx) =>
        segment.isHighlight ? (
          <mark key={idx} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={idx}>{segment.text}</span>
        )
      )}
    </span>
  );
}
