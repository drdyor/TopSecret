-- Document Extractions Table for OpenClaw Results
-- Stores website crawl results with medical detection and classification

CREATE TABLE IF NOT EXISTS document_extractions (
  id BIGSERIAL PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'unknown',
  intent TEXT DEFAULT 'unknown',
  summary TEXT,
  entities TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  medical_terms TEXT[] DEFAULT '{}',
  confidence REAL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  file_hash TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common searches
CREATE INDEX IF NOT EXISTS idx_extractions_source ON document_extractions(source_name);
CREATE INDEX IF NOT EXISTS idx_extractions_doc_type ON document_extractions(document_type);
CREATE INDEX IF NOT EXISTS idx_extractions_intent ON document_extractions(intent);
CREATE INDEX IF NOT EXISTS idx_extractions_confidence ON document_extractions(confidence);
CREATE INDEX IF NOT EXISTS idx_extractions_created ON document_extractions(created_at DESC);

-- Enable Row Level Security (optional - can be disabled for admin access)
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for now - tighten in production)
CREATE POLICY "Allow public read" ON document_extractions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON document_extractions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON document_extractions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON document_extractions
  FOR DELETE USING (true);

-- Function to check if URL already exists
CREATE OR REPLACE FUNCTION url_exists(p_url TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM document_extractions
  WHERE source_url = p_url;
  
  RETURN exists_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE document_extractions IS 'Document extractions from OpenClaw crawler with medical term detection and classification';
