/**
 * Medical Term Detection Engine
 * 
 * Detects medical concepts, interventions, and citations in text.
 * Uses the taxonomy defined in types.ts for consistent scoring.
 */

import {
  PRIMARY_CONCEPTS,
  SECONDARY_CONCEPTS,
  INTERVENTIONS,
  DOC_TYPE_PATTERNS,
  type MedicalConcept,
  type DocType,
} from "./types";

// ============================================================================
// CITATION DETECTION PATTERNS
// ============================================================================

const CITATION_PATTERNS = {
  doi: /\b(10\.\d{4,}\/[^\s]+)\b/g,
  pmid: /\b(PMID:\s*\d+|PubMed ID:\s*\d+|pubmed\.ncbi\.nlm\.nih\.gov\/(\d+))\b/gi,
  arxiv: /\b(arxiv\.org\/abs\/\d+\.\d+|arXiv:\d+\.\d+)\b/gi,
  doiUrl: /\b(https?:\/\/doi\.org\/[^\s]+)\b/gi,
};

// ============================================================================
// NOISE FILTERS
// ============================================================================

const NOISE_PATTERNS = [
  /\benergy\s+drink\b/i,       // Not cellular energy
  /\btherapy\s+(dog|animal)\b/i, // Not medical therapy
  /\bgas\s+(station|pump)\b/i,   // Not cellular respiration
  /\bcell\s+phone\b/i,           // Not biological cell
];

// ============================================================================
// MEDICAL DETECTOR CLASS
// ============================================================================

export class MedicalDetector {
  private allConcepts: Map<string, MedicalConcept>;
  private interventionConcepts: Map<string, MedicalConcept & { examples: string[] }>;

  constructor() {
    this.allConcepts = new Map([
      ...Object.entries(PRIMARY_CONCEPTS),
      ...Object.entries(SECONDARY_CONCEPTS),
    ]);
    this.interventionConcepts = new Map(Object.entries(INTERVENTIONS));
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Score medical concept matches in text
   */
  scoreConceptHits(text: string): Record<string, number> {
    const hits: Record<string, number> = {};

    // Check primary and secondary concepts
    for (const [conceptName, concept] of this.allConcepts) {
      let count = 0;

      for (const alias of concept.aliases) {
        const regex = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, "gi");
        const matches = text.match(regex);
        if (matches) {
          count += matches.length;
        }
      }

      if (count > 0) {
        hits[conceptName] = count * concept.weight;
      }
    }

    // Check interventions
    for (const [interventionName, intervention] of this.interventionConcepts) {
      let count = 0;

      for (const alias of intervention.aliases) {
        const regex = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, "gi");
        const matches = text.match(regex);
        if (matches) {
          count += matches.length;
        }
      }

      // Also check for specific examples (drug names, etc.)
      for (const example of intervention.examples) {
        const regex = new RegExp(`\\b${this.escapeRegex(example)}\\b`, "gi");
        const matches = text.match(regex);
        if (matches) {
          count += matches.length;
        }
      }

      if (count > 0) {
        hits[interventionName] = count * intervention.weight;
      }
    }

    return hits;
  }

  /**
   * Extract all medical terms found in text
   */
  extractMedicalTerms(text: string): string[] {
    const terms = new Set<string>();

    // Check all concepts
    for (const [conceptName, concept] of this.allConcepts) {
      for (const alias of concept.aliases) {
        const regex = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, "gi");
        if (regex.test(text)) {
          terms.add(conceptName.toLowerCase());
          break;
        }
      }
    }

    // Check interventions
    for (const [interventionName, intervention] of this.interventionConcepts) {
      for (const alias of intervention.aliases) {
        const regex = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, "gi");
        if (regex.test(text)) {
          terms.add(interventionName.toLowerCase());
          break;
        }
      }
    }

    return Array.from(terms);
  }

  /**
   * Detect citations in text
   */
  detectCitations(text: string): { has_doi: boolean; has_pmid: boolean; has_arxiv: boolean } {
    return {
      has_doi: CITATION_PATTERNS.doi.test(text) || CITATION_PATTERNS.doiUrl.test(text),
      has_pmid: CITATION_PATTERNS.pmid.test(text),
      has_arxiv: CITATION_PATTERNS.arxiv.test(text),
    };
  }

  /**
   * Extract dates in YYYY-MM-DD format
   */
  extractDates(text: string): string[] {
    const datePattern = /\b(\d{4}-\d{2}-\d{2})\b/g;
    const matches = text.match(datePattern) || [];
    return [...new Set(matches)];
  }

  /**
   * Classify document type based on content patterns
   */
  classifyDocument(text: string): DocType {
    let bestType: DocType = "UNKNOWN";
    let bestScore = 0;

    const docTypes: DocType[] = ["PAPER_LIKE", "REPORT_LIKE", "MEMO_LIKE", "PROTOCOL_LIKE", "PROPOSAL_LIKE"];

    for (const docType of docTypes) {
      const config = DOC_TYPE_PATTERNS[docType];
      let matches = 0;

      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          matches++;
        }
      }

      if (matches >= config.minMatches) {
        const score = matches * config.weight;
        if (score > bestScore) {
          bestScore = score;
          bestType = docType;
        }
      }
    }

    return bestType;
  }

  /**
   * Check if text contains noise patterns that invalidate medical matches
   */
  isNoise(text: string): boolean {
    for (const pattern of NOISE_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate overall medical relevance confidence score
   */
  calculateConfidence(
    conceptHits: Record<string, number>,
    citations: { has_doi: boolean; has_pmid: boolean; has_arxiv: boolean },
    docType: DocType
  ): number {
    // Base score from concept hits
    const hitScores = Object.values(conceptHits);
    const baseScore = hitScores.length > 0 
      ? Math.min(hitScores.reduce((a, b) => a + b, 0) / hitScores.length, 1)
      : 0;

    // Citation bonus
    let citationBonus = 0;
    if (citations.has_doi) citationBonus += 0.15;
    if (citations.has_pmid) citationBonus += 0.15;
    if (citations.has_arxiv) citationBonus += 0.10;

    // Document type bonus
    const docTypeBonus: Record<DocType, number> = {
      PAPER_LIKE: 0.15,
      REPORT_LIKE: 0.10,
      PROTOCOL_LIKE: 0.12,
      PROPOSAL_LIKE: 0.08,
      MEMO_LIKE: 0.05,
      UNKNOWN: 0,
    };

    const confidence = Math.min(baseScore + citationBonus + docTypeBonus[docType], 1);
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Analyze a text snippet and return full medical analysis
   */
  analyze(text: string): {
    medicalTerms: string[];
    conceptHits: Record<string, number>;
    citations: { has_doi: boolean; has_pmid: boolean; has_arxiv: boolean };
    docType: DocType;
    dates: string[];
    confidence: number;
    isNoise: boolean;
  } {
    const medicalTerms = this.extractMedicalTerms(text);
    const conceptHits = this.scoreConceptHits(text);
    const citations = this.detectCitations(text);
    const docType = this.classifyDocument(text);
    const dates = this.extractDates(text);
    const confidence = this.calculateConfidence(conceptHits, citations, docType);
    const isNoise = this.isNoise(text);

    return {
      medicalTerms,
      conceptHits,
      citations,
      docType,
      dates,
      confidence,
      isNoise,
    };
  }
}

// Export singleton instance
export const medicalDetector = new MedicalDetector();
