/**
 * Document Extraction Pipeline
 * 
 * Process local documents: hash → extract text → classify → store metadata
 * Only stores extracted data, NOT the actual files
 */

import { createHash } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { extractTextFromPDF } from './pdfExtractor';
import { classifyDocument } from './documentClassifier';
import { ExtractedDocument, DocumentIntent } from './extractionTypes';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ExtractionConfig {
  inputDir: string;
  outputDir?: string;
  skipHashCheck?: boolean;
  forceReprocess?: boolean;
}

export interface ExtractionProgress {
  phase: 'scanning' | 'hashing' | 'extracting' | 'classifying' | 'storing' | 'complete';
  message: string;
  total: number;
  processed: number;
  skipped: number;
  errors: number;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Generate SHA256 hash of file content
 */
export async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Get all document files from a directory
 */
export async function scanDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const supportedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
  
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(dirPath);
  return files;
}

/**
 * Extract text from file based on extension
 */
export async function extractText(filePath: string): Promise<string> {
  const ext = extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return await extractTextFromPDF(filePath);
    case '.txt':
      return await readFile(filePath, 'utf-8');
    case '.doc':
    case '.docx':
      // TODO: Implement DOC/DOCX extraction
      console.warn(`DOC/DOCX extraction not implemented for ${filePath}`);
      return '';
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Process a single document
 */
export async function processDocument(
  filePath: string,
  existingHashes: Set<string>
): Promise<ExtractedDocument | null> {
  // Hash the file
  const hash = await hashFile(filePath);
  
  // Check for duplicates
  if (existingHashes.has(hash)) {
    console.log(`Skipping duplicate: ${basename(filePath)}`);
    return null;
  }
  
  existingHashes.add(hash);
  
  // Extract text
  const text = await extractText(filePath);
  if (!text.trim()) {
    console.warn(`No text extracted from: ${basename(filePath)}`);
    return null;
  }
  
  // Classify via Ollama
  const classification = await classifyDocument(text, basename(filePath));
  
  const extracted: ExtractedDocument = {
    id: hash.substring(0, 16),
    filePath,
    fileName: basename(filePath),
    fileHash: hash,
    fileType: extname(filePath).toLowerCase().replace('.', ''),
    textLength: text.length,
    extractedText: text.substring(0, 5000), // Store first 5000 chars for reference
    documentType: classification.documentType,
    intent: classification.intent,
    summary: classification.summary,
    entities: classification.entities,
    topics: classification.topics,
    people: classification.people,
    organizations: classification.organizations,
    dates: classification.dates,
    medicalTerms: classification.medicalTerms,
    processedAt: new Date().toISOString(),
  };
  
  return extracted;
}

/**
 * Main extraction pipeline
 */
export async function runExtractionPipeline(
  config: ExtractionConfig,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<{
  documents: ExtractedDocument[];
  stats: { total: number; processed: number; skipped: number; errors: number };
}> {
  const documents: ExtractedDocument[] = [];
  const existingHashes = new Set<string>();
  
  const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
  };
  
  // Phase 1: Scan directory
  onProgress?.({
    phase: 'scanning',
    message: 'Scanning for documents...',
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
  });
  
  const files = await scanDirectory(config.inputDir);
  stats.total = files.length;
  
  console.log(`Found ${files.length} documents to process`);
  
  // Phase 2-4: Process each file
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const fileName = basename(filePath);
    
    onProgress?.({
      phase: 'extracting',
      message: `Processing: ${fileName}`,
      total: files.length,
      processed: stats.processed,
      skipped: stats.skipped,
      errors: stats.errors,
    });
    
    try {
      // Check if already processed (skip hash check if forced)
      if (!config.forceReprocess) {
        const hash = await hashFile(filePath);
        // In production, check database here
        // For now, just process
      }
      
      const extracted = await processDocument(filePath, existingHashes);
      
      if (extracted) {
        documents.push(extracted);
        stats.processed++;
      } else {
        stats.skipped++;
      }
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
      stats.errors++;
    }
  }
  
  onProgress?.({
    phase: 'complete',
    total: stats.total,
    processed: stats.processed,
    skipped: stats.skipped,
    errors: stats.errors,
    message: `Processed ${stats.processed} documents`,
  });
  
  return { documents, stats };
}
