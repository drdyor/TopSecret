/**
 * Medical Discovery Pipeline Types
 * 
 * Single-command automated system for discovering and extracting
 * medically relevant content from mirror sites.
 */

// ============================================================================
// MEDICAL CONCEPT TAXONOMY
// ============================================================================

export interface MedicalConcept {
  name: string;
  aliases: string[];
  coTerms: string[];
  weight: number;
}

export const PRIMARY_CONCEPTS: Record<string, MedicalConcept> = {
  MITOCHONDRIA: {
    name: "MITOCHONDRIA",
    aliases: ["mitochondrial", "mitochondrion", "OXPHOS", "ATP", "electron transport"],
    coTerms: ["energy", "cellular respiration", "Complex I", "Complex IV"],
    weight: 1.0,
  },
  SENESCENCE: {
    name: "SENESCENCE",
    aliases: ["cellular senescence", "senescent", "aging", "age-related"],
    coTerms: ["p16", "p21", "telomere", "autophagy"],
    weight: 0.95,
  },
  NAD_METABOLISM: {
    name: "NAD_METABOLISM",
    aliases: ["NAD+", "NAD", "nicotinamide adenine", "NADH", "sirtuin"],
    coTerms: ["mitochondria", "energy", "aging", "longevity"],
    weight: 0.98,
  },
  PLASMA_EXCHANGE: {
    name: "PLASMA_EXCHANGE",
    aliases: ["plasmapheresis", "plasma exchange", "apheresis", "TPE"],
    coTerms: ["antibodies", "autoimmune", "therapeutic"],
    weight: 0.92,
  },
  STEM_CELLS: {
    name: "STEM_CELLS",
    aliases: ["mesenchymal stem cells", "MSC", "hematopoietic", "pluripotent"],
    coTerms: ["regeneration", "tissue repair", "differentiation"],
    weight: 0.90,
  },
  PHOTOBIOMODULATION: {
    name: "PHOTOBIOMODULATION",
    aliases: ["red light therapy", "PBM", "light therapy", "phototherapy"],
    coTerms: ["mitochondria", "cytochrome c oxidase", "ATP"],
    weight: 0.88,
  },
  CAR_T_CELLS: {
    name: "CAR_T_CELLS",
    aliases: ["CAR-T", "chimeric antigen receptor", "adoptive cell therapy"],
    coTerms: ["cancer", "immunotherapy", "engineering"],
    weight: 0.85,
  },
  IMMUNOTHERAPY: {
    name: "IMMUNOTHERAPY",
    aliases: ["checkpoint inhibitor", "PD-1", "PD-L1", "CTLA-4", "immune checkpoint"],
    coTerms: ["cancer", "antibody", "T cell"],
    weight: 0.87,
  },
  EXOSOMES: {
    name: "EXOSOMES",
    aliases: ["extracellular vesicles", "EVs", "microvesicles", "exosome therapy"],
    coTerms: ["regeneration", "signaling", "delivery"],
    weight: 0.83,
  },
  LONGEVITY: {
    name: "LONGEVITY",
    aliases: ["lifespan", "healthspan", "life extension", "anti-aging"],
    coTerms: ["aging", "senescence", "disease prevention"],
    weight: 0.91,
  },
};

export const SECONDARY_CONCEPTS: Record<string, MedicalConcept> = {
  AUTOPHAGY: {
    name: "AUTOPHAGY",
    aliases: ["macroautophagy", "chaperone-mediated autophagy", "mTOR"],
    coTerms: ["cellular cleanup", "aging", "disease"],
    weight: 0.75,
  },
  TELOMERES: {
    name: "TELOMERES",
    aliases: ["telomere", "telomerase", "TERT"],
    coTerms: ["aging", "senescence", "replicative limit"],
    weight: 0.78,
  },
  EPIGENETICS: {
    name: "EPIGENETICS",
    aliases: ["DNA methylation", "histone modification", "epigenetic clock"],
    coTerms: ["aging", "gene expression", "reversibility"],
    weight: 0.72,
  },
  METABOLIC_HEALTH: {
    name: "METABOLIC_HEALTH",
    aliases: ["metabolic syndrome", "insulin sensitivity", "glucose metabolism"],
    coTerms: ["aging", "disease", "mitochondria"],
    weight: 0.70,
  },
  INFLAMMATION: {
    name: "INFLAMMATION",
    aliases: ["inflammaging", "chronic inflammation", "cytokine"],
    coTerms: ["aging", "disease", "immune"],
    weight: 0.73,
  },
  PROTEIN_FOLDING: {
    name: "PROTEIN_FOLDING",
    aliases: ["proteostasis", "chaperone", "unfolded protein response"],
    coTerms: ["aging", "neurodegeneration", "disease"],
    weight: 0.68,
  },
};

