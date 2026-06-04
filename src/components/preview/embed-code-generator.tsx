"use client";

import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";
import { siteConfig } from "@/config";

interface EmbedCodeGeneratorProps {
  previewId: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url: string;
  domain: string;
  favicon?: string | null;
}

export function EmbedCodeGenerator({
  previewId,
  title,
  description,
  image,
  url,
  domain,
  favicon,
}: EmbedCodeGeneratorProps) {
  const [mode, setMode] = useState<"html" | "iframe">("html");
  const { copied, copyToClipboard } = useCopyClipboard();

  const htmlEmbed = `<div style="max-width:480px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif;background:#fff;">
${image ? `  <img src="${image}" alt="${title ?? ""}" style="width:100%;height:160px;object-fit:cover;" />` : ""}
  <div style="padding:16px;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
      ${favicon ? `<img src="${favicon}" width="14" height="14" style="border-radius:2px;" />` : ""}
      <span style="font-size:12px;color:#6366f1;">${domain}</span>
    </div>
    <h3 style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111;">${title ?? "Untitled"}</h3>
    ${description ? `<p style="margin:0;font-size:13px;color:#666;line-height:1.4;">${description.substring(0, 150)}</p>` : ""}
  </div>
</div>`;

  const iframeEmbed = `<iframe src="${siteConfig.url}/embed/${previewId}" width="480" height="280" frameborder="0" style="border:1px solid #e5e7eb;border-radius:12px;"></iframe>`;

  const currentCode = mode === "html" ? htmlEmbed : iframeEmbed;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Code className="h-4 w-4" />
        Embed Code
      </h3>

      {/* Mode toggle */}
      <div className="mb-3 flex gap-1 rounded-lg border bg-muted/50 p-0.5">
        <button
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "html" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
          onClick={() => setMode("html")}
        >
          HTML
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "iframe" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
          onClick={() => setMode("iframe")}
        >
          iFrame
        </button>
      </div>

      {/* Code preview */}
      <div className="relative">
        <pre className="max-h-48 overflow-auto rounded-lg border bg-[#0d0d0f] p-4 font-mono text-xs leading-relaxed text-emerald-400">
          {currentCode}
        </pre>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-7 bg-background/80 text-xs backdrop-blur"
          onClick={() => copyToClipboard(currentCode)}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
