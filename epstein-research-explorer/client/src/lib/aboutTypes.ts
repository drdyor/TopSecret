export type DateEvidence = {
  date: string;      // YYYY-MM-DD
  context: string;
};

export type AboutSummary = {
  file: string;
  doc_type: string; // CHAT_LOG | PROPOSAL_MEMO | PRESS_RELEASE | PAPER_LIKE | UNKNOWN | ERROR
  about: string;
  top_topics: string[];
  has_doi: boolean;
  has_pubmed_or_pmid: boolean;
  has_arxiv: boolean;
  procedure_density: number;
  dates_found: DateEvidence[];
  timeline_bucket: string | null; // YYYY-MM
  significance: string;
  confidence_notes: string[];
  topic_scores: [string, number][];
  key_excerpts: string[];
};
