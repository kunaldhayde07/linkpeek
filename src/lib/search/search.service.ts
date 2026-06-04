import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

import type { SearchResult, SearchResponse } from "./search.types";

// ============================================================================
// Search Service
//
// PostgreSQL full-text search using tsvector/tsquery.
// The search_vector column is maintained by a database trigger.
// We use Prisma.$queryRaw for search since Prisma doesn't natively
// support tsvector operations.
// ============================================================================

/**
 * Search previews using PostgreSQL full-text search.
 *
 * @param userId - Scope search to this user's previews
 * @param query - Search query string
 * @param page - Page number (1-indexed)
 * @param limit - Results per page
 * @returns SearchResponse with ranked, highlighted results
 */
export async function searchPreviews(
  userId: string,
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  const offset = (page - 1) * limit;

  // Sanitize the query for tsquery
  const sanitizedQuery = sanitizeSearchQuery(query);

  if (!sanitizedQuery) {
    return { results: [], total: 0, page, totalPages: 0, query };
  }

  try {
    // Execute full-text search with ranking and highlighting
    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string | null;
        description: string | null;
        url: string;
        domain: string;
        image: string | null;
        favicon: string | null;
        created_at: Date;
        rank: number;
        title_highlight: string;
        description_highlight: string;
      }>
    >`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.url,
        p.domain,
        p.image,
        p.favicon,
        p.created_at,
        ts_rank(p.search_vector, plainto_tsquery('english', ${sanitizedQuery})) AS rank,
        ts_headline(
          'english',
          COALESCE(p.title, ''),
          plainto_tsquery('english', ${sanitizedQuery}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20, MaxFragments=1'
        ) AS title_highlight,
        ts_headline(
          'english',
          COALESCE(p.description, ''),
          plainto_tsquery('english', ${sanitizedQuery}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=80, MinWords=30, MaxFragments=2'
        ) AS description_highlight
      FROM previews p
      WHERE p.user_id = ${userId}::uuid
        AND p.search_vector @@ plainto_tsquery('english', ${sanitizedQuery})
      ORDER BY rank DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const [countResult] = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as count
      FROM previews p
      WHERE p.user_id = ${userId}::uuid
        AND p.search_vector @@ plainto_tsquery('english', ${sanitizedQuery})
    `;

    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return {
      results: results.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        url: r.url,
        domain: r.domain,
        image: r.image,
        favicon: r.favicon,
        createdAt: r.created_at,
        rank: r.rank,
        titleHighlight: r.title_highlight,
        descriptionHighlight: r.description_highlight,
      })),
      total,
      page,
      totalPages,
      query,
    };
  } catch (error) {
    logger.error("Search failed", {
      userId,
      query: sanitizedQuery,
      error: error instanceof Error ? error.message : "Unknown",
    });

    return { results: [], total: 0, page, totalPages: 0, query };
  }
}

/**
 * Sanitize a search query for safe use in tsquery.
 * Removes special characters that could break the query.
 */
function sanitizeSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(/[^\w\s\-]/g, "") // Remove special chars except hyphens
    .replace(/\s+/g, " ") // Normalize whitespace
    .substring(0, 200); // Limit length
}
