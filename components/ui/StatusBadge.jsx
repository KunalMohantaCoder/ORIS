import { cn } from "../../lib/classNames";

export default function StatusBadge({ status = "low", label }) {
  const tone = {
    low: "border-aurora/30 bg-aurora/10 text-aurora",
    medium: "border-warning/30 bg-warning/10 text-warning",
    elevated: "border-warning/30 bg-warning/10 text-warning",
    high: "border-critical/30 bg-critical/10 text-critical",
    critical: "border-critical/50 bg-critical/15 text-critical"
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]", tone[status] || tone.low)}>
      {label || status}
    </span>
  );
}
