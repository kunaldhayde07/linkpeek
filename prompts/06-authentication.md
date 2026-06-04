# Prompt 06: Authentication

## Prompt Used

> Implement complete authentication for LinkPeek:
> 1. Supabase Auth integration (email/password + GitHub/Google OAuth)
> 2. API Key system (SHA-256 hashing, shown once, prefix for display)
> 3. Auth middleware for API routes (Bearer token validation)
> 4. Server Actions for login, signup, OAuth, password reset, sign out
> 5. Auth pages (login, signup, forgot password, verify email, OAuth callback)
> 6. Session management with middleware (redirect unauthenticated)
> 7. Unit tests for API key hashing and validation

## Result

25 files: auth service, API key service with Redis caching, middleware, server actions, 5 auth pages, 4 auth components, API routes for key CRUD, 12 unit tests.
