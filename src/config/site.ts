// ============================================================================
// Site Configuration
// Central place for all site-wide metadata and settings
// ============================================================================

export const siteConfig = {
  name: "LinkPeek",
  description:
    "Generate rich link previews from any URL. Extract Open Graph metadata, Twitter Cards, favicons, and screenshots via a simple API.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  creator: "LinkPeek",
  keywords: [
    "link preview",
    "open graph",
    "metadata extraction",
    "url preview",
    "twitter card",
    "screenshot api",
    "link unfurling",
  ],
  links: {
    github: "https://github.com/linkpeek/linkpeek",
    docs: "/docs",
  },
} as const;
