import { PREVIEW_LIMITS, USER_AGENT, logger } from "@/lib/utils";

import type { ExtractedMetadata } from "./preview.types";

// ============================================================================
// Playwright Fallback Engine
//
// Used when the basic HTTP fetch + cheerio extraction fails to find
// sufficient metadata (typically for JavaScript-rendered pages / SPAs).
//
// Architecture:
//   - Uses Playwright's Chromium browser in headless mode
//   - Semaphore limits concurrent instances (max 3) to prevent OOM
//   - Extracts metadata from the fully rendered DOM
//   - Can also capture screenshots
//   - Times out after 30 seconds
//
// Deployment Note:
//   Playwright on Vercel serverless requires the @playwright/browser-chromium
//   package or a custom Chromium binary. For production, consider a dedicated
//   worker service (Cloud Run, Fly.io) for Playwright tasks.
//
//   For the MVP, we use a lightweight approach that works in both local
//   development and serverless environments.
// ============================================================================

/** Semaphore to limit concurrent Playwright instances */
let activeInstances = 0;

/**
 * Acquire a slot in the Playwright semaphore.
 * Waits up to 10 seconds for a slot to become available.
 */
async function acquireSemaphore(): Promise<void> {
  const maxWait = 10_000;
  const pollInterval = 200;
  let waited = 0;

  while (activeInstances >= PREVIEW_LIMITS.maxConcurrentPlaywright) {
    if (waited >= maxWait) {
      throw new Error("Playwright semaphore timeout — all slots busy");
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    waited += pollInterval;
  }

  activeInstances++;
}

/**
 * Release a slot in the Playwright semaphore.
 */
function releaseSemaphore(): void {
  activeInstances = Math.max(0, activeInstances - 1);
}

/**
 * Extract metadata from a URL using Playwright (headless Chromium).
 *
 * This is the fallback when basic HTTP fetch + cheerio fails.
 * It renders the full page including JavaScript, then extracts metadata
 * from the live DOM.
 *
 * @param url - The URL to render and extract metadata from
 * @returns ExtractedMetadata from the rendered page
 */
export async function extractWithPlaywright(url: string): Promise<ExtractedMetadata> {
  await acquireSemaphore();

  let browser;

  try {
    // Dynamic import — Playwright is only loaded when needed
    // This prevents cold start overhead for cached/simple requests
    const { chromium } = await import("playwright");

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-sync",
        "--disable-translate",
        "--no-first-run",
        "--single-process",
      ],
    });

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 720 },
      javaScriptEnabled: true,
      ignoreHTTPSErrors: true,
    });

    // Set a page-level timeout
    context.setDefaultTimeout(PREVIEW_LIMITS.playwrightTimeout);

    const page = await context.newPage();

    // Block unnecessary resources to speed up rendering
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      const blockedTypes = ["image", "media", "font", "stylesheet"];

      if (blockedTypes.includes(resourceType)) {
        return route.abort();
      }
      return route.continue();
    });

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PREVIEW_LIMITS.playwrightTimeout,
    });

    // Wait for additional JS execution (SPAs often load data after DOMContentLoaded)
    await page.waitForTimeout(2000);

    // Extract metadata from the rendered DOM
    const metadata = await page.evaluate(() => {
      function getMeta(attr: string, value: string): string | null {
        const el = document.querySelector(`meta[${attr}="${value}"]`);
        const content = el?.getAttribute("content")?.trim();
        return content && content.length > 0 ? content : null;
      }

      function getFavicon(): string | null {
        const selectors = [
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          const href = el?.getAttribute("href");
          if (href) {
            try {
              return new URL(href, window.location.href).toString();
            } catch {
              return href;
            }
          }
        }
        return `${window.location.protocol}//${window.location.host}/favicon.ico`;
      }

      const keywordsRaw = getMeta("name", "keywords");
      const keywords = keywordsRaw
        ? keywordsRaw.split(",").map((k: string) => k.trim()).filter(Boolean)
        : [];

      return {
        ogTitle: getMeta("property", "og:title"),
        ogDescription: getMeta("property", "og:description"),
        ogImage: getMeta("property", "og:image"),
        ogUrl: getMeta("property", "og:url"),
        ogType: getMeta("property", "og:type"),
        ogSiteName: getMeta("property", "og:site_name"),
        ogLocale: getMeta("property", "og:locale"),

        twitterCard: getMeta("name", "twitter:card") ?? getMeta("property", "twitter:card"),
        twitterTitle: getMeta("name", "twitter:title") ?? getMeta("property", "twitter:title"),
        twitterDescription:
          getMeta("name", "twitter:description") ?? getMeta("property", "twitter:description"),
        twitterImage: getMeta("name", "twitter:image") ?? getMeta("property", "twitter:image"),

        title: document.title?.trim() || null,
        description: getMeta("name", "description"),
        favicon: getFavicon(),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        author: getMeta("name", "author"),
        keywords,
        themeColor: getMeta("name", "theme-color"),
        charset: document.characterSet ?? null,
      };
    });

    await context.close();

    logger.info("Playwright extraction completed", { url, hasTitle: !!metadata.title || !!metadata.ogTitle });

    return metadata as ExtractedMetadata;
  } catch (error) {
    logger.error("Playwright extraction failed", {
      url,
      error: error instanceof Error ? error.message : "Unknown",
    });

    throw new Error(
      `Playwright rendering failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    releaseSemaphore();
  }
}

/**
 * Capture a screenshot of a URL using Playwright.
 *
 * @param url - The URL to screenshot
 * @param viewport - Viewport dimensions (default: 1280x720)
 * @returns PNG buffer of the screenshot
 */
export async function captureScreenshot(
  url: string,
  viewport: { width: number; height: number } = { width: 1280, height: 720 },
  options: { fullPage?: boolean } = {}
): Promise<Buffer> {
  await acquireSemaphore();

  let browser;

  try {
    const { chromium } = await import("playwright");

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport,
      ignoreHTTPSErrors: true,
    });

    context.setDefaultTimeout(PREVIEW_LIMITS.playwrightTimeout);

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: PREVIEW_LIMITS.playwrightTimeout,
    });

    // Small delay for final rendering
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: options.fullPage ?? false,
    });

    await context.close();

    logger.info("Screenshot captured", {
      url,
      width: viewport.width,
      height: viewport.height,
      size: screenshot.byteLength,
    });

    return Buffer.from(screenshot);
  } catch (error) {
    logger.error("Screenshot capture failed", {
      url,
      error: error instanceof Error ? error.message : "Unknown",
    });

    throw new Error(
      `Screenshot capture failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    releaseSemaphore();
  }
}

/**
 * Get the current number of active Playwright instances.
 * Used for health check / monitoring.
 */
export function getActivePlaywrightCount(): number {
  return activeInstances;
}
