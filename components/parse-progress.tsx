"use client";

import { Progress } from "@/components/ui/progress";
import { useAnalysis } from "@/hooks/use-analysis";
import { FileText } from "lucide-react";

export function ParseProgress() {
  const { progress, isAnalyzing } = useAnalysis();
  
  if (!isAnalyzing) return null;

  const entries = Object.entries(progress);
  const totalProgress =
    entries.length > 0
      ? entries.reduce((s, [, v]) => s + v, 0) / entries.length
      : 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Analyzing files...</p>
        <span className="text-xs font-mono text-muted-foreground">
          {Math.round(totalProgress * 100)}%
        </span>
      </div>
      <Progress value={totalProgress * 100} className="h-2" />
      <div className="flex flex-wrap gap-2">
        {entries.map(([name, val]) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <FileText className="h-3 w-3" />
            {name}: {Math.round(val * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}
