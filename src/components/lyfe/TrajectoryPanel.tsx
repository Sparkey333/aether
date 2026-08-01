"use client";

import { useMemo } from "react";
import history from "@/data/lyfe/history.seed.json";
import {
  accountabilityFinding,
  carryLoad,
  splitByAccountability,
  throughput,
  MISSING_INPUTS,
  type Board,
} from "@/lib/lyfe/trajectory";

const BOARDS = (history as unknown as { boards: Board[] }).boards;

export default function TrajectoryPanel({
  openProjects,
  openItems,
}: {
  openProjects: number;
  openItems: number;
}) {
  const all = useMemo(() => throughput(BOARDS), []);
  const split = useMemo(() => splitByAccountability(BOARDS), []);
  const finding = useMemo(() => accountabilityFinding(BOARDS), []);
  const load = useMemo(() => carryLoad(BOARDS, openProjects, openItems), [openProjects, openItems]);

  return (
    <section>
      <div className="section-title">Trajectory — projected from measured points</div>

      <div className="traj-split">
        <RateCard
          label="With a witness"
          sub="someone else is waiting"
          t={split.external}
          hex="#50c8ff"
        />
        <RateCard
          label="On your own"
          sub="only you are waiting"
          t={split.internal}
          hex="#ebbe5a"
        />
      </div>

      {finding && (
        <div className="finding">
          <div className="finding-head">{finding.headline}</div>
          <div className="finding-ev">{finding.evidence}</div>
          <p className="finding-read">{finding.reading}</p>
          <div className="snag-fix">→ {finding.lever}</div>
          <p className="finding-caveat">Honest limit: {finding.caveat}</p>
        </div>
      )}

      <div className="traj-load">
        <div className="card-title" style={{ marginBottom: 6 }}>
          Carry-load — {load.openProjects} open projects · {load.openItems} open items
        </div>
        <div className="bar">
          <span
            style={{
              width: `${Math.round((all.rate ?? 0) * 100)}%`,
              background: "linear-gradient(90deg, var(--emerald-lo), var(--emerald-hi))",
            }}
          />
        </div>
        <p className="card-detail" style={{ marginTop: 8 }}>
          {load.note}
        </p>
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>
        What Lyfe still can&apos;t see
      </div>
      <div className="missing">
        {MISSING_INPUTS.map((m) => (
          <div key={m.input} className="miss">
            <span className="miss-dot" />
            <span className="miss-body">
              <span className="miss-name">{m.input}</span>
              <span className="miss-unlocks">{m.unlocks}</span>
            </span>
            <span className="miss-status">{m.status}</span>
          </div>
        ))}
      </div>

      <p className="legend-note">
        Every number above traces to a <strong>&ldquo;N/M completed&rdquo;</strong> counter written
        in your own TODO#1–6 sheets — nothing is estimated. The one derived field is
        whether a board&apos;s deadlines come from someone else, and that is the axis the
        reading turns on. A projection is only worth the data under it, so the gaps are
        listed rather than filled in.
      </p>
    </section>
  );
}

function RateCard({
  label,
  sub,
  t,
  hex,
}: {
  label: string;
  sub: string;
  t: { done: number; total: number; rate: number | null; boards: number };
  hex: string;
}) {
  const pct = t.rate === null ? null : Math.round(t.rate * 100);
  return (
    <div className="rate-card">
      <div className="rate-top">
        <span className="rate-label" style={{ color: hex }}>
          {label}
        </span>
        <span className="rate-pct">{pct === null ? "—" : `${pct}%`}</span>
      </div>
      <div className="bar">
        <span style={{ width: `${pct ?? 0}%`, background: hex }} />
      </div>
      <div className="rate-meta">
        {t.done}/{t.total} items · {t.boards} boards · <em>{sub}</em>
      </div>
    </div>
  );
}
