import PhysicsLab from "../../components/physics/PhysicsLab";

export default function PhysicsPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Physics learning hub</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Orbital Mechanics, Energy, and Momentum</h1>
      </header>
      <PhysicsLab />
    </div>
  );
}
