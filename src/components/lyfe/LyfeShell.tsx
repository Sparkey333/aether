"use client";

import { useMemo, useState } from "react";
import seed from "@/data/lyfe/projects.seed.json";
import timewaves from "@/data/lyfe/timewaves.seed.json";
import {
  PILLARS,
  PILLAR_META,
  balanceByPillar,
  detectSnags,
  orderScore,
  waterLine,
} from "@/lib/lyfe/engine";
import { byDue, seededUrgency, type Commitment } from "@/lib/lyfe/timewaves";
import type { LyfeProject, Pillar } from "@/lib/lyfe/types";
import VacuumPanel from "@/components/lyfe/VacuumPanel";

const PROJECTS = (seed as unknown as { projects: LyfeProject[] }).projects;
const META = (seed as unknown as { meta: { completeness: string } }).meta;
const COMMITS = (timewaves as unknown as { commitments: Commitment[] }).commitments;

function LeafMark() {
  return (
    <svg className="leaf" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <defs>
        <linearGradient id="lyfeLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3ee08f" />
          <stop offset="1" stopColor="#0c8a4f" />
        </linearGradient>
      </defs>
      <path d="M21 3C9 3 3 9 3 21c12 0 18-6 18-18Z" fill="url(#lyfeLeaf)" />
      <path
        d="M6.5 17.5C9 12 13 8 18.5 5.5"
        fill="none"
        stroke="#06311e"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export default function LyfeShell() {
  // The Water-Line. Urgency starts seeded from real dated commitments (Time-Waves);
  // priority and soul start centered, for the person to set.
  const [urgency, setUrgency] = useState(() => seededUrgency(COMMITS));
  const [priority, setPriority] = useState(0.55);
  const [soul, setSoul] = useState(0.4);

  const order = useMemo(() => orderScore(PROJECTS), []);
  const balance = useMemo(() => balanceByPillar(PROJECTS), []);
  const snags = useMemo(() => detectSnags(PROJECTS), []);
  const commitments = useMemo(() => byDue(COMMITS), []);
  const water = useMemo(() => waterLine({ urgency, priority, soul }), [urgency, priority, soul]);

  const active = PROJECTS.filter((p) => p.state === "active").length;
  const shells = PROJECTS.length - active;
  const seededU = useMemo(() => Math.round(seededUrgency(COMMITS) * 100), []);

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div className="lyfe-brand-row">
          <LeafMark />
          <div>
            <h1 className="brand lyfe-brand" style={{ fontSize: 26 }}>
              Lyfe · Projekt Z
            </h1>
            <p className="brand-sub">The harmony organ — your life, gathered into one honest tree</p>
          </div>
        </div>
        <div className="score-badge" title="Order Score — how gathered your life is right now">
          <div className="score-num">{order.score}</div>
          <div className="score-cap">order</div>
        </div>
      </header>

      <div className="stats">
        <Stat label="Projects in the tree" value={String(PROJECTS.length)} hint={META.completeness} />
        <Stat label="Active branches" value={String(active)} />
        <Stat label="Empty shells (seeds)" value={String(shells)} hint="named, not yet planted" />
        <Stat label="Dated commitments" value={String(COMMITS.length)} hint="from your TODO sheets" />
      </div>

      {/* ── The Water-Line ─────────────────────────────────── */}
      <section>
        <div className="section-title">The Water-Line — balance the three tides</div>
        <div className="waterline">
          <p className="wl-mantra">
            “Maintain a fluid balance, like a shifting wave at the water line — between
            one extreme, the other, and the places in between. With time-waves,
            balancing <em>urgency</em>, <em>priority</em>, and <em>soul</em> is the key.”
          </p>
          <Tide name="Urgency" value={urgency} set={setUrgency} hex="#e6a45a" />
          <Tide name="Priority" value={priority} set={setPriority} hex="#50c8ff" />
          <Tide name="Soul / Spirit" value={soul} set={setSoul} hex="#ebbe5a" />
          <div className="wl-read">
            <div className="bar" style={{ marginTop: 14 }}>
              <span style={{ width: `${Math.round(water.balance * 100)}%` }} />
            </div>
            <div className="wl-line">
              <strong>{Math.round(water.balance * 100)}% centered</strong>
              {water.lean !== "centered" && <> · leaning to {water.lean}</>}
            </div>
            <p className="wl-reading">{water.reading}</p>
            <p className="wl-seed">
              Urgency seeded at <strong>{seededU}</strong> from {COMMITS.length} dated
              commitments below — nudge it to your truth.
            </p>
          </div>
        </div>
      </section>

      {/* ── Time-Waves ─────────────────────────────────────── */}
      <section>
        <div className="section-title">Time-Waves — your dated commitments</div>
        <div className="waves">
          {commitments.map((c) => (
            <div key={c.id} className={`wave${c.urgent ? " urgent" : ""}`}>
              <span className="wave-due">{c.due}</span>
              <span className="wave-body">
                <span className="wave-task">{c.task}</span>
                <span className="wave-meta">
                  {c.project} · {c.source}
                  {c.note ? ` · ${c.note}` : ""}
                </span>
              </span>
              {c.urgent && <span className="wave-flag">urgent</span>}
            </div>
          ))}
        </div>
        <p className="legend-note">
          Imported from <span className="kbd">TODO#1–2</span>. Dates are M/D as written
          (year inferred); live, year-accurate urgency arrives with the Todoist connector.
        </p>
      </section>

      {/* ── The Life Tree (pillars) ────────────────────────── */}
      <section>
        <div className="section-title">The Life Tree — by pillar</div>
        <div className="lyfe-tree">
          {PILLARS.map((pillar) => (
            <PillarColumn
              key={pillar}
              pillar={pillar}
              projects={PROJECTS.filter((p) => p.pillar === pillar)}
              share={balance.find((b) => b.pillar === pillar)?.share ?? 0}
            />
          ))}
        </div>
      </section>

      {/* ── Order Score breakdown ──────────────────────────── */}
      <section>
        <div className="section-title">What moves your Order Score</div>
        <div className="cards">
          {order.parts.map((part) => (
            <div key={part.label} className="card">
              <div className="card-body">
                <div className="card-title">
                  {part.label} <span style={{ color: "var(--gold)" }}>{part.value}/{part.of}</span>
                </div>
                <div className="bar" style={{ margin: "8px 0" }}>
                  <span style={{ width: `${(part.value / part.of) * 100}%` }} />
                </div>
                <div className="card-detail">{part.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Snags ──────────────────────────────────────────── */}
      <section>
        <div className="section-title">Snags — gentle, safe to fix</div>
        {snags.map((s) => (
          <div key={s.id} className="snag">
            <div className="snag-head">
              <span className={`snag-kind ${s.kind}`}>{s.kind}</span>
              <span className="snag-title">{s.title}</span>
            </div>
            <div className="card-detail">{s.detail}</div>
            <div className="snag-fix">→ {s.suggestion}</div>
          </div>
        ))}
      </section>

      {/* ── The Vacuum ─────────────────────────────────────── */}
      <VacuumPanel />
    </div>
  );
}

function PillarColumn({
  pillar,
  projects,
  share,
}: {
  pillar: Pillar;
  projects: LyfeProject[];
  share: number;
}) {
  const meta = PILLAR_META[pillar];
  return (
    <div className="pillar-col">
      <div className="pillar-head" style={{ color: meta.hex }}>
        <span className="pillar-glyph">{meta.glyph}</span>
        <span className="pillar-name">{meta.label}</span>
        <span className="pillar-count">{projects.length}</span>
      </div>
      <div className="bar" style={{ marginBottom: 10 }}>
        <span style={{ width: `${Math.round(share * 100)}%`, background: meta.hex }} />
      </div>
      <div className="pillar-blurb">{meta.blurb}</div>
      <div className="pillar-list">
        {projects.map((p) => (
          <div key={p.id} className={`proj${p.state === "shell" ? " shell" : ""}`}>
            <span
              className="proj-dot"
              style={{ background: p.state === "shell" ? "transparent" : meta.hex, borderColor: meta.hex }}
            />
            <span className="proj-name">{p.name}</span>
            {p.totalItems ? (
              <span className="proj-n">{p.totalItems}</span>
            ) : (
              <span className="proj-n shell-tag">seed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tide({
  name,
  value,
  set,
  hex,
}: {
  name: string;
  value: number;
  set: (v: number) => void;
  hex: string;
}) {
  return (
    <div className="tide">
      <label className="tide-label">
        <span style={{ color: hex }}>{name}</span>
        <span className="tide-val">{Math.round(value * 100)}</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        style={{ accentColor: hex }}
      />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
