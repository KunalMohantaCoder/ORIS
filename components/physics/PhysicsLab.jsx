"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { api } from "../../lib/api";
import MetricCard from "../ui/MetricCard";
import Panel from "../ui/Panel";

export default function PhysicsLab() {
  const [concepts, setConcepts] = useState([]);
  const [inputs, setInputs] = useState({ altitudeKm: 550, massKg: 260 });
  const [result, setResult] = useState(null);

  async function calculate(nextInputs = inputs) {
    const [conceptPayload, calcPayload] = await Promise.all([
      concepts.length ? Promise.resolve({ data: concepts }) : api.get("/physics/concepts"),
      api.post("/physics/calculate", nextInputs)
    ]);
    setConcepts(conceptPayload.data);
    setResult(calcPayload.data);
  }

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(key, value) {
    const next = { ...inputs, [key]: value };
    setInputs(next);
    calculate(next);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel eyebrow="Interactive equations" title="Orbital Mechanics Calculator">
        <div className="space-y-5">
          <label className="block text-sm text-slate-300">
            Altitude: {inputs.altitudeKm} km
            <input className="mt-2 w-full accent-cyan-signal" max="36000" min="160" onChange={(event) => update("altitudeKm", Number(event.target.value))} step="10" type="range" value={inputs.altitudeKm} />
          </label>
          <label className="block text-sm text-slate-300">
            Object mass: {inputs.massKg} kg
            <input className="mt-2 w-full accent-warning" max="10000" min="1" onChange={(event) => update("massKg", Number(event.target.value))} step="10" type="range" value={inputs.massKg} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard icon={Calculator} label="Orbital velocity" tone="cyan" value={`${result?.orbitalVelocityKmS || "..."} km/s`} />
            <MetricCard label="Escape velocity" tone="green" value={`${result?.escapeVelocityKmS || "..."} km/s`} />
            <MetricCard label="Kinetic energy" tone="red" value={result ? result.kineticEnergyJ.toExponential(2) : "..."} />
            <MetricCard label="Orbital period" tone="white" value={`${result?.orbitalPeriodMin || "..."} min`} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {concepts.map((concept) => (
          <Panel className="min-h-48" eyebrow={concept.formula} key={concept.title} title={concept.title}>
            <p className="text-sm leading-6 text-slate-300">{concept.explanation}</p>
            <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 font-mono text-xs text-cyan-bright">
              {concept.variables}
            </p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
