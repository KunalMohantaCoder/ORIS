"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ExportPdfButton from "../ui/ExportPdfButton";
import Panel from "../ui/Panel";

function TooltipCard({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-cyan-signal/20 bg-void/95 p-3 text-xs">
      <p className="mb-1 font-mono text-slate-400">{label}</p>
      {payload.map((item) => (
        <p className="numeric" key={item.dataKey} style={{ color: item.color }}>
          {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  );
}

export function SustainabilityCharts({ data }) {
  if (!data) return null;
  return (
    <div id="sustainability-export" className="grid gap-5 xl:grid-cols-2">
      <Panel
        action={<ExportPdfButton filename="oris-sustainability-forecast.pdf" targetId="sustainability-export" />}
        eyebrow="Launch cadence"
        title="Launch Growth and Cataloged Objects"
      >
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data.launchTrends}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="year" stroke="#8ea8c6" tickLine={false} />
              <YAxis stroke="#8ea8c6" tickLine={false} />
              <Tooltip content={<TooltipCard />} />
              <Bar dataKey="launches" fill="#5ee7ff" name="Launches" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mitigationCompliance" fill="#37f8a2" name="Mitigation %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel eyebrow="Forecast" title="Debris Growth and Sustainability Index">
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={data.forecast}>
              <defs>
                <linearGradient id="debrisForecast" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.48} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="year" stroke="#8ea8c6" tickLine={false} />
              <YAxis stroke="#8ea8c6" tickLine={false} />
              <Tooltip content={<TooltipCard />} />
              <Area dataKey="debrisObjects" fill="url(#debrisForecast)" name="Debris objects" stroke="#ff4d6d" />
              <Line dataKey="sustainabilityIndex" name="Sustainability index" stroke="#37f8a2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

export function KesslerChart({ series = [] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={series}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="year" stroke="#8ea8c6" tickLine={false} />
          <YAxis stroke="#8ea8c6" tickLine={false} />
          <Tooltip content={<TooltipCard />} />
          <Line dataKey="debrisObjects" name="Debris objects" stroke="#ff4d6d" strokeWidth={2} dot={false} />
          <Line dataKey="activeAssets" name="Active assets" stroke="#5ee7ff" strokeWidth={2} dot={false} />
          <Line dataKey="sustainabilityIndex" name="Sustainability index" stroke="#37f8a2" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