export const INTERVENTIONS: Record<string, MedicalConcept & { examples: string[] }> = {
  SENOLYTICS: {
    name: "SENOLYTICS",
    aliases: ["senolytic", "senescent cell clearance"],
    coTerms: ["aging", "clearance", "treatment"],
    weight: 0.85,
    examples: ["dasatinib", "quercetin", "fisetin"],
  },
  NAD_BOOSTERS: {
    name: "NAD_BOOSTERS",
    aliases: ["NAD+ precursor", "NMN", "NR", "nicotinamide riboside"],
    coTerms: ["NAD+", "supplement", "longevity"],
    weight: 0.90,
    examples: ["NMN", "NR", "NADH"],
  },
  RAPAMYCIN: {
    name: "RAPAMYCIN",
    aliases: ["mTOR inhibitor", "sirolimus"],
    coTerms: ["mTOR", "autophagy", "longevity"],
    weight: 0.82,
    examples: ["rapamycin", "everolimus"],
  },
  METFORMIN: {
    name: "METFORMIN",
    aliases: ["biguanide", "anti-diabetic"],
    coTerms: ["diabetes", "longevity", "metabolic"],
    weight: 0.75,
    examples: ["metformin"],
  },
  CALORIC_RESTRICTION: {
    name: "CALORIC_RESTRICTION",
    aliases: ["CR", "intermittent fasting", "IF", "time-restricted eating"],
    coTerms: ["fasting", "longevity", "metabolic"],
    weight: 0.78,
    examples: ["fasting", "caloric restriction"],
  },
};

// ============================================================================
// DISCOVERY RESULTS
// ============================================================================

export interface DiscoveredFile {
  file_url: string;
  source: string;
  title: string;
  medical_terms_found: string[];
  concept_hits: Record<string, number>;
  confidence: number;
  snippet: string;
  has_doi: boolean;
  has_pmid: boolean;
  has_arxiv: boolean;
  doc_type: DocType;
  dates: string[];
  timestamp: string;
}

export interface DiscoveryResult {
  version: string;
  timestamp: string;
  model_version: string;
  sources_scanned: string[];
  total_files_found: number;
  files: DiscoveredFile[];
  statistics: DiscoveryStatistics;
}

export interface DiscoveryStatistics {
  by_source: Record<string, number>;
  by_concept: Record<string, number>;
  by_doc_type: Record<string, number>;
  avg_confidence: number;
  cited_files: number;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocType = 
  | "PAPER_LIKE"
  | "REPORT_LIKE"
  | "MEMO_LIKE"
  | "PROTOCOL_LIKE"
  | "PROPOSAL_LIKE"
  | "UNKNOWN";

export const DOC_TYPE_PATTERNS: Record<DocType, { patterns: RegExp[]; minMatches: number; weight: number }> = {
  PAPER_LIKE: {
    patterns: [
      /\babstract\b/i,
      /\bintroduction\b/i,
      /\bmethodology|methods\b/i,
      /\bresults\b/i,
      /\bdiscussion\b/i,
      /\bconclusion\b/i,
      /\breferences\b/i,
    ],
    minMatches: 3,
    weight: 1.0,
  },
  REPORT_LIKE: {
    patterns: [
      /\bexecutive summary\b/i,
      /\bfindings\b/i,
      /\brecommendations\b/i,
      /\banalysis\b/i,
      /\bconclusion\b/i,
    ],
    minMatches: 2,
    weight: 0.85,
  },
  MEMO_LIKE: {
    patterns: [
      /\bto:\s*/i,
      /\bfrom:\s*/i,
      /\bdate:\s*/i,
      /\bsubject:\s*/i,
      /\bre:\s*/i,
    ],
    minMatches: 3,
    weight: 0.70,
  },
  PROTOCOL_LIKE: {
    patterns: [
      /\bprotocol\b/i,
      /\bprocedure\b/i,
      /\bstep\s+\d+/i,
      /\bmethod\b/i,
      /\binstruction\b/i,
    ],
    minMatches: 2,
    weight: 0.80,
  },
  PROPOSAL_LIKE: {
    patterns: [
      /\bproposal\b/i,
      /\bbudget\b/i,
      /\btimeline\b/i,
      /\bobjective\b/i,
      /\bdeliverable\b/i,
    ],
    minMatches: 2,
    weight: 0.75,
  },
  UNKNOWN: {
    patterns: [],
    minMatches: 0,
    weight: 0.0,
  },
};

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

export interface PipelineConfig {
  sources: SourceConfig[];
  minConfidence: number;
  maxFiles: number;
  outputDir: string;
  downloadDir: string;
  snapshotDir: string;
  respectRobotsTxt: boolean;
  rateLimitMs: number;
  timeout: number;
}

export interface SourceConfig {
  name: string;
  baseUrl: string;
  endpoints: string[];
  selectors: Record<string, string>;
  pagination?: {
    type: "url_param" | "next_button" | "infinite_scroll";
    param?: string;
    selector?: string;
    maxPages?: number;
  };
  keywords: string[];
  minConfidence: number;
  extractPdfLinks: boolean;
  followInternalLinks: boolean;
}

// ============================================================================
// PIPELINE EXECUTION
// ============================================================================

export interface PipelineProgress {
  phase: "init" | "crawl" | "filter" | "download" | "extract" | "validate" | "snapshot" | "complete" | "error";
  message: string;
  progress: number; // 0-100
  filesProcessed: number;
  filesTotal: number;
  errors: string[];
  startTime: string;
  currentSource?: string;
}

export interface PipelineResult {
  success: boolean;
  discoveryResult: DiscoveryResult | null;
  downloadedFiles: string[];
  validationErrors: string[];
  snapshotPath: string | null;
  executionTimeMs: number;
  error?: string;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  value: unknown;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion: string;
}
