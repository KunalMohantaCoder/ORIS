"use client";

import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { api } from "../../lib/api";
import MetricCard from "../ui/MetricCard";
import Panel from "../ui/Panel";
import StatusBadge from "../ui/StatusBadge";

export default function RiskLab({ objects = [] }) {
  const active = useMemo(() => objects.filter((object) => object.type === "active").slice(0, 180), [objects]);
  const hazards = useMemo(() => objects.filter((object) => object.type !== "active").slice(0, 180), [objects]);
  const [form, setForm] = useState({
    objectAId: active[0]?.id || "",
    objectBId: hazards[0]?.id || "",
    missDistanceKm: 12,
    relativeVelocityKmS: 11.2
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runSimulation(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = await api.post("/collision/simulate", form);
      setResult(payload.data);
    } finally {
      setLoading(false);
    }
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Panel eyebrow="Conjunction analysis" title="Collision Risk Simulator">
      <form className="grid gap-4 lg:grid-cols-2" onSubmit={runSimulation}>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Protected asset</span>
          <select
            className="w-full rounded-md border border-cyan-signal/15 bg-void/60 px-3 py-2 outline-none focus:border-cyan-signal/40"
            onChange={(event) => update("objectAId", event.target.value)}
            value={form.objectAId || active[0]?.id || ""}
          >
            {active.map((object) => (
              <option key={object.id} value={object.id}>
                {object.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Hazard object</span>
          <select
            className="w-full rounded-md border border-cyan-signal/15 bg-void/60 px-3 py-2 outline-none focus:border-cyan-signal/40"
            onChange={(event) => update("objectBId", event.target.value)}
            value={form.objectBId || hazards[0]?.id || ""}
          >
            {hazards.map((object) => (
              <option key={object.id} value={object.id}>
                {object.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Miss distance: {form.missDistanceKm} km</span>
          <input
            className="w-full accent-cyan-signal"
            max="100"
            min="0.1"
            onChange={(event) => update("missDistanceKm", Number(event.target.value))}
            step="0.1"
            type="range"
            value={form.missDistanceKm}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          <span>Relative velocity: {form.relativeVelocityKmS} km/s</span>
          <input
            className="w-full accent-critical"
            max="16"
            min="0.5"
            onChange={(event) => update("relativeVelocityKmS", Number(event.target.value))}
            step="0.1"
            type="range"
            value={form.relativeVelocityKmS}
          />
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-signal/30 bg-cyan-signal/10 px-4 py-3 text-sm font-semibold text-cyan-bright transition hover:bg-cyan-signal/15 lg:col-span-2"
          disabled={loading}
          type="submit"
        >
          <Zap className="h-4 w-4" />
          {loading ? "Computing risk" : "Run collision analysis"}
        </button>
      </form>

      {result && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <MetricCard detail="Heuristic conjunction score" label="Risk score" tone={result.riskLevel === "critical" ? "red" : "amber"} value={result.riskScore} />
          <MetricCard detail="Estimated event probability" label="Probability" tone="cyan" value={`${result.probabilityPercent}%`} />
          <MetricCard detail="Impact energy" label="Kinetic energy" tone="red" value={result.kineticEnergyJ.toExponential(2)} />
          <div className="glass-panel flex flex-col justify-center rounded-lg p-4">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Risk level</p>
            <StatusBadge status={result.riskLevel} />
          </div>
        </div>
      )}
    </Panel>
  );
}
