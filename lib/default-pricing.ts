import type { ModelPrice } from "./types";

// Default pricing for well-known models ($ per 1M tokens)
// Users can override these in the pricing config UI.
// Sources: provider pricing pages as of early 2026. These are estimates.
const KNOWN_MODELS: Record<string, ModelPrice> = {
  // Anthropic Claude
  "claude-sonnet-4-20250514": { inputPerMillion: 3, outputPerMillion: 15, cacheReadPerMillion: 0.3 },
  "claude-sonnet-4-5-20250929": { inputPerMillion: 3, outputPerMillion: 15, cacheReadPerMillion: 0.3 },
  "claude-opus-4-20250514": { inputPerMillion: 15, outputPerMillion: 75, cacheReadPerMillion: 1.5 },
  "claude-3-5-sonnet-20241022": { inputPerMillion: 3, outputPerMillion: 15, cacheReadPerMillion: 0.3 },
  "claude-3-5-haiku-20241022": { inputPerMillion: 0.8, outputPerMillion: 4, cacheReadPerMillion: 0.08 },
  "claude-3-haiku-20240307": { inputPerMillion: 0.25, outputPerMillion: 1.25, cacheReadPerMillion: 0.03 },
  "claude-3-opus-20240229": { inputPerMillion: 15, outputPerMillion: 75, cacheReadPerMillion: 1.5 },

  // OpenAI
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10, cacheReadPerMillion: 1.25 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6, cacheReadPerMillion: 0.075 },
  "gpt-4-turbo": { inputPerMillion: 10, outputPerMillion: 30, cacheReadPerMillion: 5 },
  "gpt-4": { inputPerMillion: 30, outputPerMillion: 60, cacheReadPerMillion: 15 },
  "gpt-3.5-turbo": { inputPerMillion: 0.5, outputPerMillion: 1.5, cacheReadPerMillion: 0.25 },
  "o1": { inputPerMillion: 15, outputPerMillion: 60, cacheReadPerMillion: 7.5 },
  "o1-mini": { inputPerMillion: 3, outputPerMillion: 12, cacheReadPerMillion: 1.5 },
  "o3": { inputPerMillion: 10, outputPerMillion: 40, cacheReadPerMillion: 2.5 },
  "o3-mini": { inputPerMillion: 1.1, outputPerMillion: 4.4, cacheReadPerMillion: 0.55 },
  "o4-mini": { inputPerMillion: 1.1, outputPerMillion: 4.4, cacheReadPerMillion: 0.55 },

  // Google Gemini
  "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4, cacheReadPerMillion: 0.025 },
  "gemini-2.0-pro": { inputPerMillion: 1.25, outputPerMillion: 10, cacheReadPerMillion: 0.3 },
  "gemini-1.5-pro": { inputPerMillion: 1.25, outputPerMillion: 5, cacheReadPerMillion: 0.3 },
  "gemini-1.5-flash": { inputPerMillion: 0.075, outputPerMillion: 0.3, cacheReadPerMillion: 0.02 },

  // Meta Llama
  "llama-3.1-405b": { inputPerMillion: 3, outputPerMillion: 3, cacheReadPerMillion: 1.5 },
  "llama-3.1-70b": { inputPerMillion: 0.8, outputPerMillion: 0.8, cacheReadPerMillion: 0.4 },
  "llama-3.1-8b": { inputPerMillion: 0.1, outputPerMillion: 0.1, cacheReadPerMillion: 0.05 },
};

const DEFAULT_PRICE: ModelPrice = { inputPerMillion: 3, outputPerMillion: 15, cacheReadPerMillion: 0.3 };

/**
 * Given a model ID from the JSONL, try to find a matching known model price.
 * Supports partial/fuzzy matching (e.g. "claude-3-5-sonnet-20241022" matches "claude-3-5-sonnet-20241022").
 */
export function lookupDefaultPrice(modelId: string): ModelPrice {
  // Exact match
  if (KNOWN_MODELS[modelId]) return { ...KNOWN_MODELS[modelId] };

  // Try substring match (model IDs sometimes have prefixes/suffixes)
  const lower = modelId.toLowerCase();
  for (const [key, price] of Object.entries(KNOWN_MODELS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return { ...price };
    }
  }

  return { ...DEFAULT_PRICE };
}

export function getDefaultPricingForModels(modelIds: string[]): Record<string, ModelPrice> {
  const result: Record<string, ModelPrice> = {};
  for (const id of modelIds) {
    result[id] = lookupDefaultPrice(id);
  }
  return result;
}
