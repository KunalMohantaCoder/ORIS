import { cn } from "../../lib/classNames";

export default function Panel({ children, className = "", title, eyebrow, action, id }) {
  return (
    <section id={id} className={cn("glass-panel holo-line rounded-lg p-5", className)}>
      {(title || eyebrow || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-signal">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
