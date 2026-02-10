"use client";

import React from "react"

import type { FileStats } from "@/lib/types";
import { BentoCard, MagicBentoGrid } from "@/components/magic-bento-grid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GLOW_COLOR = "132, 0, 255";

const CHART_COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(190, 80%, 45%)",
  "hsl(330, 70%, 55%)",
  "hsl(45, 90%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(15, 80%, 55%)",
  "hsl(220, 70%, 55%)",
  "hsl(280, 60%, 55%)",
];

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

// ─── Tokens Over Time ───
function TokensOverTimeChart({ data }: { data: FileStats["tokensOverTime"] }) {
  if (data.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No timeline data</p>
    );

  // Cumulative
  let cumInput = 0;
  let cumOutput = 0;
  let cumTotal = 0;
  const cumulative = data.map((d) => {
    cumInput += d.input;
    cumOutput += d.output;
    cumTotal += d.total;
    return {
      timestamp: d.timestamp,
      input: cumInput,
      output: cumOutput,
      total: cumTotal,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={cumulative}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 10%, 20%)" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTime}
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <Tooltip
          contentStyle={{
            background: "hsl(260, 15%, 10%)",
            border: "1px solid hsl(260, 10%, 20%)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "hsl(0, 0%, 95%)",
          }}
          labelFormatter={(val) => formatTime(val as number)}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={false}
          animationDuration={1500}
        />
        <Line
          type="monotone"
          dataKey="input"
          stroke={CHART_COLORS[1]}
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
          animationDuration={1500}
        />
        <Line
          type="monotone"
          dataKey="output"
          stroke={CHART_COLORS[2]}
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
          animationDuration={1500}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "hsl(260, 5%, 55%)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Messages by Role ───
function RoleBreakdownChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  if (entries.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No role data</p>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={entries}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          animationDuration={1200}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
          fontSize={10}
        >
          {entries.map((_, i) => (
            <Cell
              key={`cell-${
                // biome-ignore lint: index ok for static
                i
              }`}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(260, 15%, 10%)",
            border: "1px solid hsl(260, 10%, 20%)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "hsl(0, 0%, 95%)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Model Usage ───
function ModelUsageChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, tokens]) => ({ name: name.split("/").pop() ?? name, tokens }));

  if (entries.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No model data</p>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={entries} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 10%, 20%)" />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <Tooltip
          contentStyle={{
            background: "hsl(260, 15%, 10%)",
            border: "1px solid hsl(260, 10%, 20%)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "hsl(0, 0%, 95%)",
          }}
        />
        <Bar
          dataKey="tokens"
          fill={CHART_COLORS[0]}
          radius={[0, 4, 4, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Provider Usage ───
function ProviderUsageChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, tokens]) => ({ name, tokens }));

  if (entries.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No provider data</p>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={entries}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 10%, 20%)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <Tooltip
          contentStyle={{
            background: "hsl(260, 15%, 10%)",
            border: "1px solid hsl(260, 10%, 20%)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "hsl(0, 0%, 95%)",
          }}
        />
        <Bar
          dataKey="tokens"
          fill={CHART_COLORS[1]}
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Latency Distribution ───
function LatencyChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={entries}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 10%, 20%)" />
        <XAxis
          dataKey="bucket"
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(260, 5%, 55%)" }}
          stroke="hsl(260, 10%, 20%)"
        />
        <Tooltip
          contentStyle={{
            background: "hsl(260, 15%, 10%)",
            border: "1px solid hsl(260, 10%, 20%)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "hsl(0, 0%, 95%)",
          }}
        />
        <Bar
          dataKey="count"
          fill={CHART_COLORS[2]}
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main Charts Grid ───
export function Charts({ stats }: { stats: FileStats }) {
  return (
    <MagicBentoGrid
      className="grid-cols-1 lg:grid-cols-2"
      glowColor={GLOW_COLOR}
    >
      <BentoCard glowColor={GLOW_COLOR} className="lg:col-span-2">
        <ChartTitle>Cumulative Tokens Over Time</ChartTitle>
        <TokensOverTimeChart data={stats.tokensOverTime} />
      </BentoCard>

      <BentoCard glowColor={GLOW_COLOR}>
        <ChartTitle>Messages by Role</ChartTitle>
        <RoleBreakdownChart data={stats.roleBreakdown} />
      </BentoCard>

      <BentoCard glowColor={GLOW_COLOR}>
        <ChartTitle>Model Usage (by tokens)</ChartTitle>
        <ModelUsageChart data={stats.modelBreakdown} />
      </BentoCard>

      <BentoCard glowColor={GLOW_COLOR}>
        <ChartTitle>Provider Usage (by tokens)</ChartTitle>
        <ProviderUsageChart data={stats.providerBreakdown} />
      </BentoCard>

      <BentoCard glowColor={GLOW_COLOR}>
        <ChartTitle>Inter-Message Latency</ChartTitle>
        <LatencyChart data={stats.latencyBuckets} />
      </BentoCard>
    </MagicBentoGrid>
  );
}
