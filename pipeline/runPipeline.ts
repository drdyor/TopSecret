/**
 * Medical Discovery Pipeline
 * 
 * Single-command automated system for discovering and extracting
 * medically relevant content from mirror sites.
 * 
 * Usage:
 *   npx ts-node pipeline/runPipeline.ts
 *   node pipeline/runPipeline.js
 */

import * as fs from "fs/promises";
import * as path from "path";
import { createCrawler } from "./openclawAdapter";
import { createDownloadManager } from "./downloadManager";
import { schemaValidator, computeStatistics } from "./validator";
import {
  type PipelineConfig,
  type PipelineProgress,
  type PipelineResult,
  type DiscoveryResult,
  type DiscoveredFile,
  DEFAULT_SOURCES,
} from "./types";

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_OUTPUT_DIR = "./output/discovery";
const DEFAULT_DOWNLOAD_DIR = "./output/downloads";
const DEFAULT_SNAPSHOT_DIR = "./output/snapshots";
const PIPELINE_VERSION = "1.0.0";

const DEFAULT_CONFIG: PipelineConfig = {
  sources: DEFAULT_SOURCES,
  minConfidence: 0.75,
  maxFiles: 1000,
  outputDir: DEFAULT_OUTPUT_DIR,
  downloadDir: DEFAULT_DOWNLOAD_DIR,
  snapshotDir: DEFAULT_SNAPSHOT_DIR,
  respectRobotsTxt: true,
  rateLimitMs: 1000,
  timeout: 30000,
};

// ============================================================================
// PIPELINE ORCHESTRATOR
// ============================================================================

export class MedicalDiscoveryPipeline {
  private config: PipelineConfig;
  private progress: PipelineProgress;
  private errors: string[];
  private startTime: Date;

  constructor(config?: Partial<PipelineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = new Date();
    this.errors = [];
    this.progress = {
      phase: "init",
      message: "Initializing pipeline...",
      progress: 0,
      filesProcessed: 0,
      filesTotal: 0,
      errors: [],
      startTime: this.startTime.toISOString(),
    };
  }

  /**
   * Emit progress event
   */
  private emitProgress(progress: Partial<PipelineProgress>): void {
    this.progress = { ...this.progress, ...progress };
    console.log(`[Pipeline] ${this.progress.phase.toUpperCase()}: ${this.progress.message}`);
  }

