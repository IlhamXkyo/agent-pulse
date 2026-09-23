"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Terminal,
  Shield,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [scopes, setScopes] = useState("traces:write,agents:read");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (err) {
      console.error("Fetch keys error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName.trim(),
          scopes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewlyCreatedKey(data.data.rawKey);
        fetchKeys();
      }
    } catch (err) {
      console.error("Create key error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Ingest calls using it will fail.")) {
      return;
    }

    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
      }
    } catch (err) {
      console.error("Revoke key error:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div>
      <Header
        title="API Keys & Telemetry Configuration"
        subtitle="Manage secure ingest credentials and external OpenTelemetry SDK integrations"
        onRefresh={fetchKeys}
        isLoading={isLoading}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Keys Section */}
        <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1f2e] bg-[#0f131d] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Active Ingest API Keys ({keys.length})
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Keys authenticate POST requests to /api/traces from external agent runners
              </p>
            </div>

            <button
              onClick={() => {
                setNewlyCreatedKey(null);
                setKeyName("");
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Key</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#181d2a] bg-[#090b10] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Key Name</th>
                  <th className="py-2.5 px-4">Prefix</th>
                  <th className="py-2.5 px-4">Scopes</th>
                  <th className="py-2.5 px-4">Last Used</th>
                  <th className="py-2.5 px-4">Created</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151924]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#0f131d] text-slate-300">
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {k.name}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-medium">
                      {k.keyPrefix}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#141a27] text-slate-300 border border-[#202738]">
                        {k.scopes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {formatDate(k.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration Code Snippet Guide */}
        <div className="rounded-lg border border-[#1b2130] bg-[#0c0f17] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                Send Telemetry Spans via cURL
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              OpenTelemetry Compatible
            </span>
          </div>

          <div className="p-5">
            <pre className="p-4 rounded-md bg-[#07090e] border border-[#171b26] text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`curl -X POST https://your-agentpulse.domain/api/traces \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ap_live_your_token_here" \\
  -d '{
    "agentId": "clx_autocoder",
    "name": "ProductionCodeRefactorWorkflow",
    "status": "SUCCESS",
    "durationMs": 1420,
    "promptTokens": 1200,
    "completionTokens": 640,
    "costUsd": 0.0124,
    "tags": "production,auth",
    "spans": [
      {
        "name": "llm_generate:claude-3-5-sonnet",
        "spanType": "LLM",
        "status": "OK",
        "startOffsetMs": 120,
        "durationMs": 950,
        "input": "{\\"prompt\\": \\"Write Redis TTL logic\\"}",
        "output": "{\\"diff\\": \\"+ await redis.set(...) \\"}"
      }
    ]
  }'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Modal: Generate API Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[#212738] bg-[#0c0f17] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1f2e] bg-[#0f131d]">
              <div className="flex items-center gap-2 text-sm font-semibold font-mono text-slate-100">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Create Ingest API Key</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="p-5 space-y-4 text-xs font-mono">
                <div className="p-3 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                  API Key created! Copy this key now as it will not be shown again.
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-[#080a10] border border-[#212738] rounded-md">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey}
                    className="w-full bg-transparent text-cyan-300 text-xs font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="p-1.5 rounded hover:bg-[#151a26] text-slate-300 transition-colors"
                  >
                    {hasCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="p-5 space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 mb-1">Key Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Ingest Cluster"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Permissions & Scopes</label>
                  <select
                    value={scopes}
                    onChange={(e) => setScopes(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#111520] border border-[#212738] rounded-md text-slate-200 focus:outline-none"
                  >
                    <option value="traces:write,agents:read">traces:write, agents:read (Standard Ingest)</option>
                    <option value="read,write,admin">read, write, admin (Full Management)</option>
                    <option value="traces:write,evals:write">traces:write, evals:write (Evaluation Pipeline)</option>
                  </select>
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
                    {isSubmitting ? "Creating..." : "Generate Secret Key"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
