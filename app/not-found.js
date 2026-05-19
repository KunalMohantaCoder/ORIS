import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <section className="glass-panel max-w-lg rounded-lg p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Signal lost</p>
        <h1 className="mt-3 text-3xl font-semibold">Route not found</h1>
        <Link className="mt-6 inline-flex rounded-md border border-cyan-signal/30 px-4 py-2 text-cyan-bright" href="/">
          Return to ORIS
        </Link>
      </section>
    </main>
  );
}
