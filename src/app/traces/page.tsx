"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TraceWaterfall } from "@/components/TraceWaterfall";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Tag,
  Calendar,
  Zap,
  Clock,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { formatDuration, formatTokens, formatCurrency, formatDate } from "@/lib/utils";

export default function TracesPage() {
  const [traces, setTraces] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTraces = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAgent !== "all") params.set("agentId", selectedAgent);
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const [tracesRes, agentsRes] = await Promise.all([
        fetch(`/api/traces?${params.toString()}`),
        fetch("/api/agents"),
      ]);

      const tracesData = await tracesRes.json();
      const agentsData = await agentsRes.json();

      if (tracesData.success) {
        setTraces(tracesData.data);
        if (tracesData.data.length > 0) {
          setSelectedTrace(tracesData.data[0]);
        } else {
          setSelectedTrace(null);
        }
      }
      if (agentsData.success) setAgents(agentsData.data);
    } catch (err) {
      console.error("Traces load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, [selectedAgent, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTraces();
  };

  return (
    <div>
      <Header
        title="Traces & Spans Explorer"
        subtitle="End-to-end execution trees, tool invocations, and sub-second latency profiling"
        onRefresh={fetchTraces}
        isLoading={isLoading}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-[#1b2130] bg-[#0c0f17]">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 flex-1 min-w-[240px]"
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by trace name, ID, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#111520] border border-[#212738] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-3 rounded-md bg-[#161c29] border border-[#232b3d] text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-3">
            {/* Agent Selector */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Agent:</span>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="h-9 px-2.5 rounded-md bg-[#111520] border border-[#212738] text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Agents</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-2.5 rounded-md bg-[#111520] border border-[#212738] text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="SUCCESS">Success (200)</option>
                <option value="ERROR">Error (500)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Trace Waterfall View */}
        {selectedTrace ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border border-[#1b2130] bg-[#0c0f17]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-slate-100 font-mono">
                    {selectedTrace.name}
                  </h2>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {selectedTrace.traceId}
                  </span>
                  {selectedTrace.status === "SUCCESS" ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      SUCCESS
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                      FAILED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                  <span>Agent: {selectedTrace.agent?.name}</span>
                  <span>Model: {selectedTrace.agent?.model}</span>
                  <span>Tags: {selectedTrace.tags}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">TOTAL DURATION</span>
                  <span className="text-slate-200 font-semibold">
                    {formatDuration(selectedTrace.durationMs)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">TOTAL TOKENS</span>
                  <span className="text-slate-200 font-semibold">
                    {formatTokens(selectedTrace.totalTokens)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">EST. COST</span>
                  <span className="text-slate-200 font-semibold">
                    {formatCurrency(selectedTrace.costUsd)}
                  </span>
                </div>
              </div>
            </div>

            <TraceWaterfall
              traceName={selectedTrace.name}
              totalDurationMs={selectedTrace.durationMs}
              spans={selectedTrace.spans || []}
            />
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-[#1b2130] rounded-lg text-slate-400 font-mono text-xs">
            No traces matched current filters.
          </div>
        )}

        {/* Traces List Table */}
        <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d] flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Trace Telemetry Records ({traces.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#181d2a] bg-[#090b10] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Trace Name</th>
                  <th className="py-2.5 px-4">Trace ID</th>
                  <th className="py-2.5 px-4">Agent</th>
                  <th className="py-2.5 px-4">Spans</th>
                  <th className="py-2.5 px-4 text-right">Tokens</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Cost</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
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
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                            <XCircle className="w-2.5 h-2.5" />
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-100">
                        {trace.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{trace.traceId}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#141a27] text-slate-300 border border-[#202738]">
                          {trace.agent?.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {trace.spans?.length || 0}
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
                      <td className="py-3 px-4 text-right text-slate-400 text-[10px]">
                        {formatDate(trace.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
