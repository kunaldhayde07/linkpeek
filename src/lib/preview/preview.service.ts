import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";
import { CACHE_TTL, logger } from "@/lib/utils";

import { fetchUrl, extractMetadata, isMetadataSufficient } from "./metadata-extractor";
import { extractWithPlaywright } from "./playwright-engine";
import type { PreviewData, PreviewResult } from "./preview.types";
import { extractDomain, hashUrl } from "./url-normalizer";
import { validateUrl } from "./url-validator";

// ============================================================================
// Preview Service
//
// Orchestrates the full preview generation pipeline:
//   1. Validate URL (SSRF prevention)
//   2. Check Redis cache
//   3. Fetch URL via HTTP
//   4. Extract metadata from HTML
//   5. (If insufficient) Trigger Playwright fallback
//   6. Construct PreviewData
//   7. Cache result in Redis
//   8. Persist to PostgreSQL
//   9. Return response
//
// This service is used by both the API route and the dashboard Server Action.
// ============================================================================

/** Redis cache key for a preview */
function previewCacheKey(urlHash: string): string {
  return `preview:${urlHash}`;
}

/**
 * Generate a link preview for a URL.
 *
 * @param url - The URL to preview
 * @param userId - The authenticated user's ID
 * @param options - Options like refresh (bypass cache)
 * @returns PreviewResult with data, cache status, and timing
 */
