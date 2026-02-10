// ─── Raw JSONL record shapes ───
export interface SessionRecord {
  type: "session";
  version: number;
  id: string;
  timestamp: string;
  cwd?: string;
}

export interface UsageCost {
  input?: number;
  output?: number;
  cacheCreation?: number;
  cacheRead?: number;
  total?: number;
}

export interface Usage {
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheCreation?: number;
  totalTokens?: number;
  cost?: UsageCost;
}

export interface MessageContent {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface InnerMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: MessageContent[] | string;
  usage?: Usage;
  model?: string;
  provider?: string;
  api?: string;
  stopReason?: string;
  timestamp?: number;
}

export interface MessageRecord {
  type: "message";
  id: string;
  parentId?: string;
  timestamp?: string;
  message: InnerMessage;
}

export interface CustomRecord {
  type: "custom";
  customType: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type JsonlRecord = SessionRecord | MessageRecord | CustomRecord | Record<string, unknown>;

// ─── Parsed & normalized ───
export interface NormalizedEvent {
  index: number;
  raw: JsonlRecord;
  type: string;
  timestamp: number | null;
  role?: string;
  model?: string;
  provider?: string;
  tokensIn: number;
  tokensOut: number;
  tokensCacheRead: number;
  tokensCacheCreation: number;
  tokensTotal: number;
  rawCost: number | null; // raw cost from JSONL (unreliable, for reference only)
  textPreview: string;
  fullText: string;
  fileName: string;
}

// ─── Computed stats ───
export interface FileStats {
  fileName: string;
  events: NormalizedEvent[];
  totalMessages: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number | null;
  durationMs: number;
  avgTokensPerMessage: number;
  roleBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  providerBreakdown: Record<string, number>;
  tokensOverTime: { timestamp: number; input: number; output: number; total: number }[];
  latencyBuckets: Record<string, number>;
  warnings: string[];
}

export interface ParseProgress {
  fileName: string;
  progress: number; // 0-1
  done: boolean;
}

// ─── Model Pricing ───
export interface ModelPrice {
  inputPerMillion: number;  // $ per 1M input tokens
  outputPerMillion: number; // $ per 1M output tokens
  cacheReadPerMillion: number; // $ per 1M cache-read tokens (often cheaper)
}

export type ModelPricingMap = Record<string, ModelPrice>;
