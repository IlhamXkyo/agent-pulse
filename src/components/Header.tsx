"use client";

import { Search, Github, RefreshCw } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({ title, subtitle, onRefresh, isLoading }: HeaderProps) {
  const [timeRange, setTimeRange] = useState("24h");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-8 border-b border-[#1a1f2e] bg-[#090b10]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search traces, agents, models..."
            className="w-56 h-8 pl-8 pr-3 text-xs bg-[#111520] border border-[#212738] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Time Filter */}
        <div className="flex items-center rounded-md border border-[#212738] bg-[#111520] p-0.5 text-xs font-mono">
          {["15m", "1h", "24h", "7d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                timeRange === range
                  ? "bg-[#1f2638] text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center justify-center h-8 w-8 rounded-md border border-[#212738] bg-[#111520] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors disabled:opacity-50"
            title="Refresh telemetry"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        )}

        {/* GitHub link */}
        <a
          href="https://github.com/IlhamXkyo/agent-pulse"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-[#212738] bg-[#111520] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs font-mono"
        >
          <Github className="w-3.5 h-3.5" />
          <span>IlhamXkyo</span>
        </a>
      </div>
    </header>
  );
}