export async function generatePreview(
  url: string,
  userId: string,
  options: { refresh?: boolean } = {}
): Promise<PreviewResult> {
  const startTime = performance.now();

  // Step 1: Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid URL");
  }

  // Step 2: Generate URL hash for cache lookup
  const urlHash = hashUrl(url);
  const cacheKey = previewCacheKey(urlHash);

  // Step 3: Check cache (unless refresh is requested)
  if (!options.refresh) {
    const cached = await cacheGet<PreviewData>(cacheKey);
    if (cached) {
      const responseTime = Math.round(performance.now() - startTime);
      logger.debug("Preview served from cache", { url, responseTime });

      return {
        data: cached,
        cached: true,
        engine: (cached as PreviewData & { _engine?: string })._engine === "playwright"
          ? "playwright"
          : "fetch",
        responseTime,
      };
    }
  }

  // Step 4: Fetch the URL
  let previewData: PreviewData;
  let engine: "fetch" | "playwright" = "fetch";

  try {
    const fetchResult = await fetchUrl(url);
    const metadata = extractMetadata(fetchResult.html, fetchResult.resolvedUrl);

    // Step 5: Check if metadata is sufficient
    let finalMetadata = metadata;

    if (!isMetadataSufficient(metadata)) {
      logger.info("Metadata insufficient, triggering Playwright fallback", { url });

      try {
        const playwrightMetadata = await extractWithPlaywright(url);
        finalMetadata = playwrightMetadata;
        engine = "playwright";
      } catch (pwError) {
        // Playwright failed — use whatever we got from basic fetch
        logger.warn("Playwright fallback failed, using partial metadata", {
          url,
          error: pwError instanceof Error ? pwError.message : "Unknown",
        });
      }
    }

    // Step 6: Construct PreviewData (merge OG > Twitter > HTML)
    const domain = extractDomain(fetchResult.resolvedUrl);

    previewData = {
      url,
      resolvedUrl: fetchResult.resolvedUrl,
      title: finalMetadata.ogTitle ?? finalMetadata.twitterTitle ?? finalMetadata.title,
      description: finalMetadata.ogDescription ?? finalMetadata.twitterDescription ?? finalMetadata.description,
      image: finalMetadata.ogImage ?? finalMetadata.twitterImage,
      favicon: finalMetadata.favicon,
      domain,
      siteName: finalMetadata.ogSiteName,
      type: finalMetadata.ogType,
      locale: finalMetadata.ogLocale,
      twitterCard: finalMetadata.twitterCard,
      twitterTitle: finalMetadata.twitterTitle,
      twitterDescription: finalMetadata.twitterDescription,
      twitterImage: finalMetadata.twitterImage,
      contentType: fetchResult.contentType,
      charset: finalMetadata.charset,
      author: finalMetadata.author,
      keywords: finalMetadata.keywords,
      themeColor: finalMetadata.themeColor,
      screenshotUrl: null,
    };
  } catch (error) {
    logger.error("Preview fetch failed", {
      url,
      error: error instanceof Error ? error.message : "Unknown",
    });
    throw error;
  }

  const responseTime = Math.round(performance.now() - startTime);

  // Step 7: Cache the result in Redis
  await cacheSet(cacheKey, previewData, CACHE_TTL.preview);

  // Step 8: Persist to PostgreSQL
  try {
    await prisma.preview.create({
      data: {
        userId,
        url,
        urlHash,
        resolvedUrl: previewData.resolvedUrl,
        domain: previewData.domain,
        title: previewData.title,
        description: previewData.description,
        image: previewData.image,
        favicon: previewData.favicon,
        siteName: previewData.siteName,
        type: previewData.type,
        locale: previewData.locale,
        twitterCard: previewData.twitterCard,
        twitterTitle: previewData.twitterTitle,
        twitterDescription: previewData.twitterDescription,
        twitterImage: previewData.twitterImage,
        contentType: previewData.contentType,
        charset: previewData.charset,
        author: previewData.author,
        keywords: previewData.keywords,
        themeColor: previewData.themeColor,
        engine,
        responseTime,
      },
    });
  } catch (error) {
    // Non-critical: preview was already cached in Redis and will be returned
    logger.warn("Failed to persist preview to database", {
      url,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }

  logger.info("Preview generated", {
    url,
    engine,
    responseTime,
    cached: false,
    hasTitle: !!previewData.title,
    hasImage: !!previewData.image,
  });

  return {
    data: previewData,
    cached: false,
    engine,
    responseTime,
  };
}

/**
 * Get a preview by its ID (for the detail view).
 */
export async function getPreviewById(
  previewId: string,
  userId: string
): Promise<PreviewData | null> {
  const preview = await prisma.preview.findFirst({
    where: { id: previewId, userId },
  });

  if (!preview) return null;

  return {
    url: preview.url,
    resolvedUrl: preview.resolvedUrl ?? preview.url,
    title: preview.title,
    description: preview.description,
    image: preview.image,
    favicon: preview.favicon,
    domain: preview.domain,
    siteName: preview.siteName,
    type: preview.type,
    locale: preview.locale,
    twitterCard: preview.twitterCard,
    twitterTitle: preview.twitterTitle,
    twitterDescription: preview.twitterDescription,
    twitterImage: preview.twitterImage,
    contentType: preview.contentType ?? "text/html",
    charset: preview.charset,
    author: preview.author,
    keywords: preview.keywords,
    themeColor: preview.themeColor,
    screenshotUrl: null,
  };
}

/**
 * List previews for a user (paginated, for history page).
 */
export async function listPreviews(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters?: { domain?: string; tagId?: string }
) {
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (filters?.domain) {
    where["domain"] = filters.domain;
  }

  if (filters?.tagId) {
    where["tags"] = {
      some: { tagId: filters.tagId },
    };
  }

  const [previews, total] = await Promise.all([
    prisma.preview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    }),
    prisma.preview.count({ where }),
  ]);

  return {
    items: previews.map((p) => ({
      id: p.id,
      url: p.url,
      domain: p.domain,
      title: p.title,
      description: p.description,
      image: p.image,
      favicon: p.favicon,
      engine: p.engine,
      responseTime: p.responseTime,
      tags: p.tags.map((t) => t.tag),
      createdAt: p.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Delete a preview by ID.
 */
export async function deletePreview(previewId: string, userId: string): Promise<boolean> {
  const result = await prisma.preview.deleteMany({
    where: { id: previewId, userId },
  });

  if (result.count > 0) {
    logger.info("Preview deleted", { previewId, userId });
    return true;
  }

  return false;
}
