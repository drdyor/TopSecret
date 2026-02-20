/**
 * Download Manager
 * 
 * Handles automatic downloading of discovered files.
 * Manages directory creation, rate limiting, and error handling.
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { DiscoveredFile, PipelineProgress } from "./types";

// ============================================================================
// DOWNLOAD MANAGER
// ============================================================================

export interface DownloadOptions {
  outputDir: string;
  rateLimitMs?: number;
  timeout?: number;
  maxConcurrent?: number;
  onProgress?: (progress: PipelineProgress) => void;
}

export interface DownloadResult {
  success: boolean;
  localPath: string | null;
  error?: string;
}

export interface DownloadSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  files: DownloadResult[];
}

export class DownloadManager {
  private outputDir: string;
  private rateLimitMs: number;
  private timeout: number;
  private maxConcurrent: number;
  private onProgress?: (progress: PipelineProgress) => void;

  constructor(options: DownloadOptions) {
    this.outputDir = options.outputDir;
    this.rateLimitMs = options.rateLimitMs ?? 2000;
    this.timeout = options.timeout ?? 60000;
    this.maxConcurrent = options.maxConcurrent ?? 3;
    this.onProgress = options.onProgress;
  }

  /**
   * Ensure output directory exists
   */
  async ensureDirectory(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Generate safe filename from URL
   */
  private generateFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let filename = pathname.split("/").pop() || "file";

      // Remove query params and sanitize
      filename = filename.split("?")[0];
      filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

      // Ensure we have an extension
      if (!filename.includes(".")) {
        filename += ".html";
      }

      return filename;
    } catch {
      return "download_" + Date.now() + ".html";
    }
  }

  /**
   * Sleep for rate limiting
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Download a single file
   */
  async downloadFile(url: string): Promise<DownloadResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "MedicalDiscoveryPipeline/1.0 (Research Bot)",
          Accept: "*/*",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          localPath: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Determine content type
      const contentType = response.headers.get("content-type") || "";
      const extension = this.getExtension(url, contentType);
      const filename = this.generateFilename(url).replace(/\.[^.]+$/, "") + extension;
      const localPath = path.join(this.outputDir, filename);

      // Get content
      const buffer = await response.arrayBuffer();
      const content = Buffer.from(buffer);

      // Write to file
      await fs.writeFile(localPath, content);

      return {
        success: true,
        localPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        localPath: null,
        error: message,
      };
    }
  }

  /**
   * Get file extension from URL and content type
   */
  private getExtension(url: string, contentType: string): string {
    // Check URL first
    const urlMatch = url.match(/\.([^./?#]+)(?:[?#]|$)/);
    if (urlMatch && urlMatch[1].length <= 5) {
      return "." + urlMatch[1];
    }

    // Check content type
    const mimeMap: Record<string, string> = {
      "application/pdf": ".pdf",
      "text/html": ".html",
      "text/plain": ".txt",
      "application/json": ".json",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    };

    for (const [mime, ext] of Object.entries(mimeMap)) {
      if (contentType.includes(mime)) {
        return ext;
      }
    }

    return ".html";
  }

  /**
   * Download multiple files with concurrency control
   */
  async downloadFiles(urls: string[]): Promise<DownloadSummary> {
    await this.ensureDirectory();

    const summary: DownloadSummary = {
      total: urls.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      files: [],
    };

    // Process in batches
    for (let i = 0; i < urls.length; i += this.maxConcurrent) {
      const batch = urls.slice(i, i + this.maxConcurrent);

      this.onProgress?.({
        phase: "download",
        message: `Downloading files (${i + 1}-${Math.min(i + this.maxConcurrent, urls.length)}/${urls.length})...`,
        progress: Math.round(((i + batch.length) / urls.length) * 100),
        filesProcessed: i + batch.length,
        filesTotal: urls.length,
        errors: [],
        startTime: new Date().toISOString(),
      });

      // Download batch in parallel
      const results = await Promise.all(
        batch.map(async (url) => {
          const result = await this.downloadFile(url);
          await this.sleep(this.rateLimitMs / this.maxConcurrent);
          return result;
        })
      );

      // Update summary
      for (const result of results) {
        if (result.success) {
          summary.successful++;
        } else {
          summary.failed++;
        }
        summary.files.push(result);
      }
    }

    return summary;
  }

  /**
   * Download discovered files (filtered to PDFs)
   */
  async downloadDiscoveredFiles(files: DiscoveredFile[]): Promise<DownloadSummary> {
    // Filter to only PDFs
    const pdfUrls = files
      .filter((f) => f.file_url.toLowerCase().endsWith(".pdf"))
      .map((f) => f.file_url);

    if (pdfUrls.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        files: [],
      };
    }

    return this.downloadFiles(pdfUrls);
  }
}

// Export factory function
export function createDownloadManager(options: DownloadOptions): DownloadManager {
  return new DownloadManager(options);
}
