import type { NormalizedEvent, FileStats, ModelPricingMap } from "./types";

const LATENCY_BUCKETS = ["<1s", "<5s", "<30s", "<2m", "<10m", ">10m"] as const;

function getLatencyBucket(ms: number): string {
  if (ms < 1000) return "<1s";
  if (ms < 5000) return "<5s";
  if (ms < 30000) return "<30s";
  if (ms < 120000) return "<2m";
  if (ms < 600000) return "<10m";
  return ">10m";
}

function computeMessageCost(m: NormalizedEvent, pricing: ModelPricingMap): number {
  const model = m.model ?? "unknown";
  const price = pricing[model];
  if (!price) return 0;

  const inputCost = (m.tokensIn * price.inputPerMillion) / 1_000_000;
  const outputCost = (m.tokensOut * price.outputPerMillion) / 1_000_000;
  const cacheReadCost = (m.tokensCacheRead * price.cacheReadPerMillion) / 1_000_000;
  return inputCost + outputCost + cacheReadCost;
}

export function computeStats(
  events: NormalizedEvent[],
  fileName: string,
  warnings: string[] = [],
  pricing: ModelPricingMap = {}
): FileStats {
  const messages = events.filter((e) => e.type === "message");

  const totalTokens = messages.reduce((s, m) => s + m.tokensTotal, 0);
  const totalInputTokens = messages.reduce((s, m) => s + m.tokensIn, 0);
  const totalOutputTokens = messages.reduce((s, m) => s + m.tokensOut, 0);

  // Cost: compute from user-defined pricing map
  const hasPricing = Object.keys(pricing).length > 0;
  const totalCost = hasPricing
    ? messages.reduce((s, m) => s + computeMessageCost(m, pricing), 0)
    : null;

  // Duration
  const timestamps = events.map((e) => e.timestamp).filter((t): t is number => t !== null);
  const minTs = timestamps.length > 0 ? Math.min(...timestamps) : 0;
  const maxTs = timestamps.length > 0 ? Math.max(...timestamps) : 0;
  const durationMs = maxTs - minTs;

  // Avg tokens per message
  const avgTokensPerMessage = messages.length > 0 ? Math.round(totalTokens / messages.length) : 0;

  // Role breakdown
  const roleBreakdown: Record<string, number> = {};
  messages.forEach((m) => {
    const r = m.role ?? "unknown";
    roleBreakdown[r] = (roleBreakdown[r] ?? 0) + 1;
  });

  // Model breakdown
  const modelBreakdown: Record<string, number> = {};
  messages.forEach((m) => {
    if (m.model) {
      modelBreakdown[m.model] = (modelBreakdown[m.model] ?? 0) + m.tokensTotal;
    }
  });

  // Provider breakdown
  const providerBreakdown: Record<string, number> = {};
  messages.forEach((m) => {
    if (m.provider) {
      providerBreakdown[m.provider] = (providerBreakdown[m.provider] ?? 0) + m.tokensTotal;
    }
  });

  // Tokens over time
  const tokensOverTime = messages
    .filter((m) => m.timestamp !== null)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    .map((m) => ({
      timestamp: m.timestamp!,
      input: m.tokensIn,
      output: m.tokensOut,
      total: m.tokensTotal,
    }));

  // Latency distribution
  const latencyBuckets: Record<string, number> = {};
  LATENCY_BUCKETS.forEach((b) => (latencyBuckets[b] = 0));

  const sorted = events
    .filter((e) => e.timestamp !== null)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  for (let i = 1; i < sorted.length; i++) {
    const delta = (sorted[i].timestamp ?? 0) - (sorted[i - 1].timestamp ?? 0);
    if (delta >= 0) {
      latencyBuckets[getLatencyBucket(delta)]++;
    }
  }

  return {
    fileName,
    events,
    totalMessages: messages.length,
    totalTokens,
    totalInputTokens,
    totalOutputTokens,
    totalCost,
    durationMs,
    avgTokensPerMessage,
    roleBreakdown,
    modelBreakdown,
    providerBreakdown,
    tokensOverTime,
    latencyBuckets,
    warnings,
  };
}

export function mergeStats(stats: FileStats[], pricing: ModelPricingMap = {}): FileStats {
  const allEvents = stats.flatMap((s) => s.events);
  const allWarnings = stats.flatMap((s) => s.warnings);
  return computeStats(allEvents, "All Files Combined", allWarnings, pricing);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatCost(cost: number | null): string {
  if (cost === null) return "N/A";
  return `$${cost.toFixed(4)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
