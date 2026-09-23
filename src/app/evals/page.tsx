"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function EvalsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/evals");
      const data = await res.json();
      if (data.success) {
        setEvaluations(data.data.evaluations);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error("Evals load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvals();
  }, []);

  return (
    <div>
      <Header
        title="Evaluations & Benchmark Suite"
        subtitle="Automated LLM-as-a-Judge grading, hallucination detection, and compliance scoring"
        onRefresh={fetchEvals}
        isLoading={isLoading}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Benchmark Pass Rate"
            value={stats ? stats.passRate : "..."}
            subValue={`${stats ? stats.passed : 0} / ${stats ? stats.total : 0} passed`}
            change="+4.2%"
            isPositive={true}
            icon={ShieldCheck}
            iconColor="text-emerald-400"
          />
          <MetricCard
            label="Average Quality Score"
            value={stats ? `${(parseFloat(stats.avgScore) * 100).toFixed(0)}%` : "..."}
            subValue="Target: >90%"
            change="Exceeding threshold"
            isPositive={true}
            icon={Award}
            iconColor="text-indigo-400"
          />
          <MetricCard
            label="Hallucination Risk"
            value="3.8%"
            subValue="Calculated over 14.2k tokens"
            change="-1.2% reduction"
            isPositive={true}
            icon={Zap}
            iconColor="text-cyan-400"
          />
          <MetricCard
            label="Total Audited Traces"
            value={stats ? stats.total.toString() : "..."}
            subValue="Continuous evaluation"
            change="Real-time"
            isPositive={true}
            icon={Layers}
            iconColor="text-amber-400"
          />
        </div>

        {/* Benchmark Results Table */}
        <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d] flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Evaluation Runs & Feedback ({evaluations.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              LLM-as-a-Judge + Rule-Based
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#181d2a] bg-[#090b10] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-4">Metric</th>
                  <th className="py-2.5 px-4">Trace Reference</th>
                  <th className="py-2.5 px-4">Agent</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Evaluator</th>
                  <th className="py-2.5 px-4">Evaluation Feedback</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151924]">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#0f131d] transition-colors text-slate-300">
                    <td className="py-3 px-4">
                      {ev.passed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                          <XCircle className="w-2.5 h-2.5" />
                          FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {ev.metricName}
                    </td>
                    <td className="py-3 px-4">
                      {ev.trace ? (
                        <Link
                          href="/traces"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>{ev.trace.traceId}</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#141a27] text-slate-300 border border-[#202738]">
                        {ev.trace?.agent?.name || "System"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={
                          ev.score >= 0.8
                            ? "text-emerald-400"
                            : ev.score >= 0.5
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {(ev.score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {ev.evaluator}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-300 truncate">
                      {ev.feedback || "Criteria satisfied."}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[10px]">
                      {formatDate(ev.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
