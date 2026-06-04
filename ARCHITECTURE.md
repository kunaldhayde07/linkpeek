# Architecture — LinkPeek

## Overview

LinkPeek is a **Modular Monolith** deployed as a Next.js 15 application on Vercel. This document describes the high-level architecture and key decisions.

## System Diagram

```
Clients (Browser / API)
        │
    Vercel Edge (CDN + SSL + DDoS)
        │
    Next.js Application
    ├── React SSR (Dashboard)
    ├── API Routes (/api/v1/*)
    └── Server Actions (Mutations)
        │
    ┌───┼───────────┐
    │   │           │
    ▼   ▼           ▼
Supabase  Upstash   Target URLs
(Postgres  (Redis)   (HTTP Fetch +
 + Auth    Cache/    Playwright)
 + Storage) RateLimit
```

## Architecture Layers

1. **Presentation** — React components (Server + Client), pages, layouts
2. **Application** — API routes, Server Actions, middleware, DTOs
3. **Domain** — Business logic services (10 services), validation schemas
4. **Infrastructure** — Database (Prisma), Cache (Redis), Storage (Supabase), External HTTP

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Modular Monolith | Right-sized for solo dev, easy to split later |
| Framework | Next.js 15 App Router | Server Components, SSR, API routes in one framework |
| Database | PostgreSQL (Supabase) | ACID, full-text search, managed + free tier |
| Cache | Redis (Upstash) | HTTP-based, serverless-compatible, free tier |
| Auth | Supabase Auth | Managed auth with JWT, OAuth, email verification |
| ORM | Prisma | Type-safe queries, migration management |
| Browser | Playwright | More reliable than Puppeteer, multi-browser |
| API Key Security | SHA-256 hashing | Keys never stored in plaintext |
| Cache Resilience | Fail-open | App works without Redis, just slower |
| SSRF Prevention | 5-step validation | Block private IPs, metadata endpoints, unusual ports |

## Data Flow: Preview Generation

```
URL → Validate (SSRF) → Normalize → Cache Check
  → HTTP Fetch (10s timeout) → HTML Parse (cheerio)
  → Sufficiency Check → [Playwright Fallback]
  → Cache Write (Redis 24h) → DB Persist → Return
```

## API Design

- RESTful with versioned prefix (`/api/v1/`)
- Standard JSON envelope: `{ success, data, meta, error }`
- Bearer token authentication (API keys)
- Rate limiting (Redis sliding window)
- Consistent error codes and HTTP status codes

See full documentation in `docs/phase-2/`.
