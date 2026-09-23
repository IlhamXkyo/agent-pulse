"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TraceWaterfall } from "@/components/TraceWaterfall";
import {
  PlaySquare,
  Sparkles,
  Bot,
  Zap,
  Globe,
  Terminal,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDuration, formatTokens, formatCurrency } from "@/lib/utils";

const PRESETS = [
  {
    title: "Code Refactor & Redis Cache",
    prompt: "Refactor user authentication service to support Redis blacklist session revocation with 1-hour TTL and automated unit test suite.",
    tools: { search: false, code: true },
  },
  {
    title: "Market Synthesis & Web Retrieval",
    prompt: "Analyze global semiconductor packaging bottlenecks for HBM3e memory across major foundries and synthesize CapEx guidance for Q3.",
    tools: { search: true, code: false },
  },
  {
    title: "Dependency Security Audit",
    prompt: "Scan package-lock dependencies for CVE vulnerabilities with CVSS score above 8.0 and draft patch mitigations.",
    tools: { search: true, code: true },
  },
];

export default function PlaygroundPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [model, setModel] = useState("claude-3-5-sonnet");
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [enableCodeExec, setEnableCodeExec] = useState(true);
  const [temperature, setTemperature] = useState(0.2);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setAgents(data.data);
          setSelectedAgentId(data.data[0].id);
        }
      });
  }, []);

  const handleRun = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setRunResult(null);

    try {
      const res = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          prompt,
          model,
          enableWebSearch,
          enableCodeExec,
          temperature,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRunResult(data.data);
      }
    } catch (err) {
      console.error("Playground run error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setPrompt(preset.prompt);
    setEnableWebSearch(preset.tools.search);
    setEnableCodeExec(preset.tools.code);
  };

  return (
    <div>
      <Header
        title="Agent Execution Playground"
        subtitle="Simulate autonomous workflows, tool calls, and inspect generated spans in real-time"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Presets banner */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded border border-[#212738] bg-[#0c0f17] text-[11px] font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Configuration & Prompt Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Prompt & Tool Config */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Agent Instruction Prompt
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {prompt.length} chars
                </span>
              </div>

              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter autonomous agent mission instruction..."
                className="w-full p-3.5 bg-[#090b10] border border-[#212738] rounded-md text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />

              {/* Tool Execution Switches */}
              <div className="mt-4 pt-4 border-t border-[#181d2a] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableWebSearch}
                      onChange={(e) => setEnableWebSearch(e.target.checked)}
                      className="rounded bg-[#111520] border-[#212738] text-cyan-500 focus:ring-0"
                    />
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Web Search Tool</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableCodeExec}
                      onChange={(e) => setEnableCodeExec(e.target.checked)}
                      className="rounded bg-[#111520] border-[#212738] text-cyan-500 focus:ring-0"
                    />
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Python Sandbox</span>
                  </label>
                </div>

                <button
                  onClick={handleRun}
                  disabled={isRunning || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-semibold shadow-md shadow-cyan-950/40 transition-all disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Workflow...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Execute Agent Run</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Model and Agent selector */}
          <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] p-5 space-y-4 text-xs font-mono">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Execution Profile
            </h3>

            <div>
              <label className="block text-slate-400 mb-1.5">Target Agent</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full h-9 px-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.version})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">LLM Foundation Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-9 px-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none"
              >
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="deepseek-r1">deepseek-r1</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1.5">
                <span>Temperature</span>
                <span className="text-cyan-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-[#181d2a] text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Telemetry Ingest:</span>
                <span className="text-emerald-400 font-semibold">SQLite Active</span>
              </div>
              <div className="flex justify-between">
                <span>Span Tree:</span>
                <span className="text-slate-300">Auto-recorded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulation Output & Waterfall Result */}
        {runResult && (
          <div className="space-y-4 pt-4 border-t border-[#1b2130]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-semibold font-mono text-slate-100">
                    Execution Finished: {runResult.trace.traceId}
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    Recorded {runResult.trace.spans?.length || 0} spans to SQLite telemetry store.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">TIME</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatDuration(runResult.executionTimeMs)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TOKENS</span>
                  <span className="text-slate-200 font-semibold">
                    {formatTokens(runResult.tokens)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COST</span>
                  <span className="text-slate-200 font-semibold">
                    {formatCurrency(runResult.costUsd)}
                  </span>
                </div>
                <Link
                  href="/traces"
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#161c29] border border-[#242d40] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>All Traces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <TraceWaterfall
              traceName={runResult.trace.name}
              totalDurationMs={runResult.trace.durationMs}
              spans={runResult.trace.spans || []}
            />
          </div>
        )}
      </div>
    </div>
  );
}
