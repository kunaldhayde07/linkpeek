import * as cheerio from "cheerio";

import { PREVIEW_LIMITS, USER_AGENT, logger } from "@/lib/utils";

import type { ExtractedMetadata } from "./preview.types";
import { validateRedirectUrl } from "./url-validator";

// ============================================================================
// Metadata Extractor
//
// Fetches a URL via HTTP and parses HTML to extract:
//   1. Open Graph tags (og:title, og:description, og:image, etc.)
//   2. Twitter Card tags (twitter:card, twitter:title, etc.)
//   3. Standard HTML meta tags (<title>, <meta name="description">, etc.)
//   4. Favicon, canonical URL, author, keywords, theme-color
//
// This is the primary extraction method. Playwright is the fallback
// when this method fails to extract sufficient metadata.
// ============================================================================

export interface FetchResult {
  html: string;
  resolvedUrl: string;
  contentType: string;
  statusCode: number;
}

/**
 * Fetch a URL and return the HTML content.
 *
 * Features:
 * - Custom User-Agent (identifies as LinkPeekBot)
 * - Follows redirects (max 5 hops, validates each hop for SSRF)
 * - Configurable timeout (default 10 seconds)
 * - Limits response body size (max 10MB)
 */
export async function fetchUrl(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PREVIEW_LIMITS.fetchTimeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Validate final URL after redirects
    const finalUrl = response.url || url;
    if (finalUrl !== url) {
      const redirectValidation = validateRedirectUrl(finalUrl, url);
      if (!redirectValidation.valid) {
        throw new Error(`Redirect blocked: ${redirectValidation.error}`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get("content-type") ?? "text/html";

    // Read body with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.byteLength;
      if (totalSize > PREVIEW_LIMITS.maxContentLength) {
        reader.cancel();
        throw new Error(`Response body exceeds ${PREVIEW_LIMITS.maxContentLength / 1024 / 1024}MB limit`);
      }

      chunks.push(value);
    }

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const html = decoder.decode(Buffer.concat(chunks));

    return {
      html,
      resolvedUrl: finalUrl,
      contentType,
      statusCode: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timed out after ${PREVIEW_LIMITS.fetchTimeout / 1000}s`);
      }
      throw error;
    }

    throw new Error("Failed to fetch URL");
  }
}

/**
 * Extract metadata from an HTML string using cheerio.
 *
 * Priority order for each field:
 *   1. Open Graph tags (most specific for link previews)
 *   2. Twitter Card tags
 *   3. Standard HTML meta tags (fallback)
 *
 * @param html - The HTML content to parse
 * @param baseUrl - The page URL (for resolving relative URLs)
 */
export function extractMetadata(html: string, baseUrl: string): ExtractedMetadata {
  const $ = cheerio.load(html);

  // ---- Open Graph ----
  const ogTitle = getMetaContent($, 'property', 'og:title');
  const ogDescription = getMetaContent($, 'property', 'og:description');
  const ogImage = resolveUrl(getMetaContent($, 'property', 'og:image'), baseUrl);
  const ogUrl = getMetaContent($, 'property', 'og:url');
  const ogType = getMetaContent($, 'property', 'og:type');
  const ogSiteName = getMetaContent($, 'property', 'og:site_name');
  const ogLocale = getMetaContent($, 'property', 'og:locale');

  // ---- Twitter Card ----
  const twitterCard = getMetaContent($, 'name', 'twitter:card')
    ?? getMetaContent($, 'property', 'twitter:card');
  const twitterTitle = getMetaContent($, 'name', 'twitter:title')
    ?? getMetaContent($, 'property', 'twitter:title');
  const twitterDescription = getMetaContent($, 'name', 'twitter:description')
    ?? getMetaContent($, 'property', 'twitter:description');
  const twitterImage = resolveUrl(
    getMetaContent($, 'name', 'twitter:image')
      ?? getMetaContent($, 'property', 'twitter:image'),
    baseUrl
  );

  // ---- Standard HTML ----
  const title = $('title').first().text().trim() || null;
  const description = getMetaContent($, 'name', 'description');

  // Favicon
  const favicon = resolveFavicon($, baseUrl);

  // Canonical URL
  const canonical = $('link[rel="canonical"]').attr('href') || null;

  // Author
  const author = getMetaContent($, 'name', 'author');

  // Keywords
  const keywordsRaw = getMetaContent($, 'name', 'keywords');
  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  // Theme color
  const themeColor = getMetaContent($, 'name', 'theme-color');

  // Charset
  const charset = $('meta[charset]').attr('charset')
    ?? getMetaContent($, 'http-equiv', 'Content-Type')?.match(/charset=([^\s;]+)/)?.[1]
    ?? null;

  return {
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    ogSiteName,
    ogLocale,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    title,
    description,
    favicon,
    canonical,
    author,
    keywords,
    themeColor,
    charset,
  };
}

/**
 * Check if the extracted metadata is "sufficient" — meaning we got
 * at least a title. If not, we trigger the Playwright fallback.
 */
export function isMetadataSufficient(metadata: ExtractedMetadata): boolean {
  // We consider metadata sufficient if we have at least one form of title
  return !!(metadata.ogTitle || metadata.title || metadata.twitterTitle);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the content attribute of a meta tag by its name/property attribute.
 */
function getMetaContent(
  $: cheerio.CheerioAPI,
  attr: string,
  value: string
): string | null {
  const content = $(`meta[${attr}="${value}"]`).attr('content');
  if (!content) return null;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve a potentially relative URL to an absolute URL.
 */
function resolveUrl(url: string | null, baseUrl: string): string | null {
  if (!url) return null;

  try {
    // If it's already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it starts with //, add protocol
    if (url.startsWith('//')) {
      const base = new URL(baseUrl);
      return `${base.protocol}${url}`;
    }

    // Resolve relative URL against base
    const resolved = new URL(url, baseUrl);
    return resolved.toString();
  } catch {
    return null;
  }
}

/**
 * Extract the favicon URL from HTML.
 * Checks multiple common favicon link elements.
 */
function resolveFavicon($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // Priority order for favicon detection
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ];

  for (const selector of selectors) {
    const href = $(selector).first().attr('href');
    if (href) {
      return resolveUrl(href, baseUrl);
    }
  }

  // Default: try /favicon.ico at the root
  try {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}/favicon.ico`;
  } catch {
    return null;
  }
}
