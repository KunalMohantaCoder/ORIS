"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { KesslerChart } from "../charts/PredictionCharts";
import MetricCard from "../ui/MetricCard";
import Panel from "../ui/Panel";

export default function KesslerSimulation() {
  const [form, setForm] = useState({
    years: 35,
    annualLaunches: 260,
    mitigationRate: 0.18,
    collisionGrowthFactor: 0.045
  });
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runSimulation(payload = form) {
    setLoading(true);
    try {
      const response = await api.post("/kessler/simulate", payload);
      setSimulation(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const terminal = simulation?.terminalState;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel eyebrow="Scenario controls" title="Kessler Chain-Reaction Model">
        <div className="space-y-5">
          <label className="block text-sm text-slate-300">
            Forecast horizon: {form.years} years
            <input className="mt-2 w-full accent-cyan-signal" max="80" min="5" onChange={(event) => update("years", Number(event.target.value))} type="range" value={form.years} />
          </label>
          <label className="block text-sm text-slate-300">
            Annual launches: {form.annualLaunches}
            <input className="mt-2 w-full accent-cyan-signal" max="650" min="40" onChange={(event) => update("annualLaunches", Number(event.target.value))} type="range" value={form.annualLaunches} />
          </label>
          <label className="block text-sm text-slate-300">
            Mitigation rate: {Math.round(form.mitigationRate * 100)}%
            <input className="mt-2 w-full accent-aurora" max="0.9" min="0" onChange={(event) => update("mitigationRate", Number(event.target.value))} step="0.01" type="range" value={form.mitigationRate} />
          </label>
          <label className="block text-sm text-slate-300">
            Collision growth factor: {form.collisionGrowthFactor}
            <input className="mt-2 w-full accent-critical" max="0.16" min="0.005" onChange={(event) => update("collisionGrowthFactor", Number(event.target.value))} step="0.005" type="range" value={form.collisionGrowthFactor} />
          </label>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-signal/25 bg-cyan-signal/10 px-4 py-3 text-sm font-semibold text-cyan-bright transition hover:bg-cyan-signal/15"
            onClick={() => runSimulation()}
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Run scenario
          </button>
        </div>
      </Panel>

      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Terminal debris" tone="red" value={terminal?.debrisObjects?.toLocaleString() || "..."} />
          <MetricCard label="Active assets" tone="cyan" value={terminal?.activeAssets?.toLocaleString() || "..."} />
          <MetricCard label="Sustainability index" tone="green" value={terminal?.sustainabilityIndex || "..."} />
        </div>
        <Panel eyebrow="Animated spread" title="Collision Cascade Visualization">
          <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-cyan-signal/15 bg-void/50">
              <div className="absolute inset-10 rounded-full border border-cyan-signal/15" />
              <div className="absolute inset-20 rounded-full border border-cyan-signal/10" />
              {(simulation?.eventStream || []).map((event) => (
                <span
                  className="absolute h-2 w-2 animate-ping rounded-full bg-critical"
                  key={event.id}
                  style={{
                    left: `${50 + Math.cos((event.angle * Math.PI) / 180) * Math.min(event.radius, 42)}%`,
                    top: `${50 + Math.sin((event.angle * Math.PI) / 180) * Math.min(event.radius, 42)}%`,
                    animationDuration: `${Math.max(1.2, 4 - event.intensity / 35)}s`
                  }}
                />
              ))}
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-signal/40 bg-cyan-signal/20 shadow-glow" />
            </div>
            <KesslerChart series={simulation?.series || []} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
