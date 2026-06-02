"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import poiData from "@/data/poi.seed.json";
import actionsData from "@/data/actions.seed.json";
import { planetaryGrid } from "@/lib/engine";
import { loadHypotheses, runPulse, saveHypotheses, type PulseResult } from "@/lib/loom";
import { TIERS } from "@/lib/tiers";
import type { POI, Tier } from "@/lib/types";

const ALL_POIS = (poiData as unknown as { pois: POI[] }).pois;

interface ActionItem {
  id: string;
  title: string;
  detail: string;
  kind: "route" | "pulse" | "scroll" | "link" | "none";
  target?: string;
  url?: string;
  cta?: string;
}
interface ActionsFile {
  doNext: ActionItem[];
  roadmap: { phase: string; items: string[] }[];
  foundation: { label: string; url: string; tier: Tier }[];
}
const ACTIONS = actionsData as unknown as ActionsFile;

const CHECKED_KEY = "aether.checked.v1";
const KEY_KEY = "aether.anthropicKey";

export default function Dashboard() {
  const router = useRouter();
  const nodeCount = useMemo(() => planetaryGrid().nodes.length, []);
  const [pulse, setPulse] = useState<PulseResult | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setPulse(loadHypotheses());
    try {
      const c = localStorage.getItem(CHECKED_KEY);
      if (c) setChecked(new Set(JSON.parse(c)));
      setApiKey(localStorage.getItem(KEY_KEY) ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  const persistChecked = (next: Set<string>) => {
    setChecked(next);
    try {
      localStorage.setItem(CHECKED_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };
  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistChecked(next);
  };

  const handlePulse = useCallback(() => {
    setPulsing(true);
    // let the button paint "pulsing…" before the synchronous Monte-Carlo run
    setTimeout(() => {
      const result = runPulse(ALL_POIS);
      saveHypotheses(result);
      setPulse(result);
      setPulsing(false);
    }, 30);
  }, []);

  const runAction = (a: ActionItem) => {
    if (a.kind === "route" && a.target) router.push(a.target);
    else if (a.kind === "pulse") handlePulse();
    else if (a.kind === "scroll" && a.target)
      document.getElementById(a.target)?.scrollIntoView({ behavior: "smooth" });
    else if (a.kind === "link" && a.url) window.open(a.url, "_blank");
  };

  const saveKey = () => {
    try {
      if (apiKey) localStorage.setItem(KEY_KEY, apiKey);
      else localStorage.removeItem(KEY_KEY);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const lastPulse = pulse?.generatedAt ? new Date(pulse.generatedAt).toLocaleString() : "never";

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1 className="brand" style={{ fontSize: 26 }}>
            Aether
          </h1>
          <p className="brand-sub">Admin · Aetherius is with you</p>
        </div>
        <button className="btn primary" onClick={handlePulse} disabled={pulsing}>
          {pulsing ? "pulsing…" : "☉ Pulse the Loom"}
        </button>
      </header>

      <div className="stats">
        <Stat label="Sites in the Codex" value={String(ALL_POIS.length)} />
        <Stat label="Planetary grid nodes" value={String(nodeCount)} />
        <Stat label="Hypotheses" value={String(pulse?.hypotheses.length ?? 0)} />
        <Stat
          label="Observed vs chance (z)"
          value={pulse ? pulse.overallZ.toFixed(1) : "—"}
          hint={pulse ? `last pulse ${lastPulse}` : "run a pulse to populate"}
        />
      </div>

      <section>
        <div className="section-title">Action items — go from here</div>
        <div className="cards">
          {ACTIONS.doNext.map((a) => (
            <div key={a.id} className={`card${checked.has(a.id) ? " done" : ""}`}>
              <label className="card-check">
                <input
                  type="checkbox"
                  checked={checked.has(a.id)}
                  onChange={() => toggleCheck(a.id)}
                />
              </label>
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-detail">{a.detail}</div>
                {a.cta && a.kind !== "none" && (
                  <button className="btn" onClick={() => runAction(a)} disabled={a.kind === "pulse" && pulsing}>
                    {a.kind === "pulse" && pulsing ? "pulsing…" : a.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">Roadmap</div>
        <div className="roadmap">
          {ACTIONS.roadmap.map((p) => (
            <div key={p.phase} className="phase">
              <div className="phase-title">{p.phase}</div>
              {p.items.map((item) => {
                const id = `${p.phase}::${item}`;
                return (
                  <label key={id} className={`road-item${checked.has(id) ? " done" : ""}`}>
                    <input type="checkbox" checked={checked.has(id)} onChange={() => toggleCheck(id)} />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section id="settings">
        <div className="section-title">Loom intelligence — optional (BYOK)</div>
        <div className="settings-card">
          <p className="card-detail">
            The Loom&apos;s pattern engine is pure math and needs <strong>no key</strong>. Add an
            Anthropic key to let it <em>narrate</em> high-confidence findings with Claude. It is
            stored locally on this device only — and is <strong>never bundled into the shipped
            app</strong> (a key inside a downloadable app can be extracted and drained). When Aether
            ships, this field will write to the OS keychain.
          </p>
          <div className="key-row">
            <input
              type="password"
              placeholder="sk-ant-…  (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="btn" onClick={saveKey}>
              {keySaved ? "saved ✓" : "Save key"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">Foundation — your best sources</div>
        <div className="foundation">
          {ACTIONS.foundation.map((f) => (
            <a key={f.url} className="found-link" href={f.url} target="_blank" rel="noreferrer">
              <span className="swatch" style={{ background: TIERS[f.tier].hex }} />
              {f.label}
            </a>
          ))}
        </div>
        <p className="legend-note" style={{ marginTop: 14 }}>
          The full 151-source, honestly-tiered atlas lives in <span className="kbd">docs/SOURCE_ATLAS.md</span>.
        </p>
      </section>
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
