"use client";

import { Bookmark, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config";

/**
 * Bookmarklet Section
 *
 * Provides a drag-to-bookmarks-bar bookmarklet that opens LinkPeek
 * with the current page URL pre-filled for preview generation.
 */
export function BookmarkletSection() {
  const bookmarkletCode = `javascript:void(window.open('${siteConfig.url}/dashboard?url='+encodeURIComponent(window.location.href),'_blank'))`;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
        <Bookmark className="h-4 w-4" />
        Bookmarklet
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Drag the button below to your bookmarks bar. Click it on any page to generate a preview instantly.
      </p>

      <div className="flex flex-col items-start gap-3">
        {/* The bookmarklet — a link styled as a button */}
        <a
          href={bookmarkletCode}
          onClick={(e) => e.preventDefault()}
          draggable
          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          ⚡ Preview with LinkPeek
        </a>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            <strong>How to install:</strong> Drag the button above to your browser&apos;s
            bookmarks bar. Then visit any website and click the bookmark to preview it.
          </span>
        </div>

        {/* Manual instructions */}
        <details className="mt-2 w-full">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            Manual installation →
          </summary>
          <div className="mt-2 rounded-lg border bg-muted/50 p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              If drag-and-drop doesn&apos;t work, create a new bookmark manually and paste this as the URL:
            </p>
            <pre className="overflow-x-auto rounded bg-background p-2 font-mono text-[11px] text-muted-foreground">
              {bookmarkletCode}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
