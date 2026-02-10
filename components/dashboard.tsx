"use client";

import { useMemo } from "react";
import { useAnalysis } from "@/hooks/use-analysis";
import { setActiveFile } from "@/lib/analysis-store";
import { mergeStats, computeStats } from "@/lib/compute-stats";
import { SummaryCards } from "@/components/summary-cards";
import { Charts } from "@/components/charts";
import { TimelineTable } from "@/components/timeline-table";
import { Highlights } from "@/components/highlights";
import { ExportButtons } from "@/components/export-buttons";
import { WarningsPanel } from "@/components/warnings-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelPricingConfig } from "@/components/model-pricing-config";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Zap,
  BarChart3,
  TableProperties,
  Sparkles,
} from "lucide-react";

export function Dashboard({ onBack }: { onBack: () => void }) {
  const { fileStats, activeFile, modelPricing } = useAnalysis();

  const currentStats = useMemo(() => {
    if (activeFile === "all" || fileStats.length <= 1) {
      return mergeStats(fileStats, modelPricing);
    }
    const found = fileStats.find((s) => s.fileName === activeFile);
    if (found) {
      // Recompute with current pricing
      return computeStats(found.events, found.fileName, found.warnings, modelPricing);
    }
    return mergeStats(fileStats, modelPricing);
  }, [fileStats, activeFile, modelPricing]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              OpenClaw Analyzer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* File switcher */}
          {fileStats.length > 1 && (
            <Select
              value={activeFile}
              onValueChange={(v) => setActiveFile(v)}
            >
              <SelectTrigger className="w-[200px] text-xs">
                <SelectValue placeholder="Select file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files Combined</SelectItem>
                {fileStats.map((s) => (
                  <SelectItem key={s.fileName} value={s.fileName}>
                    {s.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <ModelPricingConfig />
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="overview" className="flex flex-col gap-6">
          <TabsList className="self-start bg-secondary/50">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5 text-xs">
              <TableProperties className="h-3.5 w-3.5" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="highlights" className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Highlights
            </TabsTrigger>
          </TabsList>

          {/* Warnings */}
          <WarningsPanel warnings={currentStats.warnings} />

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex flex-col gap-6 mt-0">
            <SummaryCards stats={currentStats} />
            <Charts stats={currentStats} />
            <ExportButtons stats={currentStats} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0">
            <TimelineTable events={currentStats.events} />
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="mt-0">
            <Highlights stats={currentStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
