"use client";

import { useEffect, useMemo, useState } from "react";
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
import { loadOverrides, saveOverrides, withOverrides, type PillarOverrides } from "@/lib/lyfe/store";
import type { LyfeProject, Pillar } from "@/lib/lyfe/types";
import LeafMark from "@/components/lyfe/LeafMark";
import TrajectoryPanel from "@/components/lyfe/TrajectoryPanel";
import VacuumPanel from "@/components/lyfe/VacuumPanel";

const PROJECTS = (seed as unknown as { projects: LyfeProject[] }).projects;
const META = (seed as unknown as { meta: { completeness: string } }).meta;
const COMMITS = (timewaves as unknown as { commitments: Commitment[] }).commitments;

export default function LyfeShell() {
  // The person's own re-sorts — their judgment outranks the classifier's guess.
  // Loaded after mount so the server and first client render agree.
  const [overrides, setOverrides] = useState<PillarOverrides>({});
  const [selected, setSelected] = useState<LyfeProject | null>(null);

  useEffect(() => setOverrides(loadOverrides()), []);

  // The Water-Line. Urgency starts seeded from real dated commitments.
  const [urgency, setUrgency] = useState(() => seededUrgency(COMMITS));
  const [priority, setPriority] = useState(0.55);
  const [soul, setSoul] = useState(0.4);

  const projects = useMemo(() => withOverrides(PROJECTS, overrides), [overrides]);
  const order = useMemo(() => orderScore(projects), [projects]);
  const balance = useMemo(() => balanceByPillar(projects), [projects]);
  const snags = useMemo(() => detectSnags(projects), [projects]);
  const commitments = useMemo(() => byDue(COMMITS), []);
  const water = useMemo(() => waterLine({ urgency, priority, soul }), [urgency, priority, soul]);

  const active = projects.filter((p) => p.state === "active").length;
  const shells = projects.length - active;
  const openItems = useMemo(
    () => projects.reduce((a, p) => a + (p.totalItems ?? 0), 0),
    [projects],
  );
  const movedCount = Object.keys(overrides).length;
  const seededU = useMemo(() => Math.round(seededUrgency(COMMITS) * 100), []);

  const move = (id: string, to: Pillar) => {
    const original = PROJECTS.find((p) => p.id === id);
    const next = { ...overrides };
    // moving back to where it started is an un-override, not a new fact
    if (original && original.pillar === to) delete next[id];
    else next[id] = to;
    setOverrides(next);
    saveOverrides(next);
    setSelected(null);
  };

  const resetAll = () => {
    setOverrides({});
    saveOverrides({});
    setSelected(null);
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div className="lyfe-brand-row">
          <LeafMark size={38} gradId="shellLeaf" />
          <div>
            <h1 className="brand lyfe-brand" style={{ fontSize: 27 }}>
              Lyfe · Projekt Z
            </h1>
            <p className="brand-sub" style={{ margin: 0 }}>
              The harmony organ — your life, gathered into one honest tree
            </p>
          </div>
        </div>
        <OrderRing score={order.score} />
      </header>

      <div className="stats">
        <Stat em label="Projects in the tree" value={String(projects.length)} hint={META.completeness} />
        <Stat label="Active branches" value={String(active)} />
        <Stat label="Seeds (empty shells)" value={String(shells)} hint="named, not yet planted" />
        <Stat label="Dated commitments" value={String(COMMITS.length)} hint="from your TODO sheets" />
      </div>

      {/* ── The Water-Line ─────────────────────────────────── */}
      <section>
        <div className="section-title">The Water-Line — balance the three tides</div>
        <div className="waterline">
          <p className="wl-mantra">
            “Maintain a fluid balance, like a shifting wave at the water line — between
            one extreme, the other, and the places in between. With time-waves, balancing{" "}
            <em>urgency</em>, <em>priority</em>, and <em>soul</em> is the key.”
          </p>
          <Tide name="Urgency" value={urgency} set={setUrgency} hex="#e6a45a" />
          <Tide name="Priority" value={priority} set={setPriority} hex="#50c8ff" />
          <Tide name="Soul / Spirit" value={soul} set={setSoul} hex="#ebbe5a" />
          <div className="wl-read">
            <div className="bar" style={{ marginTop: 16 }}>
              <span
                style={{
                  width: `${Math.round(water.balance * 100)}%`,
                  background: "linear-gradient(90deg, var(--emerald), var(--gold))",
                }}
              />
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

      {/* ── The Life Tree ──────────────────────────────────── */}
      <section>
        <div className="section-title">
          The Life Tree — click any project to re-sort it
        </div>
        <div className="lyfe-tree">
          {PILLARS.map((pillar) => (
            <PillarColumn
              key={pillar}
              pillar={pillar}
              projects={projects.filter((p) => p.pillar === pillar)}
              overrides={overrides}
              share={balance.find((b) => b.pillar === pillar)?.share ?? 0}
              selected={selected}
              onSelect={setSelected}
              onDrop={move}
            />
          ))}
        </div>

        {selected && (
          <div className="resort">
            <span className="resort-what">{selected.name}</span>
            <span className="resort-hint">move to →</span>
            {PILLARS.map((p) => (
              <button
                key={p}
                className={`chip${p === selected.pillar ? " current" : ""}`}
                style={p === selected.pillar ? undefined : { color: PILLAR_META[p].hex }}
                disabled={p === selected.pillar}
                onClick={() => move(selected.id, p)}
              >
                {PILLAR_META[p].glyph} {PILLAR_META[p].label}
              </button>
            ))}
            <button className="btn resort-close" onClick={() => setSelected(null)}>
              done
            </button>
          </div>
        )}

        <p className="legend-note">
          The pillar is the one <em>derived</em> field — a first-pass guess. Your re-sorts
          outrank it, save on this device only, and recompute your Order Score live.
          {movedCount > 0 && (
            <>
              {" "}
              <strong style={{ color: "var(--emerald)" }}>{movedCount} moved by you.</strong>{" "}
              <button className="btn" style={{ padding: "3px 10px", fontSize: 12 }} onClick={resetAll}>
                reset to derived
              </button>
            </>
          )}
        </p>
      </section>

      {/* ── Order Score breakdown ──────────────────────────── */}
      <section>
        <div className="section-title">What moves your Order Score</div>
        <div className="cards">
          {order.parts.map((part) => (
            <div key={part.label} className="card">
              <div className="card-body">
                <div className="card-title">
                  {part.label}{" "}
                  <span style={{ color: "var(--emerald)" }}>
                    {part.value}/{part.of}
                  </span>
                </div>
                <div className="bar" style={{ margin: "8px 0" }}>
                  <span
                    style={{
                      width: `${(part.value / part.of) * 100}%`,
                      background: "linear-gradient(90deg, var(--emerald-lo), var(--emerald-hi))",
                    }}
                  />
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

      {/* ── Trajectory ─────────────────────────────────────── */}
      <TrajectoryPanel openProjects={active} openItems={openItems} />

      {/* ── The Vacuum ─────────────────────────────────────── */}
      <VacuumPanel />
    </div>
  );
}

/** The Order Score as a ring — 0..100 drawn as an arc you can read at a glance. */
function OrderRing({ score }: { score: number }) {
  const R = 40;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="ring-wrap" title="Order Score — how gathered your life is right now">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <defs>
          <linearGradient id="lyfeRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3ee08f" />
            <stop offset="1" stopColor="#0c8a4f" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="46" cy="46" r={R} fill="none" strokeWidth="6" />
        <circle
          className="ring-fill"
          cx="46"
          cy="46"
          r={R}
          fill="none"
          strokeWidth="6"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-mid">
        <div className="ring-num">{score}</div>
        <div className="ring-cap">order</div>
      </div>
    </div>
  );
}

function PillarColumn({
  pillar,
  projects,
  overrides,
  share,
  selected,
  onSelect,
  onDrop,
}: {
  pillar: Pillar;
  projects: LyfeProject[];
  overrides: PillarOverrides;
  share: number;
  selected: LyfeProject | null;
  onSelect: (p: LyfeProject | null) => void;
  onDrop: (id: string, to: Pillar) => void;
}) {
  const meta = PILLAR_META[pillar];
  const isTarget = !!selected && selected.pillar !== pillar;
  return (
    <div
      className={`pillar-col${isTarget ? " drop-target" : ""}`}
      onClick={isTarget ? () => onDrop(selected.id, pillar) : undefined}
    >
      <div className="pillar-head" style={{ color: meta.hex }}>
        <span className="pillar-glyph">{meta.glyph}</span>
        <span className="pillar-name">{meta.label}</span>
        <span className="pillar-count">{projects.length}</span>
      </div>
      <div className="bar" style={{ marginTop: 8 }}>
        <span style={{ width: `${Math.round(share * 100)}%`, background: meta.hex }} />
      </div>
      <div className="pillar-blurb">{meta.blurb}</div>
      <div className="pillar-list">
        {projects.map((p) => (
          <button
            key={p.id}
            className={[
              "proj",
              p.state === "shell" ? "shell" : "",
              selected?.id === p.id ? "selected" : "",
              overrides[p.id] ? "moved" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected?.id === p.id ? null : p);
            }}
            title={overrides[p.id] ? "moved here by you" : "click to re-sort"}
          >
            <span
              className="proj-dot"
              style={{
                background: p.state === "shell" ? "transparent" : meta.hex,
                borderColor: meta.hex,
              }}
            />
            <span className="proj-name">{p.name}</span>
            {p.totalItems ? (
              <span className="proj-n">{p.totalItems}</span>
            ) : (
              <span className="proj-n shell-tag">seed</span>
            )}
          </button>
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
        aria-label={name}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  em,
}: {
  label: string;
  value: string;
  hint?: string;
  em?: boolean;
}) {
  return (
    <div className={`stat${em ? " em" : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
