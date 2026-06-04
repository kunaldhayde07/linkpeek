# Prompt 08: Playwright Fallback Engine

## Prompt Used

> Implement the Playwright fallback engine for JavaScript-rendered pages:
> 1. Headless Chromium with semaphore (max 3 concurrent instances)
> 2. Resource blocking (images, fonts, stylesheets) for faster rendering
> 3. DOM-based metadata extraction using page.evaluate()
> 4. Screenshot capture with configurable viewport
> 5. Screenshot service with Supabase Storage upload
> 6. API route for screenshot generation
> 7. Integration with preview service (automatic fallback when basic fetch insufficient)

## Result

Playwright engine with semaphore pattern, screenshot service with storage upload, API route, and updated preview service with automatic fallback trigger.
