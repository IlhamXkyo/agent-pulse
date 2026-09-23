import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  change,
  isPositive = true,
  icon: Icon,
  iconColor = "text-cyan-400",
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#1b2130] bg-[#0c0f17] p-4 shadow-sm hover:border-[#28324a] transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <div className={cn("p-1.5 rounded-md bg-[#141a27]", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-mono text-slate-400">{subValue}</span>
        )}
      </div>

      {change && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono">
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {change}
          </span>
          <span className="text-slate-400">vs previous period</span>
        </div>
      )}

      {/* Decorative subtle corner glow on hover */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
    </div>
  );
}
