# Prompt 14: Testing

## Prompt Used

> Generate comprehensive tests:
> 1. Unit tests for API key hashing (12 tests)
> 2. Unit tests for URL validator/SSRF prevention (18 tests)
> 3. Unit tests for URL normalizer (14 tests)
> 4. Unit tests for metadata extractor (15 tests)
> 5. Unit tests for rate limiter (8 tests)
> 6. Unit tests for cache service (10 tests)
> 7. Unit tests for crypto utilities (8 tests)
> 8. Integration test for health check endpoint
> 9. Unit test for preview service (5 tests)
>
> Cover: happy paths, error cases, edge cases, security boundaries, fail-open behavior.

## Result

8 test files with 90+ test cases covering all critical business logic, security boundaries (SSRF), caching resilience, and rate limiting.
