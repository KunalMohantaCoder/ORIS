"use client";

import { Search } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function ObjectTable({ objects = [], filters, onFilters }) {
  return (
    <div>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_150px_150px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full rounded-md border border-cyan-signal/15 bg-void/60 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-signal/40"
            onChange={(event) => onFilters({ search: event.target.value })}
            placeholder="Search catalog"
            suppressHydrationWarning
            value={filters.search}
          />
        </label>
        <select
          className="rounded-md border border-cyan-signal/15 bg-void/60 px-3 py-2 text-sm outline-none focus:border-cyan-signal/40"
          onChange={(event) => onFilters({ type: event.target.value })}
          value={filters.type}
        >
          <option value="all">All types</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="debris">Debris</option>
        </select>
        <select
          className="rounded-md border border-cyan-signal/15 bg-void/60 px-3 py-2 text-sm outline-none focus:border-cyan-signal/40"
          onChange={(event) => onFilters({ regime: event.target.value })}
          value={filters.regime}
        >
          <option value="ALL">All layers</option>
          <option value="LEO">LEO</option>
          <option value="MEO">MEO</option>
          <option value="GEO">GEO</option>
          <option value="HEO">HEO</option>
        </select>
      </div>
      <div className="max-h-[440px] overflow-auto thin-scrollbar">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-orbit text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="border-b border-white/10 px-3 py-3">Object</th>
              <th className="border-b border-white/10 px-3 py-3">Status</th>
              <th className="border-b border-white/10 px-3 py-3">Layer</th>
              <th className="border-b border-white/10 px-3 py-3">Altitude</th>
              <th className="border-b border-white/10 px-3 py-3">Velocity</th>
              <th className="border-b border-white/10 px-3 py-3">Inclination</th>
            </tr>
          </thead>
          <tbody>
            {objects.slice(0, 160).map((object) => (
              <tr className="transition hover:bg-cyan-signal/[0.055]" key={object.id}>
                <td className="border-b border-white/5 px-3 py-3">
                  <p className="font-medium text-white">{object.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">NORAD {object.noradId}</p>
                </td>
                <td className="border-b border-white/5 px-3 py-3">
                  <StatusBadge
                    status={object.type === "debris" ? "high" : object.type === "inactive" ? "medium" : "low"}
                    label={object.type}
                  />
                </td>
                <td className="border-b border-white/5 px-3 py-3 font-mono text-cyan-bright">{object.regime}</td>
                <td className="numeric border-b border-white/5 px-3 py-3 text-slate-300">{object.altitudeKm} km</td>
                <td className="numeric border-b border-white/5 px-3 py-3 text-slate-300">{object.velocityKmS} km/s</td>
                <td className="numeric border-b border-white/5 px-3 py-3 text-slate-300">{object.inclinationDeg} deg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
