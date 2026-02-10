"use client";

import { useState, useMemo } from "react";
import type { NormalizedEvent } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Search, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type SortKey = "timestamp" | "tokensTotal" | "cost" | "type" | "role";
type SortDir = "asc" | "desc";

function formatTs(ts: number | null): string {
  if (!ts) return "--";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false });
}

const ROLE_COLORS: Record<string, string> = {
  user: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  assistant: "bg-primary/20 text-primary border-primary/30",
  system: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  tool: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export function TimelineTable({ events }: { events: NormalizedEvent[] }) {
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const roles = useMemo(() => {
    const r = new Set(events.map((e) => e.role).filter(Boolean) as string[]);
    return Array.from(r);
  }, [events]);

  const filtered = useMemo(() => {
    let result = events;
    if (roleFilter !== "all") {
      result = result.filter((e) => e.role === roleFilter);
    }
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(
        (e) =>
          e.textPreview.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          (e.model ?? "").toLowerCase().includes(q) ||
          (e.provider ?? "").toLowerCase().includes(q) ||
          (e.role ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filter, roleFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "timestamp":
          cmp = (a.timestamp ?? 0) - (b.timestamp ?? 0);
          break;
        case "tokensTotal":
          cmp = a.tokensTotal - b.tokensTotal;
          break;
        case "cost":
          cmp = (a.rawCost ?? 0) - (b.rawCost ?? 0);
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "role":
          cmp = (a.role ?? "").localeCompare(b.role ?? "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleRow(idx: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter events..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {sorted.length} events
        </span>
      </div>

      {/* Table */}
      <ScrollArea className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b-border hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleSort("timestamp")}
                >
                  Time
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleSort("type")}
                >
                  Type
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleSort("role")}
                >
                  Role
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Model</TableHead>
              <TableHead className="hidden lg:table-cell">Provider</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleSort("tokensTotal")}
                >
                  Tokens
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleSort("cost")}
                  title="Raw cost value from the session file (may be unreliable)"
                >
                  Raw Cost
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden xl:table-cell">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((evt) => {
              const isExpanded = expandedRows.has(evt.index);
              return (
                <Collapsible key={evt.index} asChild open={isExpanded}>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow
                        className="cursor-pointer border-b-border transition-colors hover:bg-secondary/50"
                        onClick={() => toggleRow(evt.index)}
                      >
                        <TableCell className="w-10">
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {formatTs(evt.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {evt.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {evt.role && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${ROLE_COLORS[evt.role] ?? ""}`}
                            >
                              {evt.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[120px]">
                          {evt.model
                            ? (evt.model.split("/").pop() ?? evt.model)
                            : "--"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {evt.provider ?? "--"}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <span className="text-muted-foreground">
                            {evt.tokensIn}
                          </span>
                          <span className="text-border mx-1">/</span>
                          <span className="text-muted-foreground">
                            {evt.tokensOut}
                          </span>
                          <span className="text-border mx-1">/</span>
                          <span className="text-foreground font-medium">
                            {evt.tokensTotal}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {evt.rawCost !== null ? `$${evt.rawCost.toFixed(4)}` : "--"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                          {evt.textPreview || "--"}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="border-b-border bg-secondary/30">
                        <TableCell colSpan={9} className="p-4">
                          <div className="flex flex-col gap-3">
                            {evt.fullText && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-foreground">
                                  Content
                                </p>
                                <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-xs text-muted-foreground font-mono">
                                  {evt.fullText}
                                </pre>
                              </div>
                            )}
                            <div>
                              <p className="mb-1 text-xs font-medium text-foreground">
                                Raw JSON
                              </p>
                              <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-xs text-muted-foreground font-mono">
                                {JSON.stringify(evt.raw, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
