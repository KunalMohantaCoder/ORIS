"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Panel from "../ui/Panel";
import ExportPdfButton from "../ui/ExportPdfButton";

const COLORS = ["#5ee7ff", "#37f8a2", "#ffcc66", "#ff4d6d", "#ffffff"];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-cyan-signal/20 bg-void/95 p-3 text-xs shadow-glow">
      {label && <p className="mb-1 font-mono text-slate-400">{label}</p>}
      {payload.map((item) => (
        <p className="numeric" key={item.dataKey} style={{ color: item.color }}>
          {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function SurveyCharts({ analytics }) {
  if (!analytics) return null;
  return (
    <div id="survey-export" className="grid gap-5 xl:grid-cols-2">
      <Panel
        action={<ExportPdfButton filename="oris-survey-analytics.pdf" targetId="survey-export" />}
        eyebrow="Public dependency map"
        title="Awareness and Satellite Reliance"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={analytics.awareness} dataKey="value" innerRadius={58} nameKey="name" outerRadius={92} paddingAngle={3}>
                  {analytics.awareness.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={analytics.gpsDependency}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#8ea8c6" tickLine={false} />
                <YAxis stroke="#8ea8c6" tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#5ee7ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>

      <Panel eyebrow="Trend telemetry" title="Sustainability Signal Over Time">
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={analytics.trendRows}>
              <defs>
                <linearGradient id="awareness" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5ee7ff" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#5ee7ff" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="sustainability" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#37f8a2" stopOpacity={0.46} />
                  <stop offset="95%" stopColor="#37f8a2" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="#8ea8c6" tickLine={false} />
              <YAxis stroke="#8ea8c6" tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area dataKey="highAwarenessPercent" name="High awareness %" stroke="#5ee7ff" fill="url(#awareness)" />
              <Area dataKey="sustainabilityScore" name="Sustainability score" stroke="#37f8a2" fill="url(#sustainability)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel className="xl:col-span-2" eyebrow="Public priorities" title="Communication Dependency and Sustainability Priority">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={analytics.communicationDependency}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#8ea8c6" tickLine={false} />
                <YAxis stroke="#8ea8c6" tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#ffcc66" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={analytics.sustainabilityPriority}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#8ea8c6" tickLine={false} />
                <YAxis stroke="#8ea8c6" tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#37f8a2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>
    </div>
  );
}
