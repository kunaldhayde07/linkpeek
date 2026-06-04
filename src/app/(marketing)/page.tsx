import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Globe, Image, Key, Search, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LinkPeek — Link Preview API Platform",
  description:
    "Generate rich link previews from any URL. Extract Open Graph metadata, Twitter Cards, favicons, and screenshots via a simple API.",
};

const features = [
  {
    icon: Globe,
    title: "Metadata Extraction",
    description: "Extract Open Graph, Twitter Cards, and HTML meta tags from any URL automatically.",
  },
  {
    icon: Zap,
    title: "Playwright Fallback",
    description: "Automatically renders JavaScript-heavy pages using headless Chromium when basic fetch fails.",
  },
  {
    icon: Image,
    title: "Screenshot Capture",
    description: "Generate viewport screenshots with configurable dimensions. Desktop, tablet, and mobile.",
  },
  {
    icon: BarChart3,
    title: "Redis Caching",
    description: "Cached responses served in under 100ms. 24-hour TTL with manual refresh option.",
  },
  {
    icon: Key,
    title: "API Key Auth",
    description: "Secure API key authentication with SHA-256 hashing. Rate limiting per key.",
  },
  {
    icon: Search,
    title: "Full-Text Search",
    description: "Search your preview history by title, description, URL, or domain with ranked results.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex rounded-full border bg-muted px-4 py-1.5 text-xs font-medium">
            ✨ Open Source Link Preview Platform
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Link Previews,
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Extract Open Graph metadata, Twitter Cards, favicons, and screenshots from any URL with a single API call. Built for developers.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup">Start Free →</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="#api">View API Docs</Link>
            </Button>
          </div>

          {/* Code preview */}
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border bg-[#0d0d0f] shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-white/40">Terminal</span>
            </div>
            <pre className="overflow-x-auto p-5 text-left font-mono text-sm leading-relaxed">
              <code>
                <span className="text-gray-500">{"# Generate a link preview\n"}</span>
                <span className="text-purple-400">curl</span>
                <span className="text-white">{" -X POST "}</span>
                <span className="text-emerald-400">https://linkpeek.app/api/v1/preview</span>
                <span className="text-white">{" \\\n  -H "}</span>
                <span className="text-amber-300">{'"Authorization: Bearer lp_live_your_key"'}</span>
                <span className="text-white">{" \\\n  -H "}</span>
                <span className="text-amber-300">{'"Content-Type: application/json"'}</span>
                <span className="text-white">{" \\\n  -d "}</span>
                <span className="text-emerald-400">{"'{\"url\": \"https://github.com/vercel/next.js\"}'"}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Everything you need</h2>
            <p className="text-muted-foreground">
              A complete link preview toolkit. No infrastructure to manage.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Simple, Powerful API</h2>
          <p className="mb-8 text-muted-foreground">
            One endpoint. Structured JSON. Works with any language.
          </p>
          <div className="overflow-hidden rounded-xl border bg-card text-left shadow-sm">
            <div className="border-b px-4 py-3">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                POST
              </span>
              <span className="ml-2 font-mono text-sm">/api/v1/preview</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-muted-foreground">
{`{
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
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mb-8 text-muted-foreground">
            Free tier includes 100 requests per day. No credit card required.
          </p>
          <Button size="lg" className="px-8" asChild>
            <Link href="/signup">Create Free Account →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
