"use client";

import { Globe, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { generatePreviewAction } from "@/actions/preview.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PreviewCard } from "./preview-card";

import type { PreviewData } from "@/lib/preview/preview.types";

export function PreviewGenerator() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    data: PreviewData;
    cached: boolean;
    engine: string;
    responseTime: number;
  } | null>(null);

  async function handleGenerate() {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("url", url.trim());

      const response = await generatePreviewAction(formData);

      if (!response.success) {
        toast.error(response.error ?? "Failed to generate preview");
        return;
      }

      if (response.data) {
        setResult({
          data: response.data,
          cached: response.cached ?? false,
          engine: response.engine ?? "fetch",
          responseTime: response.responseTime ?? 0,
        });
        toast.success(
          response.cached ? "Preview loaded from cache" : "Preview generated successfully"
        );
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !isLoading) {
      handleGenerate();
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Generate Preview</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste any URL to generate a preview..."
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>⚡ Generate</>
            )}
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="h-40 animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={result.cached ? "text-emerald-500" : "text-primary"}>
              {result.cached ? "● Cached" : "● Fresh"}
            </span>
            <span>Engine: {result.engine}</span>
            <span>{result.responseTime}ms</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-xs"
              onClick={() => {
                const formData = new FormData();
                formData.set("url", url.trim());
                formData.set("refresh", "true");
                setIsLoading(true);
                generatePreviewAction(formData).then((res) => {
                  if (res.success && res.data) {
                    setResult({
                      data: res.data,
                      cached: false,
                      engine: res.engine ?? "fetch",
                      responseTime: res.responseTime ?? 0,
                    });
                  }
                  setIsLoading(false);
                });
              }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </Button>
          </div>
          <PreviewCard
            url={result.data.url}
            domain={result.data.domain}
            title={result.data.title}
            description={result.data.description}
            image={result.data.image}
            favicon={result.data.favicon}
            engine={result.engine}
          />
        </div>
      )}
    </div>
  );
}
