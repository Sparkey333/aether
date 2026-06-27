"use client";

import seed from "@/data/lyfe/vacuum.seed.json";
import { buildPlan, formatBytes, VACUUM_KIND_META } from "@/lib/lyfe/vacuum";
import type { VacuumItem } from "@/lib/lyfe/vacuum";

const ITEMS = (seed as unknown as { items: VacuumItem[] }).items;

export default function VacuumPanel() {
  const plan = buildPlan(ITEMS);
  return (
    <section>
      <div className="section-title">The Vacuum — safe to tidy (read-only)</div>
      <div className="vac-summary">
        <span><strong>{plan.items.length}</strong> findings</span>
        <span><strong style={{ color: "var(--emerald)" }}>{formatBytes(plan.totalReclaim)}</strong> reclaimable</span>
        <span><strong>0</strong> touched</span>
      </div>
      {plan.items.map((it) => {
        const m = VACUUM_KIND_META[it.kind];
        return (
          <div key={it.id} className="snag">
            <div className="snag-head">
              <span className="snag-kind" style={{ color: m.hex }}>{m.label}</span>
              <span className="snag-title">{it.title}</span>
              {it.reclaimBytes ? <span className="vac-size">{formatBytes(it.reclaimBytes)}</span> : null}
            </div>
            <div className="card-detail">{it.detail}</div>
            <div className="vac-where">📁 {it.where}</div>
            <div className="snag-fix">→ {it.safeAction}</div>
          </div>
        );
      })}
      <p className="legend-note">
        <strong>TransparentZ:</strong> these are <em>findings</em>, not actions — nothing
        in your Drive has been moved or deleted. When the Mac build gets file access,
        each fix runs only after a backup and your explicit yes, and every move is
        reversible.
      </p>
    </section>
  );
}
