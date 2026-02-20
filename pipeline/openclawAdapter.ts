/**
 * OpenClaw Adapter Layer
 * 
 * Wraps OpenClaw crawler for medical document discovery.
 * Handles source configuration, rate limiting, and content extraction.
 */

import type { SourceConfig, DiscoveredFile, PipelineProgress } from "./types";
import { medicalDetector } from "./medicalDetector";

// ============================================================================
// DEFAULT SOURCE CONFIGURATIONS
// ============================================================================

export const DEFAULT_SOURCES: SourceConfig[] = [
  {
    name: "Epstein Emails",
    baseUrl: "https://jmail.world",
    endpoints: ["/emails", "/emails?page=2", "/emails?search=medical", "/emails?search=health"],
    selectors: {
      email_list: ".email-item",
      subject: ".subject",
      sender: ".from",
      date: ".date",
      body: ".body-preview",
    },
    pagination: {
      type: "url_param",
      param: "page",
      maxPages: 100,
    },
    keywords: ["medical", "health", "research", "treatment", "therapy"],
    minConfidence: 0.75,
    extractPdfLinks: true,
    followInternalLinks: false,
  },
  {
    name: "Epstein Encyclopedia",
    baseUrl: "https://jmail.world/wiki",
    endpoints: ["/wiki", "/wiki/index", "/wiki?category=medical"],
    selectors: {
      article_list: ".wiki-article",
      title: "h2",
      content: ".article-content",
      links: "a[href]",
    },
    pagination: {
      type: "next_button",
      selector: "a.next",
    },
    keywords: ["medical", "health", "research", "treatment"],
    minConfidence: 0.80,
    extractPdfLinks: true,
    followInternalLinks: true,
  },
  {
    name: "Epstein File Explorer",
    baseUrl: "https://epstein-file-explorer.com",
    endpoints: ["/search", "/documents", "/documents?type=medical"],
    selectors: {
      document_list: ".document-item",
      title: ".doc-title",
      metadata: ".doc-meta",
      content: ".doc-preview",
      download_link: "a.download",
    },
    pagination: {
      type: "infinite_scroll",
      selector: "button.load-more",
    },
    keywords: ["medical", "health", "research", "treatment", "therapy"],
    minConfidence: 0.75,
    extractPdfLinks: true,
    followInternalLinks: false,
  },
  {
    name: "Epstein Google Drive",
    baseUrl: "https://jmail.world/drive",
    endpoints: ["/drive", "/drive?folder=medical", "/drive?folder=research"],
    selectors: {
      file_list: ".file-item",
      filename: ".filename",
      size: ".filesize",
      date: ".modified-date",
      preview: ".preview-text",
    },
    pagination: {
      type: "infinite_scroll",
      selector: ".load-more",
    },
    keywords: ["medical", "health", "research", "treatment"],
    minConfidence: 0.80,
    extractPdfLinks: true,
    followInternalLinks: false,
  },
];

// ============================================================================
// CRAWLER ADAPTER
// ============================================================================

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  pdfLinks: string[];
  metadata: Record<string, string>;
}

export class OpenClawAdapter {
  private sources: SourceConfig[];
  private rateLimitMs: number;
  private timeout: number;
  private respectRobotsTxt: boolean;
  private onProgress?: (progress: PipelineProgress) => void;
  
  // Robots.txt rules per domain
  private robotsRules: Map<string, {
    crawlDelay: number;
    disallowed: string[];
    allowed: string[];
  }> = new Map();

  constructor(config: {
    sources?: SourceConfig[];
    rateLimitMs?: number;
    timeout?: number;
    respectRobotsTxt?: boolean;
    onProgress?: (progress: PipelineProgress) => void;
  }) {
    this.sources = config.sources ?? DEFAULT_SOURCES;
    // Default to 10 seconds to respect jmail.world's Crawl-delay: 10
    this.rateLimitMs = config.rateLimitMs ?? 10000;
    this.timeout = config.timeout ?? 30000;
    this.respectRobotsTxt = config.respectRobotsTxt ?? true;
    this.onProgress = config.onProgress;
    
    // Initialize known robots.txt rules
    this.initializeRobotsRules();
  }
  
