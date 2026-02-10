"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAnalysis } from "@/hooks/use-analysis";
import { setModelPricing } from "@/lib/analysis-store";
import { getDefaultPricingForModels } from "@/lib/default-pricing";
import type { ModelPrice, ModelPricingMap } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings2, RotateCcw } from "lucide-react";

export function ModelPricingConfig() {
  const { fileStats, modelPricing } = useAnalysis();

  // Discover all unique models across all files
  const allModels = useMemo(() => {
    const models = new Set<string>();
    for (const fs of fileStats) {
      for (const evt of fs.events) {
        if (evt.model) models.add(evt.model);
      }
    }
    return Array.from(models).sort();
  }, [fileStats]);

  // Local draft state for the form
  const [draft, setDraft] = useState<ModelPricingMap>({});

  // Initialize draft from store pricing or defaults
  useEffect(() => {
    if (allModels.length === 0) return;
    const defaults = getDefaultPricingForModels(allModels);
    // Merge: keep existing user overrides, fill in defaults for new models
    const merged: ModelPricingMap = {};
    for (const model of allModels) {
      merged[model] = modelPricing[model] ?? defaults[model];
    }
    setDraft(merged);
  }, [allModels, modelPricing]);

  const updateField = useCallback(
    (model: string, field: keyof ModelPrice, value: string) => {
      const num = Number.parseFloat(value);
      if (Number.isNaN(num) && value !== "") return;
      setDraft((prev) => ({
        ...prev,
        [model]: {
          ...prev[model],
          [field]: value === "" ? 0 : num,
        },
      }));
    },
    []
  );

  const apply = useCallback(() => {
    setModelPricing(draft);
  }, [draft]);

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultPricingForModels(allModels);
    setDraft(defaults);
    setModelPricing(defaults);
  }, [allModels]);

  // Auto-apply defaults on first load if pricing is empty
  useEffect(() => {
    if (allModels.length > 0 && Object.keys(modelPricing).length === 0) {
      const defaults = getDefaultPricingForModels(allModels);
      setModelPricing(defaults);
    }
  }, [allModels, modelPricing]);

  if (allModels.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-transparent">
          <Settings2 className="h-3.5 w-3.5" />
          Model Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Model Pricing</SheetTitle>
          <SheetDescription>
            Set the price per 1M tokens for each model detected in your session
            files. Cost estimates will update when you click Apply.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-5">
          {allModels.map((model) => {
            const price = draft[model] ?? {
              inputPerMillion: 0,
              outputPerMillion: 0,
              cacheReadPerMillion: 0,
            };
            return (
              <div key={model} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground font-mono truncate">
                  {model}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Input $/1M
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price.inputPerMillion}
                      onChange={(e) =>
                        updateField(model, "inputPerMillion", e.target.value)
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Output $/1M
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price.outputPerMillion}
                      onChange={(e) =>
                        updateField(model, "outputPerMillion", e.target.value)
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Cache $/1M
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price.cacheReadPerMillion}
                      onChange={(e) =>
                        updateField(
                          model,
                          "cacheReadPerMillion",
                          e.target.value
                        )
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 sticky bottom-0 bg-background py-3 border-t border-border">
          <Button onClick={apply} size="sm" className="flex-1">
            Apply Pricing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="gap-1.5 bg-transparent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
