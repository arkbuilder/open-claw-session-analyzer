'use client';

import { useSyncExternalStore } from "react";
import { getState, subscribe } from "@/lib/analysis-store";

export function useAnalysis() {
  return useSyncExternalStore(subscribe, getState, getState);
}
