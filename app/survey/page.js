"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Navigation, Radio, Recycle } from "lucide-react";
import SurveyCharts from "../../components/charts/SurveyCharts";
import MetricCard from "../../components/ui/MetricCard";
import LoadingState from "../../components/ui/LoadingState";
import { api } from "../../lib/api";

export default function SurveyPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/survey/analytics").then((payload) => setAnalytics(payload.data));
  }, []);

  if (!analytics) return <LoadingState label="Analyzing public dependency data" />;

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Survey analytics center</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Satellite Dependency and Sustainability Awareness</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={MessageSquare} label="Responses" value={analytics.totalResponses} />
        <MetricCard icon={Navigation} label="Daily GPS reliance" tone="green" value={`${analytics.insight.dailyGpsPercent}%`} />
        <MetricCard icon={Radio} label="Daily comms reliance" tone="amber" value={`${analytics.insight.dailyCommunicationPercent}%`} />
        <MetricCard icon={Recycle} label="Sustainability support" tone="cyan" value={`${analytics.insight.sustainabilitySupportPercent}%`} />
      </div>
      <SurveyCharts analytics={analytics} />
    </div>
  );
}
