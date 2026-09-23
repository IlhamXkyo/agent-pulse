"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Clock,
  Sparkles,
  Wrench,
  Search,
  Workflow,
  CheckCircle2,
  XCircle,
  Code2,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export interface SpanItem {
  id: string;
  name: string;
  spanType: string;
  status: string;
  startOffsetMs: number;
  durationMs: number;
  input: string;
  output: string;
  model?: string | null;
  tokens?: number | null;
}

export interface TraceWaterfallProps {
  traceName: string;
  totalDurationMs: number;
  spans: SpanItem[];
}

export function TraceWaterfall({
  traceName,
  totalDurationMs,
  spans,
}: TraceWaterfallProps) {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(
    spans.length > 0 ? spans[0].id : null
  );

  const getSpanTypeBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case "LLM":
        return {
          bg: "bg-indigo-950/60 text-indigo-400 border-indigo-800/40",
          bar: "bg-indigo-500",
          icon: Sparkles,
        };
      case "TOOL":
        return {
          bg: "bg-amber-950/60 text-amber-400 border-amber-800/40",
          bar: "bg-amber-500",
          icon: Wrench,
        };
      case "RETRIEVAL":
        return {
          bg: "bg-cyan-950/60 text-cyan-400 border-cyan-800/40",
          bar: "bg-cyan-500",
          icon: Search,
        };
      case "CHAIN":
      default:
        return {
          bg: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
          bar: "bg-emerald-500",
          icon: Workflow,
        };
    }
  };

  const selectedSpan = spans.find((s) => s.id === selectedSpanId);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left / Top: Waterfall Timeline Chart */}
      <div className="flex-1 rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
        {/* Header timeline scale */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1f2e] bg-[#0f131d] text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">{traceName}</span>
            <span className="text-slate-400">({spans.length} spans)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>0ms</span>
            <span>{formatDuration(Math.round(totalDurationMs * 0.5))}</span>
            <span className="text-cyan-400 font-semibold">
              {formatDuration(totalDurationMs)}
            </span>
          </div>
        </div>

        {/* Spans List */}
        <div className="divide-y divide-[#151924]">
          {spans.map((span) => {
            const isSelected = span.id === selectedSpanId;
            const badge = getSpanTypeBadge(span.spanType);
            const Icon = badge.icon;

            // Calculate percentage positions for the waterfall bar
            const leftPercent =
              totalDurationMs > 0
                ? Math.min(
                    100,
                    Math.max(0, (span.startOffsetMs / totalDurationMs) * 100)
                  )
                : 0;
            const widthPercent =
              totalDurationMs > 0
                ? Math.max(
                    3,
                    Math.min(
                      100 - leftPercent,
                      (span.durationMs / totalDurationMs) * 100
                    )
                  )
                : 10;

            return (
              <div
                key={span.id}
                onClick={() => setSelectedSpanId(span.id)}
                className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#141926] border-l-2 border-cyan-400"
                    : "hover:bg-[#0f131d]"
                }`}
              >
                {/* Span details info */}
                <div className="flex items-center gap-2.5 sm:w-1/2 min-w-0 pr-2">
                  {span.status === "OK" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badge.bg}`}
                  >
                    <Icon className="w-3 h-3" />
                    {span.spanType}
                  </span>

                  <span className="text-xs font-mono text-slate-200 truncate font-medium">
                    {span.name}
                  </span>
                </div>

                {/* Waterfall Visual Bar */}
                <div className="flex-1 sm:w-1/2 flex items-center gap-3 mt-2 sm:mt-0">
                  <div className="relative w-full h-4 bg-[#11141c] rounded overflow-hidden">
                    <div
                      className={`absolute top-0 bottom-0 rounded transition-all opacity-85 hover:opacity-100 ${badge.bar}`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 w-16 text-right shrink-0">
                    {formatDuration(span.durationMs)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Span Payload & Inspection Drawer */}
      <div className="w-full lg:w-96 rounded-lg border border-[#1b2130] bg-[#0c0f17] flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-2.5 border-b border-[#1a1f2e] bg-[#0f131d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-medium text-slate-200">
              Span Inspector
            </span>
          </div>
          {selectedSpan && (
            <span className="text-[10px] font-mono text-slate-400">
              {formatDuration(selectedSpan.durationMs)}
            </span>
          )}
        </div>

        {selectedSpan ? (
          <div className="p-4 space-y-4 overflow-y-auto max-h-[460px] text-xs font-mono">
            {/* Meta details */}
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#1a1f2e] text-[11px]">
              <div>
                <span className="text-slate-400">Span ID:</span>
                <p className="text-slate-200 truncate">{selectedSpan.id}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p
                  className={
                    selectedSpan.status === "OK"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }
                >
                  {selectedSpan.status}
                </p>
              </div>
              {selectedSpan.model && (
                <div>
                  <span className="text-slate-400">Model:</span>
                  <p className="text-cyan-400">{selectedSpan.model}</p>
                </div>
              )}
              {selectedSpan.tokens !== null &&
                selectedSpan.tokens !== undefined &&
                selectedSpan.tokens > 0 && (
                  <div>
                    <span className="text-slate-400">Tokens:</span>
                    <p className="text-indigo-400">{selectedSpan.tokens}</p>
                  </div>
                )}
            </div>

            {/* Input payload */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold uppercase">
                Input Payload
              </span>
              <pre className="p-2.5 rounded bg-[#07090e] border border-[#171b26] text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(selectedSpan.input),
                      null,
                      2
                    );
                  } catch {
                    return selectedSpan.input;
                  }
                })()}
              </pre>
            </div>

            {/* Output payload */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1 font-semibold uppercase">
                Output Payload
              </span>
              <pre className="p-2.5 rounded bg-[#07090e] border border-[#171b26] text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(selectedSpan.output),
                      null,
                      2
                    );
                  } catch {
                    return selectedSpan.output;
                  }
                })()}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Select a span on the timeline to inspect metadata, input prompts, and outputs.
          </div>
        )}
      </div>
    </div>
  );
}
