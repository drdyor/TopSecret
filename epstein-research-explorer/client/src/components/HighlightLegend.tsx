import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createColorLegend } from "@/lib/multiHighlightUtils";

interface HighlightLegendProps {
  searchTerms: string[];
  matchCounts: Record<string, number>;
  onRemoveTerm: (term: string) => void;
}

/**
 * Component that displays a color-coded legend of highlight terms
 */
export default function HighlightLegend({
  searchTerms,
  matchCounts,
  onRemoveTerm,
}: HighlightLegendProps) {
  const validTerms = searchTerms.filter((t) => t.trim().length > 0);

  if (!validTerms.length) {
    return null;
  }

  const legend = createColorLegend(validTerms);

  return (
    <div className="rounded-md bg-slate-50 border border-slate-200 p-3 space-y-2">
      <div className="text-sm font-semibold text-slate-700">Highlight Legend</div>
      <div className="flex flex-wrap gap-2">
        {legend.map(({ term, color }) => (
          <div
            key={term}
            className="flex items-center gap-2 px-2 py-1 rounded bg-white border border-slate-200"
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color.color }}
              title={`${matchCounts[term] || 0} matches`}
            />
            <span className="text-sm font-medium text-slate-700">{term}</span>
            <span className="text-xs text-slate-500">({matchCounts[term] || 0})</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-red-100"
              onClick={() => onRemoveTerm(term)}
              title="Remove this highlight"
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
