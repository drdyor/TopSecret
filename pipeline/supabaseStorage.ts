/**
 * Supabase Storage for Document Extractions
 * 
 * Stores OpenClaw extraction results in Supabase PostgreSQL
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = 'https://abyudbiyvdfmtwdjesql.supabase.co';

// Note: Using service role for direct DB access. In production, use anon key with RLS.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieXVkYml5dmRmbXR3ZGplc3FsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MjU0MjQwMCwiZXhwIjoxOTU4MTE4NDAwfQ.rWCNhOoufJ-jdJU5l1K7u6dJRJ1QZGjt5bRC1dsCLs';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentExtraction {
  id?: number;
  source_url: string;
  source_name: string;
  title: string;
  content: string;
  document_type: string;
  intent: string;
  summary: string;
  entities: string[];
  topics: string[];
  medical_terms: string[];
  confidence: number;
  tags: string[];
  file_hash: string;
  created_at?: string;
}

export interface SearchFilters {
  query?: string;
  documentType?: string;
  intent?: string;
  topics?: string[];
  medicalTerms?: string[];
  minConfidence?: number;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Create the document_extractions table if it doesn't exist
 */
export async function initializeExtractionTable(): Promise<boolean> {
  try {
    // Try to create table
    const { error } = await supabase.rpc('create_extraction_table', {});
    
    if (error) {
      // Table might already exist, try inserting to check
      console.log('Table creation note:', error.message);
    }
    
    return true;
  } catch (err) {
    console.error('Error initializing table:', err);
    return false;
  }
}

/**
 * Insert a new document extraction
 */
export async function insertExtraction(extraction: DocumentExtraction): Promise<number | null> {
  const { data, error } = await supabase
    .from('document_extractions')
    .insert([extraction])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error inserting extraction:', error);
    return null;
  }
  
  return data?.id ?? null;
}

/**
 * Bulk insert extractions
 */
export async function bulkInsertExtractions(
  extractions: DocumentExtraction[]
): Promise<number> {
  const { data, error } = await supabase
    .from('document_extractions')
    .insert(extractions)
    .select('id');
  
  if (error) {
    console.error('Error bulk inserting:', error);
    return 0;
  }
  
  return data?.length ?? 0;
}

/**
 * Search document extractions
 */
export async function searchExtractions(
  filters: SearchFilters,
  limit: number = 50
): Promise<DocumentExtraction[]> {
  let query = supabase
    .from('document_extractions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (filters.documentType) {
    query = query.eq('document_type', filters.documentType);
  }
  
  if (filters.intent) {
    query = query.eq('intent', filters.intent);
  }
  
  if (filters.minConfidence) {
    query = query.gte('confidence', filters.minConfidence);
  }
  
  if (filters.topics && filters.topics.length > 0) {
    query = query.overlaps('topics', filters.topics);
  }
  
  if (filters.medicalTerms && filters.medicalTerms.length > 0) {
    query = query.overlaps('medical_terms', filters.medicalTerms);
  }
  
  if (filters.query) {
    // Full-text search on title and content
    query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching:', error);
    return [];
  }
  
  return data ?? [];
}

/**
 * Get extraction by ID
 */
export async function getExtraction(id: number): Promise<DocumentExtraction | null> {
  const { data, error } = await supabase
    .from('document_extractions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting extraction:', error);
    return null;
  }
  
  return data;
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('document_extractions')
    .select('tags');
  
  if (error) {
    console.error('Error getting tags:', error);
    return [];
  }
  
  // Flatten and dedupe tags
  const tagSet = new Set<string>();
  data?.forEach(doc => {
    doc.tags?.forEach((tag: string) => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

/**
 * Get statistics
 */
export async function getExtractionStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byIntent: Record<string, number>;
  avgConfidence: number;
}> {
  const { data, error } = await supabase
    .from('document_extractions')
    .select('document_type, intent, confidence');
  
  if (error) {
    console.error('Error getting stats:', error);
    return { total: 0, byType: {}, byIntent: {}, avgConfidence: 0 };
  }
  
  const byType: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  let totalConfidence = 0;
  
  data?.forEach(doc => {
    byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
    byIntent[doc.intent] = (byIntent[doc.intent] || 0) + 1;
    totalConfidence += doc.confidence || 0;
  });
  
  return {
    total: data?.length ?? 0,
    byType,
    byIntent,
    avgConfidence: data?.length ? totalConfidence / data.length : 0,
  };
}

/**
 * Check if URL already exists (deduplication)
 */
export async function urlExists(url: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('document_extractions')
    .select('id')
    .eq('source_url', url)
    .limit(1);
  
  if (error) {
    console.error('Error checking URL:', error);
    return false;
  }
  
  return (data?.length ?? 0) > 0;
}
