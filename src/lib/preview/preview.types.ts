// ============================================================================
// Preview Domain Types
// ============================================================================

/** Raw metadata extracted from a URL */
export interface ExtractedMetadata {
  // Open Graph
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  ogSiteName: string | null;
  ogLocale: string | null;

  // Twitter Card
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;

  // HTML Meta
  title: string | null;
  description: string | null;
  favicon: string | null;
  canonical: string | null;
  author: string | null;
  keywords: string[];
  themeColor: string | null;
  charset: string | null;
}

/** Processed preview data (merged from multiple sources) */
export interface PreviewData {
  url: string;
  resolvedUrl: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  domain: string;
  siteName: string | null;
  type: string | null;
  locale: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  contentType: string;
  charset: string | null;
  author: string | null;
  keywords: string[];
  themeColor: string | null;
  screenshotUrl: string | null;
}

/** Result from the preview generation pipeline */
export interface PreviewResult {
  data: PreviewData;
  cached: boolean;
  engine: "fetch" | "playwright";
  responseTime: number;
}

/** Screenshot request options */
export interface ScreenshotOptions {
  url: string;
  viewport?: {
    width: number;
    height: number;
  };
  format?: "png" | "jpeg" | "webp";
  fullPage?: boolean;
}

/** Screenshot result */
export interface ScreenshotResult {
  screenshotUrl: string;
  storagePath: string;
  viewportWidth: number;
  viewportHeight: number;
  fileSize: number;
  format: "png" | "jpeg" | "webp";
}