  /**
   * Initialize known robots.txt rules for domains we crawl
   */
  private initializeRobotsRules(): void {
    // jmail.world robots.txt rules
    this.robotsRules.set('jmail.world', {
      crawlDelay: 10000, // 10 seconds
      disallowed: ['/person/', '/person', '/api/'],
      allowed: ['/'],
    });
    
    // Default rules for other domains
    this.robotsRules.set('default', {
      crawlDelay: 1000, // 1 second default
      disallowed: [],
      allowed: ['/'],
    });
  }
  
  /**
   * Check if a URL is allowed by robots.txt rules
   */
  private isUrlAllowed(url: string): boolean {
    if (!this.respectRobotsTxt) return true;
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      
      const rules = this.robotsRules.get(domain) || this.robotsRules.get('default')!;
      
      // Check if path is disallowed
      for (const disallowed of rules.disallowed) {
        if (path.startsWith(disallowed)) {
          console.log(`[OpenClaw] Blocked by robots.txt: ${url} (matches ${disallowed})`);
          return false;
        }
      }
      
      return true;
    } catch {
      return true;
    }
  }
  
  /**
   * Get the crawl delay for a domain
   */
  private getCrawlDelay(url: string): number {
    try {
      const domain = new URL(url).hostname;
      const rules = this.robotsRules.get(domain);
      if (rules) {
        return Math.max(this.rateLimitMs, rules.crawlDelay);
      }
    } catch {}
    return this.rateLimitMs;
  }

  /**
   * Sleep for rate limiting
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch a URL with timeout and error handling
   */
  private async fetchUrl(url: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "MedicalDiscoveryPipeline/1.0 (Research Bot)",
          Accept: "text/html,application/xhtml+xml,text/plain",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[OpenClaw] Failed to fetch ${url}: ${response.status}`);
        return null;
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn(`[OpenClaw] Timeout fetching ${url}`);
      } else {
        console.error(`[OpenClaw] Error fetching ${url}:`, error);
      }
      return null;
    }
  }

  /**
   * Extract links from HTML content
   */
  private extractLinks(html: string, baseUrl: string): { links: string[]; pdfLinks: string[] } {
    const links: string[] = [];
    const pdfLinks: string[] = [];

    // Simple regex-based link extraction (works without DOM parser)
    const hrefPattern = /href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefPattern.exec(html)) !== null) {
      const href = match[1];

      // Resolve relative URLs
      let fullUrl: string;
      try {
        fullUrl = new URL(href, baseUrl).href;
      } catch {
        continue;
      }

      // Categorize links
      if (fullUrl.toLowerCase().endsWith(".pdf")) {
        pdfLinks.push(fullUrl);
      } else if (fullUrl.startsWith("http")) {
        links.push(fullUrl);
      }
    }

    return { links: [...new Set(links)], pdfLinks: [...new Set(pdfLinks)] };
  }

  /**
   * Extract text content from HTML (simple strip tags approach)
   */
  private extractText(html: string): string {
    // Remove script and style tags with content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, " ");

    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Normalize whitespace
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : "Untitled";
  }

  /**
   * Crawl a single URL
   */
  async crawlUrl(url: string, sourceConfig: SourceConfig): Promise<CrawlResult | null> {
    const html = await this.fetchUrl(url);
    if (!html) return null;

    const title = this.extractTitle(html);
    const content = this.extractText(html);
    const { links, pdfLinks } = this.extractLinks(html, sourceConfig.baseUrl);

    return {
      url,
      title,
      content,
      links,
      pdfLinks,
      metadata: {
        source: sourceConfig.name,
        crawledAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Process a crawl result and create discovered files
   */
  private processCrawlResult(
    result: CrawlResult,
    sourceConfig: SourceConfig
  ): DiscoveredFile[] {
    const discovered: DiscoveredFile[] = [];

    // Analyze the main page content
    const analysis = medicalDetector.analyze(result.content);

    // Skip if noise or below confidence threshold
    if (analysis.isNoise || analysis.confidence < sourceConfig.minConfidence) {
      return discovered;
    }

    // Create record for the page itself if it has medical content
    if (analysis.medicalTerms.length > 0) {
      discovered.push({
        file_url: result.url,
        source: sourceConfig.name,
        title: result.title,
        medical_terms_found: analysis.medicalTerms,
        concept_hits: analysis.conceptHits,
        confidence: analysis.confidence,
        snippet: result.content.substring(0, 500),
        has_doi: analysis.citations.has_doi,
        has_pmid: analysis.citations.has_pmid,
        has_arxiv: analysis.citations.has_arxiv,
        doc_type: analysis.docType,
        dates: analysis.dates,
        timestamp: new Date().toISOString(),
      });
    }

    // Process PDF links
    if (sourceConfig.extractPdfLinks && result.pdfLinks.length > 0) {
      for (const pdfUrl of result.pdfLinks) {
        // For PDFs, we only have the URL and filename to analyze
        const filename = pdfUrl.split("/").pop() || "";
        const pdfAnalysis = medicalDetector.analyze(filename + " " + result.title);

        if (pdfAnalysis.medicalTerms.length > 0 && pdfAnalysis.confidence >= sourceConfig.minConfidence) {
          discovered.push({
            file_url: pdfUrl,
            source: sourceConfig.name,
            title: filename,
            medical_terms_found: pdfAnalysis.medicalTerms,
            concept_hits: pdfAnalysis.conceptHits,
            confidence: pdfAnalysis.confidence,
            snippet: `PDF from: ${result.title}`,
            has_doi: false,
            has_pmid: false,
            has_arxiv: false,
            doc_type: "UNKNOWN",
            dates: [],
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return discovered;
  }

  /**
   * Crawl all configured sources
   */
  async crawlAll(): Promise<DiscoveredFile[]> {
    const allDiscovered: DiscoveredFile[] = [];
    let totalProcessed = 0;
    let totalUrls = 0;

    // Estimate total URLs for progress
    for (const source of this.sources) {
      totalUrls += source.endpoints.length * (source.pagination?.maxPages || 1);
    }

    for (const source of this.sources) {
      this.onProgress?.({
        phase: "crawl",
        message: `Crawling ${source.name}...`,
        progress: 10,
        filesProcessed: totalProcessed,
        filesTotal: totalUrls,
        errors: [],
        startTime: new Date().toISOString(),
        currentSource: source.name,
      });

      for (const endpoint of source.endpoints) {
        const url = source.baseUrl + endpoint;

        // Check robots.txt rules
        if (!this.isUrlAllowed(url)) {
          console.log(`[OpenClaw] Skipping ${url} - blocked by robots.txt`);
          continue;
        }

        // Rate limiting with domain-specific delay
        const crawlDelay = this.getCrawlDelay(url);
        await this.sleep(crawlDelay);

        const result = await this.crawlUrl(url, source);
        if (result) {
          const discovered = this.processCrawlResult(result, source);
          allDiscovered.push(...discovered);
        }

        totalProcessed++;

        this.onProgress?.({
          phase: "crawl",
          message: `Crawling ${source.name}...`,
          progress: Math.round((totalProcessed / totalUrls) * 100),
          filesProcessed: totalProcessed,
          filesTotal: totalUrls,
          errors: [],
          startTime: new Date().toISOString(),
          currentSource: source.name,
        });
      }
    }

    return allDiscovered;
  }

  /**
   * Get list of PDF URLs from discovered files
   */
  getPdfUrls(discovered: DiscoveredFile[]): string[] {
    return discovered
      .filter((f) => f.file_url.toLowerCase().endsWith(".pdf"))
      .map((f) => f.file_url);
  }
}

// Export factory function
export function createCrawler(config?: {
  sources?: SourceConfig[];
  rateLimitMs?: number;
  timeout?: number;
  respectRobotsTxt?: boolean;
  onProgress?: (progress: PipelineProgress) => void;
}): OpenClawAdapter {
  return new OpenClawAdapter(config || {});
}
