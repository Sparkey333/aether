"use client";

import { useMemo, useState } from "react";
import seed from "@/data/lyfe/projects.seed.json";
import {
  PILLARS,
  PILLAR_META,
  balanceByPillar,
  detectSnags,
  orderScore,
  waterLine,
} from "@/lib/lyfe/engine";
import type { LyfeProject, Pillar } from "@/lib/lyfe/types";

const PROJECTS = (seed as unknown as { projects: LyfeProject[] }).projects;
const META = (seed as unknown as { meta: { completeness: string } }).meta;

export default function LyfeShell() {
  // The Water-Line — the three tides. Start a touch urgency-heavy, the common lean.
  const [urgency, setUrgency] = useState(0.7);
  const [priority, setPriority] = useState(0.55);
  const [soul, setSoul] = useState(0.35);

  const order = useMemo(() => orderScore(PROJECTS), []);
  const balance = useMemo(() => balanceByPillar(PROJECTS), []);
  const snags = useMemo(() => detectSnags(PROJECTS), []);
  const water = useMemo(
    () => waterLine({ urgency, priority, soul }),
    [urgency, priority, soul],
  );

  const active = PROJECTS.filter((p) => p.state === "active").length;
  const shells = PROJECTS.length - active;

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1 className="brand" style={{ fontSize: 26 }}>
            Lyfe · Projekt Z
          </h1>
          <p className="brand-sub">
            The harmony organ — your life, gathered into one honest tree
          </p>
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
        <Stat label="Snags found" value={String(snags.length)} hint="duplicates + shells to triage" />
      </div>

      {/* ── The Water-Line ─────────────────────────────────── */}
      <section>
        <div className="section-title">The Water-Line — balance the three tides</div>
        <div className="waterline">
          <p className="wl-mantra">
            “Maintain a fluid balance, like a shifting wave at the water line —
            between one extreme, the other, and the places in between. With
            time-waves, balancing <em>urgency</em>, <em>priority</em>, and{" "}
            <em>soul</em> is the key.”
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
          </div>
        </div>
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

      {/* ── Order Score breakdown — honest, shows what moves it ─ */}
      <section>
        <div className="section-title">What moves your Order Score</div>
        <div className="cards">
          {order.parts.map((part) => (
            <div key={part.label} className="card">
              <div className="card-body">
                <div className="card-title">
                  {part.label}{" "}
                  <span style={{ color: "var(--gold)" }}>
                    {part.value}/{part.of}
                  </span>
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

      {/* ── Snags — clutter, with SAFE suggestions ─────────── */}
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
        <p className="legend-note">
          <strong>The Vacuum doctrine (TransparentZ):</strong> Lyfe never moves or
          deletes anything on its own. Every fix is <em>back-up-first, propose,
          wait for your yes</em> — and always reversible. This view is read-only;
          the safe-move engine arrives with the Mac build&apos;s file access.
        </p>
      </section>
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
            <span className="proj-dot" style={{ background: p.state === "shell" ? "transparent" : meta.hex, borderColor: meta.hex }} />
            <span className="proj-name">{p.name}</span>
            {p.totalItems ? <span className="proj-n">{p.totalItems}</span> : <span className="proj-n shell-tag">seed</span>}
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
