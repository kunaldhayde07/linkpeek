# Prompt 11: Full-Text Search

## Prompt Used

> Implement full-text search using PostgreSQL tsvector:
> 1. Search service with plainto_tsquery and ts_rank
> 2. Result highlighting with ts_headline
> 3. Weighted search (title:A > description:B > domain:C > url:D)
> 4. Query sanitization for tsquery safety
> 5. Paginated results
> 6. Search page with URL-param-based queries
> 7. API route for programmatic search

## Result

Search service using Prisma.$queryRaw with PostgreSQL FTS, sanitized queries, highlighted results, and a search page with form submission via URL params.
