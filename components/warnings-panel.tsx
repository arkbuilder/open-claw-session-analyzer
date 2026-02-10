"use client";

import { AlertTriangle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function WarningsPanel({ warnings }: { warnings: string[] }) {
  const [open, setOpen] = useState(false);

  if (warnings.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-xl border border-chart-4/30 bg-chart-4/10 px-4 py-3 text-left transition-colors hover:bg-chart-4/15">
        <AlertTriangle className="h-4 w-4 shrink-0 text-chart-4" />
        <span className="flex-1 text-sm font-medium text-chart-4">
          {warnings.length} parsing warning{warnings.length !== 1 ? "s" : ""}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-chart-4" />
        ) : (
          <ChevronDown className="h-4 w-4 text-chart-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-chart-4/20 bg-card p-3">
          {warnings.map((w, i) => (
            <p
              key={`warning-${
                // biome-ignore lint: index ok
                i
              }`}
              className="text-xs text-muted-foreground py-0.5"
            >
              {w}
            </p>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
