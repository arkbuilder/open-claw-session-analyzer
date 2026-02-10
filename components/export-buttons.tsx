"use client";

import type { FileStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

function downloadBlob(data: string, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ stats }: { stats: FileStats }) {
  function exportJSON() {
    const summary = {
      fileName: stats.fileName,
      totalMessages: stats.totalMessages,
      totalTokens: stats.totalTokens,
      totalInputTokens: stats.totalInputTokens,
      totalOutputTokens: stats.totalOutputTokens,
      estimatedCost: stats.totalCost,
      durationMs: stats.durationMs,
      avgTokensPerMessage: stats.avgTokensPerMessage,
      roleBreakdown: stats.roleBreakdown,
      modelBreakdown: stats.modelBreakdown,
      providerBreakdown: stats.providerBreakdown,
      latencyBuckets: stats.latencyBuckets,
    };
    downloadBlob(JSON.stringify(summary, null, 2), "summary.json", "application/json");
  }

  function exportCSV() {
    const headers = [
      "index",
      "timestamp",
      "type",
      "role",
      "model",
      "provider",
      "tokensIn",
      "tokensOut",
      "tokensTotal",
      "rawCost",
      "textPreview",
    ];
    const rows = stats.events
      .filter((e) => e.type === "message")
      .map((e) =>
        [
          e.index,
          e.timestamp ? new Date(e.timestamp).toISOString() : "",
          e.type,
          e.role ?? "",
          e.model ?? "",
          e.provider ?? "",
          e.tokensIn,
          e.tokensOut,
          e.tokensTotal,
          e.rawCost ?? "",
          `"${(e.textPreview ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      );
    const csv = [headers.join(","), ...rows].join("\n");
    downloadBlob(csv, "messages.csv", "text/csv");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportJSON}>
        <FileJson className="mr-2 h-4 w-4" />
        Download Summary JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Download Messages CSV
      </Button>
    </div>
  );
}
