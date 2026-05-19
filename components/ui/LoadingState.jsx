export default function LoadingState({ label = "Synchronizing telemetry" }) {
  return (
    <div className="glass-panel flex min-h-56 items-center justify-center rounded-lg p-8">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-signal/20 border-t-cyan-signal" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}
