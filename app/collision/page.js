"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Gauge, RadioTower, Zap } from "lucide-react";
import RiskLab from "../../components/collision/RiskLab";
import RadarSweep from "../../components/visualization/RadarSweep";
import MetricCard from "../../components/ui/MetricCard";
import Panel from "../../components/ui/Panel";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../lib/api";

export default function CollisionPage() {
  const [objects, setObjects] = useState([]);
  const [crowding, setCrowding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [objectPayload, crowdingPayload] = await Promise.all([
        api.get("/orbital/objects?limit=900"),
        api.get("/collision/crowding")
      ]);
      setObjects(objectPayload.data);
      setCrowding(crowdingPayload.data);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Computing conjunction field" />;

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Collision risk center</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Conjunction Probability and Kinetic Danger</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={AlertTriangle} label="Risk posture" tone="red" value={crowding?.riskPosture || "elevated"} />
        <MetricCard icon={RadioTower} label="Warnings" value={crowding?.warnings?.length || 0} />
        <MetricCard icon={Gauge} label="LEO pressure" value={crowding?.shellPressure?.[0]?.score || 0} />
        <MetricCard icon={Zap} label="Model mode" tone="green" value="heuristic" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Panel eyebrow="Radar visualization" title="Collision Warning Indicators">
          <RadarSweep warnings={crowding?.warnings || []} />
        </Panel>
        <RiskLab objects={objects} />
      </div>

      <Panel eyebrow="Highest-risk pairings" title="Crowding Analysis">
        <div className="grid gap-3 lg:grid-cols-2">
          {(crowding?.warnings || []).slice(0, 8).map((warning) => (
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4" key={`${warning.objectA.id}-${warning.objectB.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{warning.objectA.name}</p>
                  <p className="mt-1 text-sm text-slate-400">Hazard: {warning.objectB.name}</p>
                </div>
                <StatusBadge status={warning.riskLevel} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Risk</p>
                  <p className="numeric text-cyan-bright">{warning.riskScore}</p>
                </div>
                <div>
                  <p className="text-slate-500">Velocity</p>
                  <p className="numeric text-cyan-bright">{warning.relativeVelocityKmS} km/s</p>
                </div>
                <div>
                  <p className="text-slate-500">Energy</p>
                  <p className="numeric text-cyan-bright">{warning.kineticEnergyJ.toExponential(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
