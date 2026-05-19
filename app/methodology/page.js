import Panel from "../../components/ui/Panel";

const sections = [
  {
    title: "Abstract",
    body: "ORIS investigates the orbital debris environment as an interconnected physical and data-driven risk system. The platform combines public orbital catalogs, normalized object metadata, collision-energy heuristics, debris-chain modeling, and satellite dependency analytics to show how orbital congestion can affect infrastructure resilience."
  },
  {
    title: "Project Objectives",
    body: "The objectives are to visualize orbital congestion, classify operational and debris objects, estimate conjunction danger, explain the physics behind orbital motion, and evaluate future sustainability strategies through transparent, replaceable data services."
  },
  {
    title: "Research Methodology",
    body: "The methodology follows a modular pipeline: acquire public orbital records, normalize orbital elements into dashboard fields, classify objects by shell and status, compute density indicators, run collision and chain-reaction simulations, then present findings through interactive visual analytics."
  },
  {
    title: "Data Collection Process",
    body: "ORIS reads from free public API adapters and local fallback datasets. Orbital records are normalized into common fields such as altitude, inclination, velocity, object type, shell, estimated mass, and source provenance. Survey analytics use a sample response dataset that can be replaced by a live public form or database table."
  },
  {
    title: "Limitations",
    body: "The risk model is an educational scientific approximation rather than an operational conjunction assessment service. Precise collision avoidance requires authoritative ephemerides, covariance data, maneuver plans, sensor uncertainty, and validated astrodynamics tooling."
  },
  {
    title: "Future Scope",
    body: "Future extensions can add SGP4 propagation, covariance-aware conjunction screening, Supabase-backed survey ingestion, live ephemeris streams, automated source-health monitoring, and improved debris-removal scenario optimization."
  }
];

const references = [
  "Public NORAD-style orbital element catalogs for satellite and debris tracking.",
  "Orbital debris mitigation guidance from international space safety organizations.",
  "Classical mechanics equations for circular velocity, escape velocity, momentum, and kinetic energy.",
  "Open research on Kessler Syndrome, cascading collision dynamics, and orbital carrying capacity."
];

export default function MethodologyPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Research methodology</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Scientific Basis and Analysis Pipeline</h1>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <Panel eyebrow="Research section" key={section.title} title={section.title}>
            <p className="text-sm leading-7 text-slate-300">{section.body}</p>
          </Panel>
        ))}
      </div>
      <Panel eyebrow="Scientific references" title="Reference Framework">
        <div className="grid gap-3 md:grid-cols-2">
          {references.map((reference) => (
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300" key={reference}>
              {reference}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
