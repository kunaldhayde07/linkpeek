import { type NextRequest } from "next/server";

import { ValidationError } from "@/lib/api";
import { withSessionOrApiAuth } from "@/lib/api/api-middleware";
import { exportRequestSchema } from "@/lib/export";
import { exportPreviews } from "@/lib/export/export.service";

/**
 * POST /api/v1/export
 *
 * Export preview data as JSON or CSV.
 *
 * Body: { "format": "json" | "csv", "collectionId": "optional", "startDate": "optional", "endDate": "optional" }
 */
export async function POST(request: NextRequest) {
  return withSessionOrApiAuth(request, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = exportRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message ?? "Invalid input");
    }

    const result = await exportPreviews(ctx.userId, {
      format: parsed.data.format,
      collectionId: parsed.data.collectionId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    });

    return new Response(result.content, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
