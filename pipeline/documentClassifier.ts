/**
 * Document Classifier
 * 
 * Classifies documents by type and intent using pattern matching and keywords
 */

import { DocumentType, DocumentIntent, ExtractedDocument } from './extractionTypes';

// ============================================================================
// CLASSIFICATION PATTERNS
// ============================================================================

const DOCUMENT_TYPE_PATTERNS: Record<DocumentType, RegExp[]> = {
  email: [
    /from:\s*[\w.-]+@[\w.-]+\.\w+/i,
    /to:\s*[\w.-]+@[\w.-]+\.\w+/i,
    /subject:\s*.+/i,
    /sent:\s*\d{1,2}\/\d{1,2}\/\d{2,4}/i,
    /dear\s+(?:mr|ms|mrs|dr)?\s*\w+/i,
    /sincerely|regards|best\s+wishes/i,
    /@[\w.-]+\.\w+/i,
  ],
  memo: [
    /memorandum/i,
    /memo\s*(?:to|from|date|subject)/i,
    /internal\s+memo/i,
    /confidential\s+memo/i,
  ],
  proposal: [
    /proposal/i,
    /project\s+proposal/i,
    /grant\s+proposal/i,
    /budget\s+proposal/i,
    /research\s+proposal/i,
    /investment\s+proposal/i,
    /proposed\s+(?:budget|timeline|plan)/i,
  ],
  invoice: [
    /invoice\s*(?:#|number|no\.?)/i,
    /bill\s+to/i,
    /total\s+(?:amount|due)/i,
    /payment\s+(?:due|terms)/i,
    /subtotal|tax|grand\s+total/i,
    /\$\d+(?:,\d{3})*(?:\.\d{2})?/,
  ],
  meeting: [
    /meeting\s+(?:notes|minutes|agenda)/i,
    /attendees|participants/i,
    /action\s+items/i,
    /next\s+meeting/i,
    /conference\s+(?:call|room)/i,
    /present:\s*\w+/i,
  ],
  cv: [
    /curriculum\s+vitae/i,
    /resume/i,
    /work\s+experience/i,
    /education/i,
    /skills/i,
    /professional\s+experience/i,
    /employment\s+history/i,
    /qualifications/i,
  ],
  report: [
    /report/i,
    /analysis/i,
    /findings/i,
    /conclusions/i,
    /recommendations/i,
    /executive\s+summary/i,
    /methodology/i,
  ],
  paper: [
    /abstract/i,
    /keywords/i,
    /doi:/i,
    /arxiv/i,
    /references/i,
    /citation/i,
  ],
  contract: [
    /contract/i,
    /agreement/i,
    /terms\s+and\s+conditions/i,
    /hereby\s+agree/i,
    /party\s+(?:of\s+the\s+)?(?:first|second)\s+part/i,
    /effective\s+date/i,
    /termination/i,
  ],
  other: [],
};

const INTENT_PATTERNS: Record<DocumentIntent, RegExp[]> = {
  investment_ask: [
    /investment\s+(?:opportunity|proposal)/i,
    /funding\s+request/i,
    /capital\s+(?:raise|requirement)/i,
    /seeking\s+(?:investment|funding)/i,
    /investment\s+(?:amount|size)/i,
    /\$\d+(?:\.\d+)?\s*(?:million|billion|m|b)\b/i,
    /return\s+on\s+investment/i,
    /equity|stake|shares/i,
  ],
  research_request: [
    /research\s+(?:request|proposal|study)/i,
    /study\s+(?:proposal|protocol)/i,
    /clinical\s+trial/i,
    /research\s+(?:question|objective)/i,
    /methodology/i,
    /data\s+collection/i,
    /irb\s+approval/i,
  ],
  meeting_request: [
    /request\s+(?:a\s+)?meeting/i,
    /schedule\s+(?:a\s+)?(?:meeting|call)/i,
    /available\s+(?:for\s+)?(?:meeting|call)/i,
    /would\s+(?:you\s+)?like\s+to\s+meet/i,
    /let'?s\s+(?:schedule|meet|discuss)/i,
    /coffee|lunch|dinner/i,
    /discuss\s+(?:further|in\s+person)/i,
  ],
  info_sharing: [
    /please\s+find\s+attached/i,
    /attached\s+(?:is|please\s+find)/i,
    /enclosed\s+(?:is|please\s+find)/i,
    /sharing\s+(?:with\s+you|this\s+(?:document|info))/i,
    /for\s+your\s+(?:information|review|records)/i,
    /fyi\b/i,
    /as\s+(?:promised|discussed|requested)/i,
  ],
  sales_pitch: [
    /our\s+(?:product|service|solution)/i,
    /we\s+offer/i,
    /pricing/i,
    /demo/i,
    /free\s+trial/i,
    /contact\s+sales/i,
  ],
  collaboration: [
    /collaborate/i,
    /partnership/i,
    /joint\s+(?:venture|project)/i,
    /work\s+together/i,
    /cooperate/i,
  ],
  funding_request: [
    /funding\s+request/i,
    /grant\s+application/i,
    /financial\s+support/i,
    /donation/i,
    /sponsorship/i,
  ],
  unknown: [],
};

// ============================================================================
// CLASSIFICATION FUNCTIONS
// ============================================================================

/**
 * Score a document against a set of patterns
 */
function scorePatterns(text: string, patterns: RegExp[]): number {
  let score = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
}

/**
 * Classify document type based on content
 */
export function classifyDocumentType(text: string): DocumentType {
  const scores: Record<DocumentType, number> = {
    email: 0,
    memo: 0,
    proposal: 0,
    invoice: 0,
    meeting: 0,
    cv: 0,
    report: 0,
    paper: 0,
    contract: 0,
    other: 0,
  };

  // Score each type
  for (const [type, patterns] of Object.entries(DOCUMENT_TYPE_PATTERNS)) {
    scores[type as DocumentType] = scorePatterns(text, patterns);
  }

  // Find the best match
  let bestType: DocumentType = 'other';
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as DocumentType;
    }
  }

  // Require minimum score for classification
  if (bestScore < 2) {
    return 'other';
  }

  return bestType;
}

