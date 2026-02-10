"use client";

import { useMemo } from "react";
import type { FileStats } from "@/lib/types";
import { BentoCard, MagicBentoGrid } from "@/components/magic-bento-grid";
import { formatDuration } from "@/lib/compute-stats";
import {
  Trophy,
  Zap,
  Clock,
  Crown,
  MessageSquare,
  Server,
} from "lucide-react";

const GLOW = "132, 0, 255";

export function Highlights({ stats }: { stats: FileStats }) {
  const highlights = useMemo(() => {
    const messages = stats.events.filter((e) => e.type === "message");

    // Top 10 longest messages by tokens
    const topByTokens = [...messages]
      .sort((a, b) => b.tokensTotal - a.tokensTotal)
      .slice(0, 10);

    // Biggest token spike
    const biggestSpike =
      topByTokens.length > 0 ? topByTokens[0] : null;

    // Longest pause
    const sorted = stats.events
      .filter((e) => e.timestamp !== null)
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    let longestPause = 0;
    let pauseFrom = "";
    let pauseTo = "";
    for (let i = 1; i < sorted.length; i++) {
      const delta = (sorted[i].timestamp ?? 0) - (sorted[i - 1].timestamp ?? 0);
      if (delta > longestPause) {
        longestPause = delta;
        pauseFrom = new Date(sorted[i - 1].timestamp ?? 0).toLocaleTimeString();
        pauseTo = new Date(sorted[i].timestamp ?? 0).toLocaleTimeString();
      }
    }

    // Most used model
    const topModel = Object.entries(stats.modelBreakdown).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Most used provider
    const topProvider = Object.entries(stats.providerBreakdown).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      topByTokens,
      biggestSpike,
      longestPause,
      pauseFrom,
      pauseTo,
      topModel,
      topProvider,
    };
  }, [stats]);

  return (
    <div className="flex flex-col gap-6">
      {/* Key highlight cards */}
      <MagicBentoGrid
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        glowColor={GLOW}
      >
        <BentoCard glowColor={GLOW} className="gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Biggest Token Spike</p>
            <p className="text-lg font-bold text-foreground">
              {highlights.biggestSpike
                ? highlights.biggestSpike.tokensTotal.toLocaleString()
                : "N/A"}
            </p>
            {highlights.biggestSpike?.role && (
              <p className="text-[10px] text-muted-foreground">
                Role: {highlights.biggestSpike.role}
              </p>
            )}
          </div>
        </BentoCard>

        <BentoCard glowColor={GLOW} className="gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Longest Pause</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatDuration(highlights.longestPause)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {highlights.pauseFrom} - {highlights.pauseTo}
            </p>
          </div>
        </BentoCard>

        <BentoCard glowColor={GLOW} className="gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Top Model</p>
            <p className="text-sm font-bold text-foreground truncate">
              {highlights.topModel
                ? (highlights.topModel[0].split("/").pop() ??
                    highlights.topModel[0])
                : "N/A"}
            </p>
            {highlights.topModel && (
              <p className="text-[10px] text-muted-foreground">
                {highlights.topModel[1].toLocaleString()} tokens
              </p>
            )}
          </div>
        </BentoCard>

        <BentoCard glowColor={GLOW} className="gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Top Provider</p>
            <p className="text-sm font-bold text-foreground">
              {highlights.topProvider ? highlights.topProvider[0] : "N/A"}
            </p>
            {highlights.topProvider && (
              <p className="text-[10px] text-muted-foreground">
                {highlights.topProvider[1].toLocaleString()} tokens
              </p>
            )}
          </div>
        </BentoCard>
      </MagicBentoGrid>

      {/* Top 10 longest messages */}
      {highlights.topByTokens.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Top 10 Longest Messages by Tokens
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {highlights.topByTokens.map((evt, i) => (
              <div
                key={evt.index}
                className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {evt.textPreview || `[${evt.type}]`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {evt.role && (
                    <span className="text-[10px] text-muted-foreground">
                      {evt.role}
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-foreground">
                    {evt.tokensTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
