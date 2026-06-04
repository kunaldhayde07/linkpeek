# API Documentation — LinkPeek

**Base URL:** `https://linkpeek.app/api/v1`  
**Authentication:** `Authorization: Bearer lp_live_your_api_key`  
**Content-Type:** `application/json`

---

## Authentication

All API endpoints require a valid API key in the Authorization header:
```
Authorization: Bearer lp_live_your_api_key
```

Generate API keys from the Dashboard → API Keys page.

---

## Rate Limits

| Plan | Limit | Window |
|------|-------|--------|
| Free | 100 requests | Per day |
| Pro | 10,000 requests | Per day |

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1717459200
```

---

## Endpoints

### Generate Preview

```
POST /api/v1/preview
```

**Body:**
```json
{
  "url": "https://example.com",
  "refresh": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | URL to preview (http/https) |
| `refresh` | boolean | No | Force cache bypass (default: false) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "resolvedUrl": "https://example.com",
    "title": "Example Domain",
    "description": "This domain is for illustrative examples...",
    "image": "https://example.com/og-image.png",
    "favicon": "https://example.com/favicon.ico",
    "domain": "example.com",
    "siteName": "Example",
    "type": "website",
    "locale": "en_US",
    "twitterCard": "summary",
    "twitterTitle": "Example Domain",
    "twitterDescription": "...",
    "twitterImage": "...",
    "contentType": "text/html",
    "charset": "utf-8",
    "author": null,
    "keywords": ["example"],
    "themeColor": "#ffffff",
    "screenshotUrl": null
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-06-03T10:00:00.000Z",
    "cached": false,
    "engine": "fetch",
    "responseTime": 245
  },
  "error": null
}
```

### Batch Preview

```
POST /api/v1/preview/batch
```

**Body:**
```json
{
  "urls": ["https://a.com", "https://b.com"],
  "refresh": false
}
```

Max 50 URLs per batch. Each URL counts as one request against rate limit.

### Capture Screenshot

```
POST /api/v1/screenshot
```

**Body:**
```json
{
  "url": "https://example.com",
  "viewport": { "width": 1280, "height": 720 },
  "format": "png",
  "fullPage": false
}
```

### List Previews

```
GET /api/v1/previews?page=1&limit=20&domain=example.com
```

### Search Previews

```
GET /api/v1/search?q=react+tutorial&page=1&limit=20
```

### Collections

```
GET    /api/v1/collections           # List
POST   /api/v1/collections           # Create
GET    /api/v1/collections/:id       # Get with previews
PUT    /api/v1/collections/:id       # Update
DELETE /api/v1/collections/:id       # Delete
POST   /api/v1/collections/:id/previews   # Add preview
DELETE /api/v1/collections/:id/previews   # Remove preview
```

### Tags

```
GET    /api/v1/tags          # List
POST   /api/v1/tags          # Create
PUT    /api/v1/tags/:id      # Update
DELETE /api/v1/tags/:id      # Delete
```

### API Keys

```
GET    /api/v1/keys          # List
POST   /api/v1/keys          # Generate
DELETE /api/v1/keys/:id      # Revoke
```

### Analytics

```
GET /api/v1/analytics?startDate=2026-01-01&endDate=2026-06-03
```

### Export

```
POST /api/v1/export
Body: { "format": "json" | "csv" }
```

### Import CSV

```
POST /api/v1/import/csv
Content-Type: multipart/form-data
Body: file (CSV with "url" column)
```

### Health Check

```
GET /api/health
```

---

## Error Responses

```json
{
  "success": false,
  "data": null,
  "meta": { "requestId": "req_abc123", "timestamp": "..." },
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded your rate limit",
    "details": { "limit": 100, "remaining": 0, "resetAt": 1717459200 }
  }
}
```

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `INVALID_URL` | 400 | Blocked or malformed URL |
| `MISSING_API_KEY` | 401 | No Authorization header |
| `INVALID_API_KEY` | 401 | Bad or revoked key |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Daily limit exceeded |
| `FETCH_FAILED` | 422 | Target URL unreachable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
