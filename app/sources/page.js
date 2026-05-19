"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import LoadingState from "../../components/ui/LoadingState";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../lib/api";

const placeholder = `--------------------------------------------------
FREE API INPUT SECTION
--------------------------------------------------

[ORBITAL DATA APIs]
PASTE APIs HERE

[SPACE DEBRIS APIs]
PASTE APIs HERE

[SATELLITE TRACKING APIs]
PASTE APIs HERE

[EARTH / SPACE VISUALIZATION APIs]
PASTE APIs HERE

[PHYSICS / EDUCATIONAL DATA APIs]
PASTE APIs HERE

[SURVEY / ANALYTICS APIs]
PASTE APIs HERE

--------------------------------------------------`;

export default function SourcesPage() {
  const [sources, setSources] = useState(null);

  useEffect(() => {
    api.get("/sources").then((payload) => setSources(payload.data));
  }, []);

  if (!sources) return <LoadingState label="Reading API transparency registry" />;

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-signal">Data sources and API transparency</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Free Data Architecture and Swap-Ready API Registry</h1>
      </header>

      <Panel eyebrow="Policy" title="Free API Constraint">
        <p className="text-sm leading-7 text-slate-300">{sources.policy}</p>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Panel eyebrow="Configured sources" title="Feature-Wise API Registry">
          <div className="space-y-4">
            {sources.apiRegistry.map((section) => (
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4" key={section.section}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="font-mono text-sm text-cyan-bright">{section.section}</h2>
                  <StatusBadge status={section.sources.length ? "low" : "medium"} label={`${section.sources.length} sources`} />
                </div>
                {section.sources.length ? (
                  <div className="space-y-2">
                    {section.sources.map((source) => (
                      <a
                        className="flex items-center justify-between gap-3 rounded border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-signal/30 hover:text-cyan-bright"
                        href={source.url}
                        key={`${section.section}-${source.url}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span>{source.name}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No source inserted yet. The fallback dataset remains active.</p>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Insertion format" title="FREE API INPUT SECTION">
          <pre className="thin-scrollbar max-h-[560px] overflow-auto rounded-md border border-cyan-signal/15 bg-void/70 p-4 text-xs leading-6 text-cyan-bright">
            {placeholder}
          </pre>
        </Panel>
      </div>

      <Panel eyebrow="References" title="Scientific and Dataset References">
        <div className="grid gap-3 lg:grid-cols-2">
          {sources.references.map((reference) => (
            <a
              className="rounded-md border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-signal/30"
              href={reference.url}
              key={reference.url}
              rel="noreferrer"
              target="_blank"
            >
              <h3 className="font-medium text-white">{reference.title}</h3>
              <p className="mt-1 text-sm text-cyan-bright">{reference.organization}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{reference.note}</p>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}
