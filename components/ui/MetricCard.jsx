import { cn } from "../../lib/classNames";

export default function MetricCard({ label, value, detail, tone = "cyan", icon: Icon }) {
  const tones = {
    cyan: "text-cyan-bright border-cyan-signal/25",
    green: "text-aurora border-aurora/25",
    amber: "text-warning border-warning/25",
    red: "text-critical border-critical/25",
    white: "text-white border-white/15"
  };

  return (
    <div className={cn("glass-panel rounded-lg border p-4", tones[tone])}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
        {Icon && <Icon className="h-4 w-4 opacity-80" />}
      </div>
      <p className="numeric mt-3 text-2xl font-semibold text-white">{value}</p>
      {detail && <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>}
    </div>
  );
}
