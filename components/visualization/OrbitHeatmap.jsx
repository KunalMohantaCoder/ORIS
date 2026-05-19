import StatusBadge from "../ui/StatusBadge";

export default function OrbitHeatmap({ heatmap = [] }) {
  const max = Math.max(...heatmap.map((row) => row.riskScore || 0), 1);
  return (
    <div className="space-y-3">
      {heatmap.slice(0, 8).map((row) => {
        const intensity = Math.max(8, (row.riskScore / max) * 100);
        const status = row.riskScore > 80 ? "critical" : row.riskScore > 45 ? "high" : row.riskScore > 18 ? "medium" : "low";
        return (
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3" key={`${row.regime}-${row.band}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{row.regime} / {row.band}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {row.total} tracked objects, {row.debris} debris fragments
                </p>
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-cyan-signal"
                style={{ width: `${intensity}%`, boxShadow: "0 0 18px rgba(94,231,255,0.45)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
