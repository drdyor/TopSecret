import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFLinkProps {
  fileName: string;
  baseUrl?: string;
}

export default function PDFLink({ fileName, baseUrl = "https://www.justice.gov/archives/epstein" }: PDFLinkProps) {
  const pdfUrl = `${baseUrl}/${fileName}`;

  return (
    <Button
      variant="default"
      size="sm"
      asChild
      className="gap-2"
    >
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
        <FileText className="h-4 w-4" />
        Open Document
        <ExternalLink className="h-4 w-4 ml-1" />
      </a>
    </Button>
  );
}
