// ============================================================================
// Test Mock Data
// Reusable test data for unit and integration tests
// ============================================================================

export const mockUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "test@linkpeek.app",
  name: "Test User",
  avatarUrl: null,
  plan: "free" as const,
  isActive: true,
  emailVerified: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const mockApiKey = {
  id: "00000000-0000-0000-0000-000000000010",
  userId: mockUser.id,
  name: "Test Key",
  keyHash: "a3f2b9c8e1d4f7a6b3c9e2d5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2",
  keyPrefix: "lp_live_a3f2b9c8",
  lastUsedAt: null,
  revokedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const mockPreview = {
  id: "00000000-0000-0000-0000-000000000020",
  userId: mockUser.id,
  url: "https://www.example.com",
  urlHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  resolvedUrl: "https://www.example.com",
  domain: "example.com",
  title: "Example Domain",
  description: "This domain is for use in illustrative examples in documents.",
  image: "https://www.example.com/og-image.png",
  favicon: "https://www.example.com/favicon.ico",
  siteName: "Example",
  type: "website",
  locale: "en_US",
  twitterCard: "summary",
  twitterTitle: "Example Domain",
  twitterDescription: "This domain is for use in illustrative examples.",
  twitterImage: "https://www.example.com/twitter-image.png",
  contentType: "text/html",
  charset: "utf-8",
  author: null,
  keywords: ["example", "domain"],
  themeColor: "#ffffff",
  engine: "fetch" as const,
  responseTime: 245,
  createdAt: new Date("2026-06-01T00:00:00Z"),
  updatedAt: new Date("2026-06-01T00:00:00Z"),
};

export const mockCollection = {
  id: "00000000-0000-0000-0000-000000000030",
  userId: mockUser.id,
  name: "Test Collection",
  description: "A test collection for testing",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const mockTag = {
  id: "00000000-0000-0000-0000-000000000040",
  userId: mockUser.id,
  name: "frontend",
  color: "#6366f1",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

export const mockHtml = {
  withOgTags: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Example Page Title</title>
      <meta property="og:title" content="OG Title" />
      <meta property="og:description" content="OG Description" />
      <meta property="og:image" content="https://example.com/og-image.png" />
      <meta property="og:url" content="https://example.com/page" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Example Site" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Twitter Title" />
      <meta name="twitter:description" content="Twitter Description" />
      <meta name="twitter:image" content="https://example.com/twitter-image.png" />
      <meta name="description" content="Meta description" />
      <meta name="author" content="John Doe" />
      <meta name="keywords" content="example, test, metadata" />
      <meta name="theme-color" content="#6366f1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href="https://example.com/page" />
    </head>
    <body><h1>Hello World</h1></body>
    </html>
  `,

  minimal: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Page</title>
    </head>
    <body><p>Minimal page with no metadata.</p></body>
    </html>
  `,

  noMetadata: `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body><p>No metadata at all.</p></body>
    </html>
  `,

  withRelativeUrls: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relative URLs</title>
      <meta property="og:image" content="/images/og.png" />
      <link rel="icon" href="/favicon.ico" />
    </head>
    <body></body>
    </html>
  `,
};
