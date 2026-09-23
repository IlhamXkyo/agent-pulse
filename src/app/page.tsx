"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { TraceWaterfall, SpanItem } from "@/components/TraceWaterfall";
import {
  Activity,
  Layers,
  Bot,
  Zap,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDuration, formatTokens, formatCurrency, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, tracesRes, agentsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/traces?limit=10"),
        fetch("/api/agents"),
      ]);

      const statsData = await statsRes.json();
      const tracesData = await tracesRes.json();
      const agentsData = await agentsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (tracesData.success) {
        setTraces(tracesData.data);
        if (tracesData.data.length > 0 && !selectedTrace) {
          setSelectedTrace(tracesData.data[0]);
        }
      }
      if (agentsData.success) setAgents(agentsData.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Header
        title="Agent Telemetry Overview"
        subtitle="Global autonomous agent execution traces & real-time latency waterfall"
        onRefresh={fetchData}
        isLoading={isLoading}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Traces"
            value={stats ? stats.totalTraces.toLocaleString() : "..."}
            subValue="executions logged"
            change="+14.2%"
            isPositive={true}
            icon={Layers}
            iconColor="text-cyan-400"
          />
          <MetricCard
            label="Active Agents"
            value={stats ? stats.activeAgents.toString() : "..."}
            subValue="online in cluster"
            change="All healthy"
            isPositive={true}
            icon={Bot}
            iconColor="text-indigo-400"
          />
          <MetricCard
            label="Tokens Consumed"
            value={stats ? formatTokens(stats.totalTokens) : "..."}
            subValue={`Est. ${stats ? formatCurrency(stats.totalCost) : "$0.00"}`}
            change="+8.6%"
            isPositive={true}
            icon={Zap}
            iconColor="text-amber-400"
          />
          <MetricCard
            label="P95 Latency"
            value={stats ? formatDuration(stats.p95Latency) : "..."}
            subValue={`Avg: ${stats ? formatDuration(stats.avgLatency) : "..."}`}
            change={stats ? `Error rate ${stats.errorRate}` : "..."}
            isPositive={stats ? parseFloat(stats.errorRate) < 5 : true}
            icon={Activity}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Featured Live Trace Waterfall Section */}
        {selectedTrace && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-subtle-pulse" />
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Live Trace Timeline: {selectedTrace.name}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  [{selectedTrace.traceId}]
                </span>
              </div>
              <Link
                href="/traces"
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>View all traces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <TraceWaterfall
              traceName={selectedTrace.name}
              totalDurationMs={selectedTrace.durationMs}
              spans={selectedTrace.spans || []}
            />
          </div>
        )}

        {/* Two-column layout: Recent Traces Table & Agent Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Traces Table (2 Cols) */}
          <div className="lg:col-span-2 rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  Recent Telemetry Streams
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-synced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#181d2a] bg-[#090b10] text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Trace / Workflow</th>
                    <th className="py-2.5 px-4">Agent</th>
                    <th className="py-2.5 px-4 text-right">Tokens</th>
                    <th className="py-2.5 px-4 text-right">Latency</th>
                    <th className="py-2.5 px-4 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151924]">
                  {traces.map((trace) => {
                    const isCurrent = selectedTrace?.id === trace.id;
                    return (
                      <tr
                        key={trace.id}
                        onClick={() => setSelectedTrace(trace)}
                        className={`cursor-pointer transition-colors ${
                          isCurrent
                            ? "bg-[#141926] text-cyan-300"
                            : "hover:bg-[#0f131d] text-slate-300"
                        }`}
                      >
                        <td className="py-3 px-4">
                          {trace.status === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              200 OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                              <XCircle className="w-2.5 h-2.5" />
                              FAIL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-100 truncate max-w-[200px]">
                            {trace.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {trace.traceId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#141a27] text-slate-300 border border-[#202738]">
                            {trace.agent?.name || "Anonymous"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatTokens(trace.totalTokens)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatDuration(trace.durationMs)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {formatCurrency(trace.costUsd)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Agents Snapshot (1 Col) */}
          <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d]">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                    Agent Cluster
                  </h3>
                </div>
                <Link
                  href="/agents"
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Manage
                </Link>
              </div>

              <div className="p-4 space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-md border border-[#181d2a] bg-[#0a0d14] hover:border-[#232b3d] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 font-mono">
                        {agent.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {agent.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-[#141824]">
                      <span className="text-indigo-400">{agent.model}</span>
                      <span>{agent.totalRuns.toLocaleString()} runs</span>
                      <span className="text-emerald-400">
                        {agent.successRate}% SR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playground Callout Banner */}
            <div className="p-4 border-t border-[#1a1f2e] bg-[#0e111a] m-3 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Interactive Simulator
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Trigger mock executions with live telemetry
                </p>
              </div>
              <Link
                href="/playground"
                className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition-colors shrink-0"
              >
                Launch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
