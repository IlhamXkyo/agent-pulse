"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  Bot,
  Plus,
  Activity,
  Cpu,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("claude-3-5-sonnet");
  const [version, setVersion] = useState("v1.0.0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error("Agents load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          model,
          version,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        fetchAgents();
      }
    } catch (err) {
      console.error("Create agent error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header
        title="Autonomous Agent Registry"
        subtitle="Active agent fleet deployment, version control, and telemetry health"
        onRefresh={fetchAgents}
        isLoading={isLoading}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Fleet Overview ({agents.length} Registered)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Managed execution endpoints and base foundation models
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Agent</span>
          </button>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-[#1b2130] bg-[#0c0f17] p-5 flex flex-col justify-between hover:border-[#28324a] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-[#131826] text-cyan-400 border border-[#1e2638]">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 font-mono">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {agent.version}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      agent.status === "ACTIVE"
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                        : "bg-slate-900 text-slate-400 border-slate-700/40"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {agent.description || "No description provided."}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                    {agent.model}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#161c29] grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">TOTAL RUNS</span>
                  <span className="font-semibold text-slate-200">
                    {agent.totalRuns.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SUCCESS</span>
                  <span className="font-semibold text-emerald-400">
                    {agent.successRate}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AVG LATENCY</span>
                  <span className="font-semibold text-slate-200">
                    {formatDuration(agent.avgLatency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register Agent */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#212738] bg-[#0c0f17] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d]">
              <div className="flex items-center gap-2 text-sm font-semibold font-mono text-slate-100">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Register New Agent</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="p-5 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CodeSynthesizer-Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities, tools, and execution domain..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Base Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none"
                  >
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="deepseek-r1">deepseek-r1</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="llama-3.3-70b">llama-3.3-70b</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full h-9 px-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1a1f2e] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-md border border-[#212738] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Save Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
