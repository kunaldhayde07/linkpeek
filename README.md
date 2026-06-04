# ⚡ LinkPeek — Link Preview API Platform

> Generate rich link previews from any URL. Extract Open Graph metadata, Twitter Cards, favicons, and screenshots via a simple API.

[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

- **🔍 Metadata Extraction** — Extract Open Graph, Twitter Cards, HTML meta tags from any URL
- **🎭 Playwright Fallback** — Automatic headless browser rendering for JavaScript-heavy pages
- **📸 Screenshot Capture** — Generate viewport screenshots (desktop/tablet/mobile)
- **⚡ Redis Caching** — Sub-100ms cached responses with 24-hour TTL
- **🔑 API Key Auth** — SHA-256 hashed keys with per-key rate limiting
- **📊 Analytics Dashboard** — Track usage, top domains, cache hit rates
- **🔍 Full-Text Search** — PostgreSQL-powered search across all previews
- **📁 Collections & Tags** — Organize previews by project or category
- **📥 Import/Export** — CSV upload, JSON/CSV export
- **🌙 Dark Mode** — Beautiful SaaS-quality UI with light/dark themes

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS + ShadCN/UI |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Auth | Supabase Auth (Email, GitHub, Google) |
| Cache | Redis (Upstash) |
| Browser | Playwright (Chromium) |
| Hosting | Vercel |
| Testing | Vitest + Playwright Test |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/your-username/linkpeek.git
cd linkpeek

# Install
npm install

# Configure
cp .env.example .env.local
# Fill in your Supabase, Upstash, and other credentials

# Database
npx prisma migrate dev

# Run
npm run dev
```

## 📡 API Usage

```bash
# Generate a link preview
curl -X POST https://linkpeek.app/api/v1/preview \
  -H "Authorization: Bearer lp_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/vercel/next.js"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://github.com/vercel/next.js",
    "title": "vercel/next.js: The React Framework",
    "description": "The React Framework for the Web...",
    "image": "https://opengraph.githubassets.com/...",
    "favicon": "https://github.githubassets.com/favicons/favicon.svg",
    "domain": "github.com",
    "siteName": "GitHub"
  },
  "meta": {
    "cached": false,
    "engine": "fetch",
    "responseTime": 245
  }
}
```

## 📚 Documentation

- [Architecture](docs/phase-2/01-high-level-architecture.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Database Design](docs/phase-3/01-er-diagram.md)

## 📁 Project Structure

```
linkpeek/
├── src/
│   ├── app/           # Next.js pages & API routes
│   ├── components/    # React components (24 components)
│   ├── lib/           # Business logic (10 services)
│   ├── actions/       # Server Actions (5 action files)
│   ├── hooks/         # Custom React hooks
│   └── config/        # App configuration
├── prisma/            # Database schema & migrations
├── tests/             # Unit + integration tests
└── docs/              # Architecture documentation
```

## 🧪 Testing

```bash
npm run test          # Unit tests
npm run test:coverage # With coverage report
npm run test:e2e      # E2E tests (Playwright)
```

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
