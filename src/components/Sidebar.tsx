"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  Bot,
  PlaySquare,
  ShieldCheck,
  KeyRound,
  Terminal,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: Activity },
  { name: "Traces & Spans", href: "/traces", icon: Layers },
  { name: "Agent Registry", href: "/agents", icon: Bot },
  { name: "Playground", href: "/playground", icon: PlaySquare },
  { name: "Evaluations", href: "/evals", icon: ShieldCheck },
  { name: "API Keys", href: "/settings", icon: KeyRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#1a1f2e] bg-[#090b10] flex flex-col justify-between select-none">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1a1f2e]">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50">
            <Cpu className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="font-semibold tracking-wider text-sm text-slate-100 uppercase">
              Agent<span className="text-cyan-400">Pulse</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              LIVE TELEMETRY
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Platform Engine
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150",
                    isActive
                      ? "bg-[#141824] text-cyan-400 border border-cyan-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#0f131d]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-cyan-400" : "text-slate-400"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status / Terminal widget at bottom */}
      <div className="p-4 border-t border-[#1a1f2e] bg-[#07080c]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            Ingest Node
          </span>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            200 OK
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono flex flex-col gap-0.5">
          <div className="flex justify-between">
            <span>Buffer rate:</span>
            <span className="text-slate-300">48 events/s</span>
          </div>
          <div className="flex justify-between">
            <span>Runtime:</span>
            <span className="text-slate-300">Edge-local SQLite</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
