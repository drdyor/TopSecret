/**
 * Document Extraction Types
 * 
 * Data structures for extracted document metadata
 */

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType = 
  | "email"
  | "memo"
  | "proposal"
  | "invoice"
  | "meeting"
  | "cv"
  | "report"
  | "paper"
  | "contract"
  | "other";

export type DocumentIntent = 
  | "investment_ask"
  | "research_request"
  | "meeting_request"
  | "info_sharing"
  | "sales_pitch"
  | "collaboration"
  | "funding_request"
  | "unknown";

// ============================================================================
// EXTRACTED DOCUMENT
// ============================================================================

export interface ExtractedDocument {
  // Identity
  id: string;
  filePath: string;
  fileName: string;
  fileHash: string;
  fileType: string;
  
  // Content stats
  textLength: number;
  extractedText: string; // First 5000 chars for reference
  
  // Classification
  documentType: DocumentType;
  intent: DocumentIntent;
  summary: string;
  
  // Entities
  entities: Entity[];
  topics: string[];
  people: string[];
  organizations: string[];
  dates: string[];
  
  // Specialized
  medicalTerms: string[];
  
  // Metadata
  processedAt: string;
}

export interface Entity {
  name: string;
  type: "person" | "organization" | "location" | "technology" | "other";
  context?: string;
}

// ============================================================================
// CLASSIFICATION RESULT
// ============================================================================

export interface ClassificationResult {
  documentType: DocumentType;
  intent: DocumentIntent;
  summary: string;
  entities: Entity[];
  topics: string[];
  people: string[];
  organizations: string[];
  dates: string[];
  medicalTerms: string[];
  confidence: number;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export interface DocumentSearchQuery {
  query?: string;
  documentType?: DocumentType;
  intent?: DocumentIntent;
  topics?: string[];
  people?: string[];
  organizations?: string[];
  medicalTerms?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult {
  documents: ExtractedDocument[];
  total: number;
  facets: {
    byType: Record<DocumentType, number>;
    byIntent: Record<DocumentIntent, number>;
    byTopic: Record<string, number>;
    byPerson: Record<string, number>;
    byOrganization: Record<string, number>;
  };
}

// ============================================================================
// PIPELINE STATE
// ============================================================================

export interface ExtractionJob {
  id: string;
  status: "pending" | "processing" | "complete" | "error";
  inputDir: string;
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  errorFiles: number;
  startedAt: string;
  completedAt?: string;
  documents: ExtractedDocument[];
  error?: string;
}
