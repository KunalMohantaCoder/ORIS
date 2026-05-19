"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShieldCheck, Recycle, ThermometerSun } from "lucide-react";
import { SustainabilityCharts } from "../../components/charts/PredictionCharts";
import OrbitHeatmap from "../../components/visualization/OrbitHeatmap";
import MetricCard from "../../components/ui/MetricCard";
import Panel from "../../components/ui/Panel";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../lib/api";

export default function SustainabilityPage() {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    api.get("/sustainability/forecast").then((payload) => setForecast(payload.data));
  }, []);

  if (!forecast) return <LoadingState label="Projecting orbital sustainability" />;

  const terminal = forecast.forecast[forecast.forecast.length - 1];

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Future orbital sustainability center</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Launch Trend, Congestion, and Mitigation Forecasts</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={TrendingUp} label="Launch growth" tone="amber" value={`${forecast.launchGrowthPercent}%`} />
        <MetricCard icon={ThermometerSun} label="Future congestion" tone="red" value={terminal.congestionRisk} />
        <MetricCard icon={Recycle} label="Future debris" tone="red" value={terminal.debrisObjects.toLocaleString()} />
        <MetricCard icon={ShieldCheck} label="Sustainability index" tone="green" value={terminal.sustainabilityIndex} />
      </div>
      <SustainabilityCharts data={forecast} />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel eyebrow="Orbital congestion heatmap" title="Sustainability Pressure Zones">
          <OrbitHeatmap heatmap={forecast.heatmap} />
        </Panel>
        <Panel eyebrow="Recommendations" title="Risk Reduction Priorities">
          <div className="space-y-3">
            {forecast.recommendations.map((item) => (
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4" key={item.title}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <StatusBadge status={item.priority === "Critical" ? "critical" : item.priority === "High" ? "high" : "medium"} label={item.priority} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.impact}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
