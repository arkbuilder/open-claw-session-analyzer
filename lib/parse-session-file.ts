import type { JsonlRecord, NormalizedEvent, MessageRecord } from "./types";

function extractText(content: unknown): { preview: string; full: string } {
  if (typeof content === "string") {
    return { preview: content.slice(0, 120), full: content };
  }
  if (!Array.isArray(content)) return { preview: "", full: "" };

  const texts = content
    .filter((c: Record<string, unknown>) => c.type === "text" && typeof c.text === "string")
    .map((c: Record<string, unknown>) => c.text as string);

  const full = texts.join("\n");
  return { preview: full.slice(0, 120), full };
}

function normalizeTimestamp(record: JsonlRecord): number | null {
  // Prefer top-level ISO timestamp
  if ("timestamp" in record && typeof record.timestamp === "string") {
    const d = new Date(record.timestamp);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  // MessageRecord: inner message timestamp (ms epoch)
  if (record.type === "message") {
    const msg = (record as MessageRecord).message;
    if (msg?.timestamp && typeof msg.timestamp === "number") {
      return msg.timestamp;
    }
  }
  return null;
}

export function parseSessionFile(
  text: string,
  fileName: string,
  onProgress?: (p: number) => void
): { events: NormalizedEvent[]; warnings: string[] } {
  const lines = text.split("\n");
  const events: NormalizedEvent[] = [];
  const warnings: string[] = [];
  const total = lines.length;

  for (let i = 0; i < total; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Report progress every 500 lines
    if (onProgress && i % 500 === 0) {
      onProgress(i / total);
    }

    let record: JsonlRecord;
    try {
      record = JSON.parse(line) as JsonlRecord;
    } catch {
      warnings.push(`Line ${i + 1}: JSON parse error`);
      continue;
    }

    const ts = normalizeTimestamp(record);

    let role: string | undefined;
    let model: string | undefined;
    let provider: string | undefined;
    let tokensIn = 0;
    let tokensOut = 0;
    let tokensCacheRead = 0;
    let tokensCacheCreation = 0;
    let tokensTotal = 0;
    let rawCost: number | null = null;
    let textPreview = "";
    let fullText = "";

    if (record.type === "message") {
      const msg = (record as MessageRecord).message;
      role = msg?.role;
      model = msg?.model;
      provider = msg?.provider;

      if (msg?.usage) {
        tokensIn = msg.usage.input ?? 0;
        tokensOut = msg.usage.output ?? 0;
        tokensCacheRead = msg.usage.cacheRead ?? 0;
        tokensCacheCreation = msg.usage.cacheCreation ?? 0;
        tokensTotal = msg.usage.totalTokens ?? tokensIn + tokensOut;
      }

      // Store raw cost for reference only -- we don't use this for the displayed cost
      if (msg?.usage?.cost) {
        rawCost = msg.usage.cost.total ?? null;
        if (rawCost === null) {
          const c = msg.usage.cost;
          const parts = [c.input, c.output, c.cacheCreation, c.cacheRead].filter(
            (v): v is number => typeof v === "number"
          );
          if (parts.length > 0) rawCost = parts.reduce((a, b) => a + b, 0);
        }
      }

      const extracted = extractText(msg?.content);
      textPreview = extracted.preview;
      fullText = extracted.full;
    }

    events.push({
      index: events.length,
      raw: record,
      type: record.type ?? "unknown",
      timestamp: ts,
      role,
      model,
      provider,
      tokensIn,
      tokensOut,
      tokensCacheRead,
      tokensCacheCreation,
      tokensTotal,
      rawCost,
      textPreview,
      fullText,
      fileName,
    });
  }

  if (onProgress) onProgress(1);

  return { events, warnings };
}
