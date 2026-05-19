"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Atom,
  BarChart3,
  Database,
  FlaskConical,
  Gauge,
  Globe2,
  Home,
  Orbit,
  Radar,
  Recycle
} from "lucide-react";
import { cn } from "../../lib/classNames";

const links = [
  { href: "/", label: "ORIS", icon: Home },
  { href: "/dashboard", label: "Orbital", icon: Orbit },
  { href: "/collision", label: "Risk", icon: Radar },
  { href: "/kessler", label: "Kessler", icon: Activity },
  { href: "/survey", label: "Survey", icon: BarChart3 },
  { href: "/physics", label: "Physics", icon: Atom },
  { href: "/methodology", label: "Research", icon: FlaskConical },
  { href: "/sustainability", label: "Future", icon: Recycle },
  { href: "/sources", label: "Sources", icon: Database }
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="mission-grid min-h-screen bg-void text-telemetry">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 border-r border-cyan-signal/10 bg-void/90 backdrop-blur xl:block">
        <div className="flex h-full flex-col items-center py-4">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-signal/30 bg-cyan-signal/10 shadow-glow">
            <Globe2 className="h-6 w-6 text-cyan-bright" />
          </div>
          <nav className="flex flex-1 flex-col items-center gap-2">
            {links.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  aria-label={item.label}
                  className={cn(
                    "group relative flex h-11 w-11 items-center justify-center rounded-md border transition",
                    active
                      ? "border-cyan-signal/40 bg-cyan-signal/10 text-cyan-bright"
                      : "border-transparent text-slate-500 hover:border-cyan-signal/20 hover:text-cyan-signal"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-5 w-5" />
                  <span className="pointer-events-none absolute left-14 rounded border border-cyan-signal/20 bg-void px-2 py-1 text-xs text-slate-200 opacity-0 shadow-glow transition group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <Gauge className="h-5 w-5 text-aurora" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-cyan-signal/10 bg-void/86 px-4 py-3 backdrop-blur xl:hidden">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <Globe2 className="h-5 w-5 text-cyan-bright" />
            ORIS
          </Link>
          <nav className="flex max-w-[72vw] gap-1 overflow-x-auto thin-scrollbar">
            {links.slice(1).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  aria-label={item.label}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-md border px-2",
                    active ? "border-cyan-signal/40 bg-cyan-signal/10 text-cyan-bright" : "border-transparent text-slate-500"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-screen px-4 py-5 sm:px-6 lg:px-8 xl:ml-20"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}
