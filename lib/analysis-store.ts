// Simple shared state via a module-level store + event emitter pattern
import type { FileStats, ModelPricingMap } from "./types";

type Listener = () => void;

interface AnalysisState {
  fileStats: FileStats[];
  activeFile: string; // "all" or a file name
  isAnalyzing: boolean;
  progress: Record<string, number>; // fileName -> 0-1
  modelPricing: ModelPricingMap;
}

let state: AnalysisState = {
  fileStats: [],
  activeFile: "all",
  isAnalyzing: false,
  progress: {},
  modelPricing: {},
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): AnalysisState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setFileStats(stats: FileStats[]) {
  state = { ...state, fileStats: stats, isAnalyzing: false };
  emit();
}

export function setActiveFile(name: string) {
  state = { ...state, activeFile: name };
  emit();
}

export function setAnalyzing(v: boolean) {
  state = { ...state, isAnalyzing: v };
  emit();
}

export function setProgress(fileName: string, progress: number) {
  state = { ...state, progress: { ...state.progress, [fileName]: progress } };
  emit();
}

export function setModelPricing(pricing: ModelPricingMap) {
  state = { ...state, modelPricing: pricing };
  emit();
}

export function resetStore() {
  state = { fileStats: [], activeFile: "all", isAnalyzing: false, progress: {}, modelPricing: {} };
  emit();
}
