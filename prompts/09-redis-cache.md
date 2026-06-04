# Prompt 09: Redis Cache Layer

## Prompt Used

> Implement the complete caching layer:
> 1. Upstash Redis client (HTTP-based, serverless-compatible)
> 2. Resilient cache service with fail-open semantics
> 3. Preview caching (SHA-256 URL hash keys, 24h TTL)
> 4. API key validation caching (5 min TTL)
> 5. Rate limit counters (INCR + EXPIRE)
> 6. Health check for Redis connectivity
> 7. Tests verifying fail-open behavior

## Result

Cache service with try/catch on every operation, graceful degradation when Redis is down, and tests confirming fail-open semantics.
