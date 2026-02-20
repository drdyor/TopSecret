/**
 * JSON Schema Validator
 * 
 * Enforces schema validation on discovered documents.
 * Provides validation errors, warnings, and fallback handling.
 */

import {
  type DiscoveredFile,
  type DiscoveryResult,
  type DiscoveryStatistics,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from "./types";

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export const REQUIRED_FIELDS: (keyof DiscoveredFile)[] = [
  "file_url",
  "source",
  "title",
  "medical_terms_found",
  "concept_hits",
  "confidence",
  "snippet",
  "doc_type",
  "timestamp",
];

export const OPTIONAL_FIELDS: (keyof DiscoveredFile)[] = [
  "has_doi",
  "has_pmid",
  "has_arxiv",
  "dates",
];

export const FIELD_TYPES: Record<keyof DiscoveredFile, string> = {
  file_url: "string",
  source: "string",
  title: "string",
  medical_terms_found: "array",
  concept_hits: "object",
  confidence: "number",
  snippet: "string",
  has_doi: "boolean",
  has_pmid: "boolean",
  has_arxiv: "boolean",
  doc_type: "string",
  dates: "array",
  timestamp: "string",
};

// ============================================================================
// VALIDATOR
// ============================================================================

export class SchemaValidator {
  /**
   * Validate a single discovered file
   */
  validateFile(file: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (typeof file !== "object" || file === null) {
      errors.push({
        path: "",
        message: "File must be an object",
        value: file,
      });
      return { valid: false, errors, warnings };
    }

    const fileObj = file as Record<string, unknown>;

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!(field in fileObj)) {
        errors.push({
          path: field,
          message: `Missing required field: ${field}`,
          value: undefined,
        });
      }
    }

    // Validate field types
    for (const [field, expectedType] of Object.entries(FIELD_TYPES)) {
      if (field in fileObj) {
        const value = fileObj[field];
        const actualType = Array.isArray(value) ? "array" : typeof value;

        if (actualType !== expectedType && !(expectedType === "array" && Array.isArray(value))) {
          errors.push({
            path: field,
            message: `Field ${field} has wrong type. Expected ${expectedType}, got ${actualType}`,
            value,
          });
        }
      }
    }

    // Validate confidence range
    if (typeof fileObj.confidence === "number") {
      if (fileObj.confidence < 0 || fileObj.confidence > 1) {
        errors.push({
          path: "confidence",
          message: "Confidence must be between 0 and 1",
          value: fileObj.confidence,
        });
      }
    }

    // Validate medical_terms_found is non-empty array
    if (Array.isArray(fileObj.medical_terms_found)) {
      if (fileObj.medical_terms_found.length === 0) {
        warnings.push({
          path: "medical_terms_found",
          message: "medical_terms_found is empty - may indicate false positive",
          suggestion: "Consider filtering out this result",
        });
      }
    }

    // Validate snippet length
    if (typeof fileObj.snippet === "string") {
      if (fileObj.snippet.length < 20) {
        warnings.push({
          path: "snippet",
          message: "Snippet is very short - may not contain enough context",
          suggestion: "Consider increasing snippet size",
        });
      }
    }

    // Suggest optional fields if missing
    if (!("has_doi" in fileObj)) {
      warnings.push({
        path: "has_doi",
        message: "Missing optional field has_doi",
        suggestion: "Run citation detection to populate this field",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate entire discovery result
   */
  validateDiscoveryResult(result: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (typeof result !== "object" || result === null) {
      errors.push({
        path: "",
        message: "Discovery result must be an object",
        value: result,
      });
      return { valid: false, errors, warnings };
    }

    const resultObj = result as Record<string, unknown>;

    // Check required top-level fields
    if (!("version" in resultObj)) {
      errors.push({ path: "version", message: "Missing required field: version", value: undefined });
    }

    if (!("timestamp" in resultObj)) {
      errors.push({ path: "timestamp", message: "Missing required field: timestamp", value: undefined });
    }

    if (!("files" in resultObj)) {
      errors.push({ path: "files", message: "Missing required field: files", value: undefined });
    }

    if (!("statistics" in resultObj)) {
      warnings.push({
        path: "statistics",
        message: "Missing optional field: statistics",
        suggestion: "Run computeStatistics() to populate",
      });
    }

    // Validate files array
    if (Array.isArray(resultObj.files)) {
      for (let i = 0; i < resultObj.files.length; i++) {
        const fileValidation = this.validateFile(resultObj.files[i]);
        errors.push(
          ...fileValidation.errors.map((e) => ({
            ...e,
            path: `files[${i}].${e.path}`,
            value: e.value,
          }))
        );
        warnings.push(
          ...fileValidation.warnings.map((w) => ({
            ...w,
            path: `files[${i}].${w.path}`,
          }))
        );
      }
    } else if ("files" in resultObj) {
      errors.push({
        path: "files",
        message: "files must be an array",
        value: resultObj.files,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Apply defaults to fill in missing optional fields
   */
  applyDefaults(file: DiscoveredFile): DiscoveredFile {
    return {
      has_doi: file.has_doi ?? false,
      has_pmid: file.has_pmid ?? false,
      has_arxiv: file.has_arxiv ?? false,
      dates: file.dates ?? [],
      ...file,
    };
  }

  /**
   * Normalize a file to ensure schema compliance
   */
  normalizeFile(file: unknown): DiscoveredFile | null {
    const validation = this.validateFile(file);

    if (!validation.valid) {
      console.error("[Validator] Normalization failed:", validation.errors);
      return null;
    }

    // Apply defaults
    const normalized = this.applyDefaults(file as DiscoveredFile);

    // Ensure arrays and objects are properly typed
    return {
      ...normalized,
      medical_terms_found: Array.isArray(normalized.medical_terms_found)
        ? normalized.medical_terms_found
        : [],
      concept_hits:
        typeof normalized.concept_hits === "object" && normalized.concept_hits !== null
          ? normalized.concept_hits
          : {},
      dates: Array.isArray(normalized.dates) ? normalized.dates : [],
    };
  }
}

// ============================================================================
// STATISTICS COMPUTATION
// ============================================================================

export function computeStatistics(files: DiscoveredFile[]): DiscoveryStatistics {
  const by_source: Record<string, number> = {};
  const by_concept: Record<string, number> = {};
  const by_doc_type: Record<string, number> = {};
  let totalConfidence = 0;
  let citedFiles = 0;

  for (const file of files) {
    // Count by source
    by_source[file.source] = (by_source[file.source] || 0) + 1;

    // Count by document type
    by_doc_type[file.doc_type] = (by_doc_type[file.doc_type] || 0) + 1;

    // Count by concept
    for (const term of file.medical_terms_found) {
      by_concept[term] = (by_concept[term] || 0) + 1;
    }

    // Sum confidence
    totalConfidence += file.confidence;

    // Count cited files
    if (file.has_doi || file.has_pmid || file.has_arxiv) {
      citedFiles++;
    }
  }

  return {
    by_source,
    by_concept,
    by_doc_type,
    avg_confidence: files.length > 0 ? Math.round((totalConfidence / files.length) * 100) / 100 : 0,
    cited_files: citedFiles,
  };
}

// Export singleton instance
export const schemaValidator = new SchemaValidator();
