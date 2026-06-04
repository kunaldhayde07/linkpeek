# Prompt 07: Metadata Extraction Engine

## Prompt Used

> Implement the core metadata extraction engine:
> 1. URL Validator with SSRF prevention (block private IPs, metadata endpoints, non-HTTP protocols, unusual ports)
> 2. URL Normalizer (lowercase, strip tracking params, sort query params, remove fragments)
> 3. Metadata Extractor using cheerio (Open Graph > Twitter Card > HTML meta priority)
> 4. Preview Service orchestrating the full pipeline: validate → cache check → fetch → extract → cache → persist
> 5. Rate Limiter (Redis sliding window, per-key daily limits, fail-open)
> 6. API routes for preview generation, listing, deletion
> 7. Server Actions for dashboard preview generation
> 8. Comprehensive tests (URL validation SSRF, normalization, extraction, rate limiting)

## Result

Full preview pipeline with 55+ test cases covering SSRF prevention, URL normalization, metadata extraction from various HTML formats, and rate limiting edge cases.
