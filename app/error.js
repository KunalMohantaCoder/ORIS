"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <section className="glass-panel max-w-xl rounded-lg p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-warning" />
        <h1 className="text-2xl font-semibold">Telemetry interruption</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {error?.message || "The interface hit an unexpected fault while reading mission data."}
        </p>
        <button
          className="mt-6 rounded-md border border-cyan-signal/30 px-4 py-2 text-sm text-cyan-bright transition hover:bg-cyan-signal/10"
          onClick={reset}
        >
          Reinitialize
        </button>
      </section>
    </main>
  );
}
