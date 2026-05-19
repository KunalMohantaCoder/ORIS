import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message }) {
  return (
    <div className="glass-panel rounded-lg border border-critical/30 p-5 text-critical">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" />
        <div>
          <p className="font-semibold">Data link degraded</p>
          <p className="mt-1 text-sm text-slate-300">{message}</p>
        </div>
      </div>
    </div>
  );
}
