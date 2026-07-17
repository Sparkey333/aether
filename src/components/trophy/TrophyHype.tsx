"use client";

import { useEffect, useMemo, useState } from "react";
import { rankOpportunities } from "@/lib/trophy/discover";
import { computeStanding, computeStreak } from "@/lib/trophy/gamify";
import { SEED_OPPORTUNITIES } from "@/lib/trophy/library";
import {
  addTrophy,
  hydrate,
  loadProfile,
  loadPursuits,
  loadTrophies,
  newId,
  removePursuit,
  removeTrophy,
  savePursuits,
  upsertPursuit,
} from "@/lib/trophy/store";
import type {
  DiscoveryFeed,
  Opportunity,
  Profile,
  Pursuit,
  PursuitStatus,
  Trophy,
} from "@/lib/trophy/types";
import AddTrophy from "./AddTrophy";
import Briefing from "./Briefing";
import DiscoverFeed from "./DiscoverFeed";
import Pursuits from "./Pursuits";
import TrophyCase from "./TrophyCase";

type Tab = "briefing" | "discover" | "case" | "pursuits";

const TABS: { id: Tab; label: string }[] = [
  { id: "briefing", label: "Briefing" },
  { id: "discover", label: "Discover" },
  { id: "case", label: "Trophy Case" },
  { id: "pursuits", label: "Pursuits" },
];

export default function TrophyHype() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [pursuits, setPursuits] = useState<Pursuit[]>([]);
  const [feed, setFeed] = useState<DiscoveryFeed | null>(null);
  const [tab, setTab] = useState<Tab>("briefing");
  const [addOpen, setAddOpen] = useState(false);
  const [addPrefill, setAddPrefill] = useState<Opportunity | null>(null);

  useEffect(() => {
    hydrate();
    setProfile(loadProfile());
    setTrophies(loadTrophies());
    setPursuits(loadPursuits());
    setReady(true);
    // The Hunt's morning briefing — absent until the heartbeat runs; fall back gracefully.
    fetch("/data/trophy-discoveries.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setFeed(j as DiscoveryFeed))
      .catch(() => {});
  }, []);

  const standing = useMemo(() => computeStanding(trophies), [trophies]);
  const streak = useMemo(() => computeStreak(trophies), [trophies]);

  const ranked = useMemo(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    const all: Opportunity[] = [];
    for (const o of SEED_OPPORTUNITIES) {
      seen.add(o.id);
      all.push(o);
    }
    for (const o of feed?.discoveries ?? []) {
      if (!seen.has(o.id)) {
        seen.add(o.id);
        all.push(o);
      }
    }
    return rankOpportunities(all, profile)
      .map((o) =>
        o.integrityFlags?.length ? { ...o, fit: Math.min(o.fit ?? 0, 0.25) } : o,
      )
      .sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0));
  }, [profile, feed]);

  const oppById = useMemo(() => {
    const m = new Map<string, Opportunity>();
    for (const o of ranked) m.set(o.id, o);
    return m;
  }, [ranked]);

  const trackedIds = useMemo(
    () => new Set(pursuits.map((p) => p.opportunityId)),
    [pursuits],
  );

  const fallbackPicks = useMemo(
    () =>
      ranked
        .filter((o) => o.window.rolling || !o.window.date || new Date(o.window.date) >= new Date())
        .slice(0, 6),
    [ranked],
  );

  if (!ready || !profile) {
    return <div className="th-root th-loading">Loading Trophy Hype…</div>;
  }

  // ── handlers ───────────────────────────────────────────────────────────────
  const onTrack = (opp: Opportunity) => {
    if (trackedIds.has(opp.id)) return;
    const next = upsertPursuit({
      id: newId("p"),
      opportunityId: opp.id,
      status: "eyeing",
      targetDate: opp.window.date,
      createdAt: new Date().toISOString(),
    });
    setPursuits([...next]);
  };
  const onLog = (opp: Opportunity | null) => {
    setAddPrefill(opp);
    setAddOpen(true);
  };
  const onAdd = (t: Trophy) => {
    setTrophies([...addTrophy(t)]);
    setAddOpen(false);
    setAddPrefill(null);
    setTab("case");
  };
  const onRemoveTrophy = (id: string) => setTrophies([...removeTrophy(id)]);
  const onStatus = (id: string, status: PursuitStatus) => {
    const next = pursuits.map((p) => (p.id === id ? { ...p, status } : p));
    savePursuits(next);
    setPursuits(next);
  };
  const onRemovePursuit = (id: string) => setPursuits([...removePursuit(id)]);

  const pct = standing.levelSpan > 0 ? (standing.levelXp / standing.levelSpan) * 100 : 0;

  return (
    <div className="th-root">
      <header className="th-header">
        <div className="th-brandline">
          <span className="th-logo">🏆 TROPHY HYPE</span>
          <span className="th-tagline">Track every arena. Prove every win.</span>
        </div>

        <div className="th-standing">
          <div className="th-rank" style={{ color: standing.rank.hex }}>
            <div className="th-rank-name">{standing.rank.name}</div>
            <div className="th-rank-lvl">Level {standing.level}</div>
          </div>
          <div className="th-xpwrap">
            <div className="th-xpbar">
              <span style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div className="th-xpmeta">
              <span>{standing.totalXp.toLocaleString()} XP</span>
              {standing.next && (
                <span>
                  {standing.toNextRank.toLocaleString()} to {standing.next.name}
                </span>
              )}
            </div>
          </div>
          <div className="th-microstats">
            <Micro n={standing.counts.total} label="trophies" />
            <Micro n={standing.counts.verified} label="verified" accent />
            <Micro n={standing.counts.byArena.field} label="field" />
            <Micro n={standing.counts.byArena.stage} label="stage" />
            <Micro n={streak} label="streak🔥" />
          </div>
        </div>
      </header>

      <nav className="th-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`th-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "pursuits" && pursuits.length > 0 && (
              <span className="th-badge">{pursuits.length}</span>
            )}
            {t.id === "case" && trophies.length > 0 && (
              <span className="th-badge">{trophies.length}</span>
            )}
          </button>
        ))}
        <button className="th-btn primary th-log-btn" onClick={() => onLog(null)}>
          🏆 Log a trophy
        </button>
      </nav>

      <div className="th-body">
        {tab === "briefing" && (
          <Briefing
            feed={feed}
            fallbackPicks={fallbackPicks}
            streak={streak}
            onGoDiscover={() => setTab("discover")}
          />
        )}
        {tab === "discover" && (
          <DiscoverFeed
            ranked={ranked}
            trackedIds={trackedIds}
            onTrack={onTrack}
            onLog={(o) => onLog(o)}
          />
        )}
        {tab === "case" && (
          <TrophyCase trophies={trophies} onRemove={onRemoveTrophy} onAdd={() => onLog(null)} />
        )}
        {tab === "pursuits" && (
          <Pursuits
            pursuits={pursuits}
            oppById={oppById}
            onStatus={onStatus}
            onRemove={onRemovePursuit}
            onLog={(o) => onLog(o)}
          />
        )}
      </div>

      {addOpen && (
        <AddTrophy
          prefill={addPrefill}
          onAdd={onAdd}
          onClose={() => {
            setAddOpen(false);
            setAddPrefill(null);
          }}
        />
      )}
    </div>
  );
}

function Micro({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className={`th-micro${accent ? " accent" : ""}`}>
      <b>{n}</b>
      <span>{label}</span>
    </div>
  );
}