  /**
   * Ensure output directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(this.config.downloadDir, { recursive: true });
    await fs.mkdir(this.config.snapshotDir, { recursive: true });
  }

  /**
   * Run the complete pipeline
   */
  async run(): Promise<PipelineResult> {
    try {
      console.log("=".repeat(60));
      console.log("Medical Discovery Pipeline v" + PIPELINE_VERSION);
      console.log("=".repeat(60));

      // Initialize
      this.emitProgress({ phase: "init", message: "Initializing pipeline...", progress: 5 });
      await this.ensureDirectories();

      // Phase 1: Crawl
      this.emitProgress({ phase: "crawl", message: "Starting crawl...", progress: 10 });
      const discovered = await this.crawl();

      if (discovered.length === 0) {
        return this.complete({
          success: true,
          discoveryResult: this.createEmptyResult(),
          downloadedFiles: [],
          validationErrors: ["No files discovered"],
          snapshotPath: null,
          executionTimeMs: Date.now() - this.startTime.getTime(),
        });
      }

      // Phase 2: Filter
      this.emitProgress({ phase: "filter", message: "Filtering results...", progress: 40 });
      const filtered = this.filterResults(discovered);

      // Phase 3: Download (optional)
      this.emitProgress({ phase: "download", message: "Downloading files...", progress: 50 });
      const downloadedFiles = await this.download(filtered);

      // Phase 4: Extract (for downloaded files - would extract text, entities, etc.)
      this.emitProgress({ phase: "extract", message: "Extracting content...", progress: 70 });
      const extracted = await this.extractContent(filtered);

      // Phase 5: Validate
      this.emitProgress({ phase: "validate", message: "Validating results...", progress: 80 });
      const validationErrors = this.validate(extracted);

      // Phase 6: Snapshot
      this.emitProgress({ phase: "snapshot", message: "Saving snapshot...", progress: 90 });
      const snapshotPath = await this.saveSnapshot(extracted);

      // Complete
      return this.complete({
        success: true,
        discoveryResult: this.createResult(extracted),
        downloadedFiles: downloadedFiles,
        validationErrors,
        snapshotPath,
        executionTimeMs: Date.now() - this.startTime.getTime(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.errors.push(message);
      console.error("[Pipeline] Error:", message);

      return {
        success: false,
        discoveryResult: null,
        downloadedFiles: [],
        validationErrors: this.errors,
        snapshotPath: null,
        executionTimeMs: Date.now() - this.startTime.getTime(),
        error: message,
      };
    }
  }

  /**
   * Phase 1: Crawl sources using OpenClaw adapter
   */
  private async crawl(): Promise<DiscoveredFile[]> {
    const crawler = createCrawler({
      sources: this.config.sources,
      rateLimitMs: this.config.rateLimitMs,
      timeout: this.config.timeout,
      respectRobotsTxt: this.config.respectRobotsTxt,
      onProgress: (p) => this.emitProgress(p),
    });

    return crawler.crawlAll();
  }

  /**
   * Phase 2: Filter results based on confidence and other criteria
   */
  private filterResults(files: DiscoveredFile[]): DiscoveredFile[] {
    return files
      .filter((f) => f.confidence >= this.config.minConfidence)
      .filter((f) => f.medical_terms_found.length > 0)
      .slice(0, this.config.maxFiles);
  }

  /**
   * Phase 3: Download discovered files
   */
  private async download(files: DiscoveredFile[]): Promise<string[]> {
    const downloader = createDownloadManager({
      outputDir: this.config.downloadDir,
      rateLimitMs: 2000,
      timeout: 60000,
      onProgress: (p) => this.emitProgress(p),
    });

    const pdfUrls = files
      .filter((f) => f.file_url.toLowerCase().endsWith(".pdf"))
      .map((f) => f.file_url);

    if (pdfUrls.length === 0) {
      return [];
    }

    const summary = await downloader.downloadFiles(pdfUrls);
    return summary.files
      .filter((f) => f.success && f.localPath)
      .map((f) => f.localPath as string);
  }

  /**
   * Phase 4: Extract content from downloaded files
   * (Placeholder - would integrate with existing document parsing)
   */
  private async extractContent(files: DiscoveredFile[]): Promise<DiscoveredFile[]> {
    // In a full implementation, this would:
    // 1. Parse PDF/DOC/TXT files
    // 2. Extract structured data
    // 3. Enrich with additional metadata
    // For now, we just return the discovered files with their metadata
    return files;
  }

  /**
   * Phase 5: Validate results
   */
  private validate(files: DiscoveredFile[]): string[] {
    const errors: string[] = [];

    for (const file of files) {
      const validation = schemaValidator.validateFile(file);
      if (!validation.valid) {
        errors.push(...validation.errors.map((e) => `${e.path}: ${e.message}`));
      }
    }

    return errors;
  }

  /**
   * Phase 6: Save snapshot to disk
   */
  private async saveSnapshot(files: DiscoveredFile[]): Promise<string | null> {
    const result = this.createResult(files);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `discovery_${timestamp}.json`;
    const filepath = path.join(this.config.snapshotDir, filename);

    await fs.writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");
    return filepath;
  }

  /**
   * Create discovery result object
   */
  private createResult(files: DiscoveredFile[]): DiscoveryResult {
    const sources = [...new Set(files.map((f) => f.source))];

    return {
      version: PIPELINE_VERSION,
      timestamp: new Date().toISOString(),
      model_version: "medical-detector-v1",
      sources_scanned: sources,
      total_files_found: files.length,
      files,
      statistics: computeStatistics(files),
    };
  }

  /**
   * Create empty result for no files found
   */
  private createEmptyResult(): DiscoveryResult {
    return {
      version: PIPELINE_VERSION,
      timestamp: new Date().toISOString(),
      model_version: "medical-detector-v1",
      sources_scanned: [],
      total_files_found: 0,
      files: [],
      statistics: {
        by_source: {},
        by_concept: {},
        by_doc_type: {},
        avg_confidence: 0,
        cited_files: 0,
      },
    };
  }

  /**
   * Complete the pipeline
   */
  private complete(result: PipelineResult): PipelineResult {
    const timeSec = Math.round(result.executionTimeMs / 1000);
    console.log("=".repeat(60));
    console.log(`Pipeline completed in ${timeSec}s`);
    console.log(`Files discovered: ${result.discoveryResult?.total_files_found || 0}`);
    console.log(`Files downloaded: ${result.downloadedFiles.length}`);
    console.log(`Snapshot saved: ${result.snapshotPath || "none"}`);

    if (result.validationErrors.length > 0) {
      console.log(`Validation errors: ${result.validationErrors.length}`);
    }

    this.emitProgress({ phase: "complete", message: "Pipeline complete!", progress: 100 });
    console.log("=".repeat(60));

    return result;
  }

  /**
   * Get current progress
   */
  getProgress(): PipelineProgress {
    return this.progress;
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  const pipeline = new MedicalDiscoveryPipeline();
  const result = await pipeline.run();

  if (!result.success) {
    process.exit(1);
  }

  // Output result path for automation
  if (result.snapshotPath) {
    console.log("\n📁 Result saved to:", result.snapshotPath);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runPipeline };
