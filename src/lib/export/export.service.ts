import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

import type { ExportOptions } from "./export.types";

// ============================================================================
// Export Service
// Generate JSON or CSV exports of preview data
// ============================================================================

/**
 * Export previews as JSON or CSV.
 */
export async function exportPreviews(
  userId: string,
  options: ExportOptions
): Promise<{ content: string; filename: string; contentType: string }> {
  const where: Record<string, unknown> = { userId };

  if (options.collectionId) {
    where["collectionPreviews"] = {
      some: { collectionId: options.collectionId },
    };
  }

  if (options.startDate || options.endDate) {
    where["createdAt"] = {};
    if (options.startDate) {
      (where["createdAt"] as Record<string, unknown>)["gte"] = options.startDate;
    }
    if (options.endDate) {
      (where["createdAt"] as Record<string, unknown>)["lte"] = options.endDate;
    }
  }

  const previews = await prisma.preview.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      url: true,
      title: true,
      description: true,
      image: true,
      domain: true,
      siteName: true,
      favicon: true,
      engine: true,
      createdAt: true,
    },
  });

  if (options.format === "csv") {
    return exportAsCsv(previews);
  }

  return exportAsJson(previews);
}

function exportAsJson(
  previews: Array<Record<string, unknown>>
): { content: string; filename: string; contentType: string } {
  const timestamp = new Date().toISOString().split("T")[0];
  return {
    content: JSON.stringify(previews, null, 2),
    filename: `linkpeek-export-${timestamp}.json`,
    contentType: "application/json",
  };
}

function exportAsCsv(
  previews: Array<Record<string, unknown>>
): { content: string; filename: string; contentType: string } {
  const headers = ["url", "title", "description", "image", "domain", "site_name", "engine", "created_at"];
  const rows = previews.map((p) =>
    headers
      .map((h) => {
        const key = h === "site_name" ? "siteName" : h === "created_at" ? "createdAt" : h;
        const val = p[key];
        if (val === null || val === undefined) return "";
        const str = val instanceof Date ? val.toISOString() : String(val);
        // Escape CSV values
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  const timestamp = new Date().toISOString().split("T")[0];
  return {
    content: [headers.join(","), ...rows].join("\n"),
    filename: `linkpeek-export-${timestamp}.csv`,
    contentType: "text/csv",
  };
}
