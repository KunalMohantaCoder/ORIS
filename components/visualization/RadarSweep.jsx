"use client";

export default function RadarSweep({ warnings = [] }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-cyan-signal/15 bg-void/40">
      <div className="absolute inset-6 rounded-full border border-cyan-signal/20" />
      <div className="absolute inset-14 rounded-full border border-cyan-signal/15" />
      <div className="absolute inset-24 rounded-full border border-cyan-signal/10" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-signal/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-signal/10" />
      <div
        className="absolute inset-0 animate-[spin_5s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(94,231,255,0.22), rgba(94,231,255,0.02) 18%, transparent 34%)"
        }}
      />
      {warnings.slice(0, 10).map((warning, index) => {
        const left = 50 + Math.cos(index * 1.73) * (18 + index * 2.8);
        const top = 50 + Math.sin(index * 1.73) * (18 + index * 2.8);
        return (
          <span
            className="absolute h-2 w-2 rounded-full bg-critical shadow-danger"
            key={`${warning.objectA?.id || index}-${warning.objectB?.id || index}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            title={warning.riskLevel}
          />
        );
      })}
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <span>Conjunction radar</span>
        <span>{warnings.length} warnings</span>
      </div>
    </div>
  );
}
