import { type NextRequest } from "next/server";

import { successResponse, ValidationError, AppError } from "@/lib/api";
import { withApiAuth } from "@/lib/api/api-middleware";
import { generatePreview } from "@/lib/preview/preview.service";
import { CSV_LIMITS, PREVIEW_LIMITS } from "@/lib/utils";

/**
 * POST /api/v1/import/csv
 *
 * Import URLs from a CSV file and generate previews for each.
 * The CSV must have a "url" column header.
 *
 * Content-Type: multipart/form-data
 * Body: file (CSV)
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (ctx) => {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ValidationError("No file uploaded. Send a CSV file with a 'url' column.");
    }

    if (file.size > CSV_LIMITS.maxFileSize) {
      throw new ValidationError(
        `File too large. Maximum size is ${CSV_LIMITS.maxFileSize / 1024 / 1024}MB.`
      );
    }

    const text = await file.text();
    const lines = text.trim().split("\n");

    if (lines.length < 2) {
      throw new ValidationError("CSV must have a header row and at least one data row.");
    }

    // Parse header
    const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const urlIndex = headers.indexOf("url");

    if (urlIndex === -1) {
      throw new ValidationError('CSV must have a "url" column header.');
    }

    // Parse rows
    const urls: string[] = [];
    for (let i = 1; i < lines.length && urls.length < CSV_LIMITS.maxRows; i++) {
      const line = lines[i]!.trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      const url = columns[urlIndex]?.trim().replace(/"/g, "");

      if (url && url.startsWith("http")) {
        urls.push(url);
      }
    }

    if (urls.length === 0) {
      throw new ValidationError("No valid URLs found in the CSV file.");
    }

    // Process URLs with concurrency limit
    const results = await processWithConcurrency(
      urls,
      async (url) => {
        try {
          const result = await generatePreview(url, ctx.userId);
          return { url, success: true as const, title: result.data.title };
        } catch (error) {
          return {
            url,
            success: false as const,
            error: error instanceof Error ? error.message : "Failed",
          };
        }
      },
      PREVIEW_LIMITS.batchConcurrency
    );

    return successResponse(
      {
        results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
      { requestId: ctx.requestId }
    );
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function processWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  const executing: Set<Promise<void>> = new Set();

  for (const item of items) {
    const promise = fn(item).then((result) => {
      results.push(result);
    });
    const wrapped = promise.then(() => {
      executing.delete(wrapped);
    });
    executing.add(wrapped);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
