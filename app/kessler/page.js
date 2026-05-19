import KesslerSimulation from "../../components/kessler/KesslerSimulation";

export default function KesslerPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Kessler syndrome simulator</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Chain-Reaction Debris Growth Model</h1>
      </header>
      <KesslerSimulation />
    </div>
  );
}
