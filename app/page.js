"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Database, Orbit, Radar, Recycle } from "lucide-react";
import MetricCard from "../components/ui/MetricCard";
import OrbitalEarth from "../components/visualization/OrbitalEarth";
import Panel from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { useOrisStore } from "../store/useOrisStore";

export default function LandingPage() {
  const { objects, summary, loadOrbital } = useOrisStore();

  useEffect(() => {
    loadOrbital();
  }, [loadOrbital]);

  return (
    <div>
      <section className="relative min-h-[86vh] overflow-hidden rounded-lg border border-cyan-signal/10 bg-void/70 scanline">
        <OrbitalEarth className="absolute inset-0 h-full w-full opacity-90" controls={false} density="dense" objects={objects} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,9,20,0.96),rgba(5,9,20,0.66)_42%,rgba(5,9,20,0.20))]" />
        <div className="relative z-10 flex min-h-[86vh] max-w-7xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-14">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Orbital risk intelligence system</p>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
            ORIS
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A scientific command platform for orbital congestion, collision risk, debris-chain simulation, and sustainable space infrastructure.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-cyan-signal/30 bg-cyan-signal/10 px-4 py-3 text-sm font-semibold text-cyan-bright transition hover:bg-cyan-signal/20"
              href="/dashboard"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-signal/30 hover:text-cyan-bright"
              href="/collision"
            >
              Analyze risk
            </Link>
          </div>
          <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Orbit} label="Tracked objects" value={summary?.totalObjects?.toLocaleString() || "..."} />
            <MetricCard icon={Radar} label="Debris pressure" tone="red" value={`${summary?.debrisPressure || "..."}%`} />
            <MetricCard icon={Database} label="Active satellites" tone="green" value={summary?.activeSatellites?.toLocaleString() || "..."} />
            <MetricCard icon={Recycle} label="Risk posture" tone="amber" value={summary?.riskPosture || "..."} />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Panel eyebrow="Mission overview" title="Scientific Monitoring Surface">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["LEO", summary?.byRegime?.LEO || 0, "Dense low-altitude operations"],
              ["MEO", summary?.byRegime?.MEO || 0, "Navigation constellation layer"],
              ["GEO", summary?.byRegime?.GEO || 0, "Communications and weather belt"]
            ].map(([layer, count, detail]) => (
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4" key={layer}>
                <p className="font-mono text-xs text-cyan-bright">{layer}</p>
                <p className="numeric mt-2 text-3xl font-semibold">{count}</p>
                <p className="mt-2 text-sm text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel eyebrow="Current signal" title="Operational Posture">
          <div className="flex items-center justify-between gap-4">
            <StatusBadge status={summary?.riskPosture || "medium"} />
            <p className="text-right font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
              {summary?.updatedAt ? new Date(summary.updatedAt).toLocaleString() : "Awaiting feed"}
            </p>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-300">
            ORIS merges free public orbital feeds with local fallback datasets, then normalizes object classes, shells,
            velocity estimates, and risk posture for fast dashboard analysis.
          </p>
        </Panel>
      </section>
    </div>
  );
}
