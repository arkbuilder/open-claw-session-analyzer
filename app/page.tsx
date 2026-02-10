"use client";

import { useState, useCallback } from "react";
import { UploadDropzone } from "@/components/upload-dropzone";
import { ParseProgress } from "@/components/parse-progress";
import { Confetti } from "@/components/confetti";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dashboard } from "@/components/dashboard";
import { MagicBentoGrid, BentoCard } from "@/components/magic-bento-grid";
import { useAnalysis } from "@/hooks/use-analysis";
import {
  setFileStats,
  setAnalyzing,
  setProgress,
  resetStore,
} from "@/lib/analysis-store";
import { parseSessionFile } from "@/lib/parse-session-file";
import { computeStats } from "@/lib/compute-stats";
import type { FileStats } from "@/lib/types";
import {
  BarChart3,
  Zap,
  Clock,
  Shield,
  Layers,
  Cpu,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Token Analytics",
    description:
      "Deep breakdown of input/output tokens across every message and model",
  },
  {
    icon: Zap,
    title: "Cost Tracking",
    description:
      "Precise cost analysis with per-message granularity and totals",
  },
  {
    icon: Clock,
    title: "Latency Insights",
    description:
      "Inter-message timing distribution to find bottlenecks in your sessions",
  },
  {
    icon: Shield,
    title: "Robust Parsing",
    description:
      "Resilient JSONL parser that handles malformed lines with warnings",
  },
  {
    icon: Layers,
    title: "Multi-File Support",
    description:
      "Analyze multiple session files with combined and per-file views",
  },
  {
    icon: Cpu,
    title: "Model Comparison",
    description:
      "Compare token usage and costs across different models and providers",
  },
];

export default function Page() {
  const { fileStats, isAnalyzing } = useAnalysis();
  const [showConfetti, setShowConfetti] = useState(false);
  const hasDashboard = fileStats.length > 0;

  const handleFiles = useCallback(async (files: File[]) => {
    resetStore();
    setAnalyzing(true);
    const allStats: FileStats[] = [];

    for (const file of files) {
      const text = await file.text();
      const { events, warnings } = parseSessionFile(
        text,
        file.name,
        (p) => setProgress(file.name, p)
      );
      const stats = computeStats(events, file.name, warnings);
      allStats.push(stats);
    }

    setFileStats(allStats);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  if (hasDashboard) {
    return (
      <>
        <Confetti active={showConfetti} />
        <Dashboard onBack={() => resetStore()} />
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Confetti active={showConfetti} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            OpenClaw
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Cpu className="h-3 w-3" />
          Session Analyzer
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Analyze your AI sessions
          <br />
          <span className="text-primary">with precision</span>
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Upload OpenClaw session files and get instant, detailed analytics on
          tokens, costs, latency, and model usage with beautiful visualizations.
        </p>
      </div>

      {/* Upload */}
      <div className="mx-auto max-w-2xl px-6 pb-8">
        <UploadDropzone onFilesSelected={handleFiles} isAnalyzing={isAnalyzing} />
        <ParseProgress />
      </div>

      {/* Features Bento Grid */}
      <div className="mx-auto max-w-5xl px-6 pb-20">
        <MagicBentoGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <BentoCard key={feature.title} className="min-h-[180px]">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </BentoCard>
          ))}
        </MagicBentoGrid>
      </div>
    </main>
  );
}
