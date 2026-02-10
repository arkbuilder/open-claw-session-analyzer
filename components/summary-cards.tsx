"use client";

import { BentoCard, MagicBentoGrid } from "@/components/magic-bento-grid";
import { AnimatedCounter } from "@/components/animated-counter";
import { formatDuration, formatCost } from "@/lib/compute-stats";
import type { FileStats } from "@/lib/types";
import {
  MessageSquare,
  Hash,
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Clock,
  TrendingUp,
} from "lucide-react";

const GLOW_COLOR = "132, 0, 255";

interface SummaryCardsProps {
  stats: FileStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      icon: MessageSquare,
      label: "Total Messages",
      value: stats.totalMessages,
      prefix: "",
      suffix: "",
      decimals: 0,
    },
    {
      icon: Hash,
      label: "Total Tokens",
      value: stats.totalTokens,
      prefix: "",
      suffix: "",
      decimals: 0,
    },
    {
      icon: ArrowDownToLine,
      label: "Input Tokens",
      value: stats.totalInputTokens,
      prefix: "",
      suffix: "",
      decimals: 0,
    },
    {
      icon: ArrowUpFromLine,
      label: "Output Tokens",
      value: stats.totalOutputTokens,
      prefix: "",
      suffix: "",
      decimals: 0,
    },
    {
      icon: DollarSign,
      label: "Estimated Cost",
      value: stats.totalCost ?? 0,
      prefix: "$",
      suffix: "",
      decimals: 4,
      isNull: stats.totalCost === null,
      nullLabel: "Set pricing",
    },
    {
      icon: Clock,
      label: "Session Duration",
      formatted: formatDuration(stats.durationMs),
    },
    {
      icon: TrendingUp,
      label: "Avg Tokens/Msg",
      value: stats.avgTokensPerMessage,
      prefix: "",
      suffix: "",
      decimals: 0,
    },
  ];

  return (
    <MagicBentoGrid
      className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      glowColor={GLOW_COLOR}
    >
      {cards.map((card) => (
        <BentoCard
          key={card.label}
          glowColor={GLOW_COLOR}
          className="min-h-[120px] gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {card.label}
            </span>
          </div>
          <div className="mt-auto text-2xl font-bold text-foreground">
            {"formatted" in card ? (
              <span className="font-mono tabular-nums">{card.formatted}</span>
            ) : "isNull" in card && card.isNull ? (
              <span className="text-sm text-muted-foreground">{"nullLabel" in card ? card.nullLabel : "N/A"}</span>
            ) : (
              <AnimatedCounter
                value={card.value!}
                prefix={card.prefix}
                suffix={card.suffix}
                decimals={card.decimals}
              />
            )}
          </div>
        </BentoCard>
      ))}
    </MagicBentoGrid>
  );
}