/**
 * Classify document intent based on content
 */
export function classifyDocumentIntent(text: string): DocumentIntent {
  const scores: Record<DocumentIntent, number> = {
    investment_ask: 0,
    research_request: 0,
    meeting_request: 0,
    info_sharing: 0,
    sales_pitch: 0,
    collaboration: 0,
    funding_request: 0,
    unknown: 0,
  };

  // Score each intent
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    scores[intent as DocumentIntent] = scorePatterns(text, patterns);
  }

  // Find the best match
  let bestIntent: DocumentIntent = 'unknown';
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as DocumentIntent;
    }
  }

  // Require minimum score for classification
  if (bestScore < 1) {
    return 'unknown';
  }

  return bestIntent;
}

/**
 * Full document classification
 */
export function classifyDocument(text: string, title?: string): {
  type: DocumentType;
  intent: DocumentIntent;
  confidence: number;
} {
  const fullText = (title || '') + ' ' + text;
  
  const type = classifyDocumentType(fullText);
  const intent = classifyDocumentIntent(fullText);
  
  // Calculate confidence based on pattern matches
  let confidence = 0.5; // Base confidence
  
  if (type !== 'other') {
    confidence += 0.2;
  }
  if (intent !== 'unknown') {
    confidence += 0.2;
  }
  
  // Cap at 0.9 (never 100% confident with pattern matching)
  confidence = Math.min(confidence, 0.9);
  
  return { type, intent, confidence };
}

/**
 * Extract entities from text (people, organizations, dates, amounts)
 */
export function extractEntities(text: string): {
  people: string[];
  organizations: string[];
  dates: string[];
  amounts: string[];
  emails: string[];
} {
  const people: string[] = [];
  const organizations: string[] = [];
  const dates: string[] = [];
  const amounts: string[] = [];
  const emails: string[] = [];

  // Extract emails
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  const emailMatches = text.match(emailPattern);
  if (emailMatches) {
    emails.push(...emailMatches);
  }

  // Extract amounts (money)
  const amountPattern = /\$\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:million|billion|m|b))?\b/gi;
  const amountMatches = text.match(amountPattern);
  if (amountMatches) {
    amounts.push(...amountMatches);
  }

  // Extract dates
  const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi;
  const dateMatches = text.match(datePattern);
  if (dateMatches) {
    dates.push(...dateMatches);
  }

  // Extract potential names (capitalized words)
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const nameMatches = text.match(namePattern);
  if (nameMatches) {
    // Filter out common non-name patterns
    const filtered = nameMatches.filter(name => {
      const lower = name.toLowerCase();
      return !lower.includes('dear') && 
             !lower.includes('best') && 
             !lower.includes('thank') &&
             !lower.includes('new york') &&
             !lower.includes('united states');
    });
    people.push(...filtered);
  }

  return {
    people: [...new Set(people)],
    organizations: [...new Set(organizations)],
    dates: [...new Set(dates)],
    amounts: [...new Set(amounts)],
    emails: [...new Set(emails)],
  };
}
