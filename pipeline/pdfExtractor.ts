/**
 * PDF Text Extractor
 * 
 * Extracts text content from PDF files using pdf-parse
 */

import { readFile } from 'fs/promises';

// Simple PDF text extraction using pdf-parse
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath);
    
    // Dynamic import for pdf-parse (ESM compatibility)
    const pdfParse = (await import('pdf-parse')).default;
    
    const data = await pdfParse(buffer, {
      max: 0, // No page limit
    });
    
    return data.text || '';
  } catch (error) {
    console.error(`Error extracting PDF ${filePath}:`, error);
    return '';
  }
}

/**
 * Extract text from various document types
 */
export async function extractText(filePath: string, mimeType?: string): Promise<string> {
  const ext = filePath.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'pdf':
      return extractTextFromPDF(filePath);
    
    case 'txt':
    case 'md':
    case 'json':
    case 'csv':
      const content = await readFile(filePath, 'utf-8');
      return content;
    
    default:
      // Try to read as text
      try {
        const content = await readFile(filePath, 'utf-8');
        return content;
      } catch {
        console.warn(`Unsupported file type: ${ext}`);
        return '';
      }
  }
}
