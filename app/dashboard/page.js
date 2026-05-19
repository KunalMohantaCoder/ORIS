"use client";

import { useEffect } from "react";
import { Expand, RadioTower, Satellite, ShieldAlert, Trash2 } from "lucide-react";
import ObjectTable from "../../components/dashboard/ObjectTable";
import MetricCard from "../../components/ui/MetricCard";
import Panel from "../../components/ui/Panel";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import OrbitalEarth from "../../components/visualization/OrbitalEarth";
import OrbitHeatmap from "../../components/visualization/OrbitHeatmap";
import StatusBadge from "../../components/ui/StatusBadge";
import { useOrisStore } from "../../store/useOrisStore";

export default function DashboardPage() {
  const { objects, summary, heatmap, filters, loading, error, setFilters, loadOrbital, meta } = useOrisStore();

  useEffect(() => {
    const timer = setTimeout(() => loadOrbital(), 180);
    return () => clearTimeout(timer);
  }, [filters, loadOrbital]);

  function fullscreen() {
    const target = document.getElementById("dashboard-surface");
    if (target?.requestFullscreen) target.requestFullscreen();
  }

  return (
    <div id="dashboard-surface" className="space-y-5">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Live orbital dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Earth-Centered Orbital Congestion Map</h1>
        </div>
        <button
          className="inline-flex items-center gap-2 self-start rounded-md border border-cyan-signal/25 px-3 py-2 text-xs font-medium text-cyan-bright transition hover:bg-cyan-signal/10"
          onClick={fullscreen}
          type="button"
        >
          <Expand className="h-4 w-4" />
          Fullscreen
        </button>
      </header>

      {error && <ErrorState message={error} />}
      {loading && objects.length === 0 ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Satellite} label="Active satellites" tone="green" value={summary?.activeSatellites?.toLocaleString() || "..."} />
            <MetricCard icon={RadioTower} label="Inactive satellites" tone="amber" value={summary?.inactiveSatellites?.toLocaleString() || "..."} />
            <MetricCard icon={Trash2} label="Orbital debris" tone="red" value={summary?.debrisObjects?.toLocaleString() || "..."} />
            <MetricCard icon={ShieldAlert} label="LEO crowding" value={`${summary?.leoCrowding || "..."}%`} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <Panel
              action={<StatusBadge status={summary?.riskPosture || "medium"} />}
              className="min-h-[560px] overflow-hidden p-0"
              eyebrow={meta?.mode || "data link"}
              title="3D Orbital Object Field"
            >
              <OrbitalEarth className="h-[520px] w-full" density="dense" objects={objects} />
            </Panel>
            <Panel eyebrow="Shell density" title="Orbital Heatmap">
              <OrbitHeatmap heatmap={heatmap} />
            </Panel>
          </div>

          <Panel eyebrow="Searchable catalog" title="Tracked Objects">
            <ObjectTable filters={filters} objects={objects} onFilters={setFilters} />
          </Panel>
        </>
      )}
    </div>
  );
}
