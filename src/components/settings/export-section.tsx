"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { exportDataAction } from "@/actions/export.actions";
import { Button } from "@/components/ui/button";

export function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: "json" | "csv") {
    setIsExporting(true);
    try {
      const result = await exportDataAction(format);

      if (!result.success || !result.content) {
        toast.error(result.error ?? "Export failed");
        return;
      }

      // Trigger browser download
      const blob = new Blob([result.content], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename ?? `export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
        <Download className="h-4 w-4" />
        Export Data
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Download all your preview data as JSON or CSV.
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("json")}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("csv")}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
          Export CSV
        </Button>
      </div>
    </div>
  );
}
