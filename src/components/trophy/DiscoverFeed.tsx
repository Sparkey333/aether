"use client";

import { useMemo, useState } from "react";
import { disciplineName, disciplinesByArena, glyphOf } from "@/lib/trophy/library";
import type { Arena, Opportunity } from "@/lib/trophy/types";
import { ArenaTag, FitBar, windowLabel } from "./common";

interface Props {
  ranked: Opportunity[];
  trackedIds: Set<string>;
  onTrack: (opp: Opportunity) => void;
  onLog: (opp: Opportunity) => void;
}

export default function DiscoverFeed({ ranked, trackedIds, onTrack, onLog }: Props) {
  const [arena, setArena] = useState<Arena | "all">("all");
  const [discipline, setDiscipline] = useState<string>("all");
  const [q, setQ] = useState("");
  const [hideFlagged, setHideFlagged] = useState(false);

  const disciplineChoices = useMemo(() => {
    if (arena === "all") return [];
    return disciplinesByArena(arena);
  }, [arena]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ranked.filter((o) => {
      if (arena !== "all" && o.arena !== arena) return false;
      if (discipline !== "all" && o.discipline !== discipline) return false;
      if (hideFlagged && o.integrityFlags?.length) return false;
      if (needle) {
        const hay = `${o.title} ${o.org ?? ""} ${o.place.label} ${(o.tags ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [ranked, arena, discipline, q, hideFlagged]);

  return (
    <div className="th-discover">
      <div className="th-filters">
        <input
          className="th-search"
          placeholder="Search races, festivals, collections…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="th-seg">
          {(["all", "field", "stage"] as const).map((a) => (
            <button
              key={a}
              className={`th-seg-btn${arena === a ? " active" : ""}`}
              onClick={() => {
                setArena(a);
                setDiscipline("all");
              }}
            >
              {a === "all" ? "All" : a === "field" ? "◈ Field" : "✦ Stage"}
            </button>
          ))}
        </div>
        {disciplineChoices.length > 0 && (
          <select
            className="th-select"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          >
            <option value="all">All disciplines</option>
            {disciplineChoices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.glyph} {d.name}
              </option>
            ))}
          </select>
        )}
        <label className="th-check">
          <input
            type="checkbox"
            checked={hideFlagged}
            onChange={(e) => setHideFlagged(e.target.checked)}
          />
          Hide flagged
        </label>
        <span className="th-count">{shown.length} opportunities</span>
      </div>

      <div className="th-opps">
        {shown.map((o) => (
          <OppCard
            key={o.id}
            opp={o}
            tracked={trackedIds.has(o.id)}
            onTrack={() => onTrack(o)}
            onLog={() => onLog(o)}
          />
        ))}
        {shown.length === 0 && (
          <p className="th-empty">Nothing matches yet. Widen the filters, or run the Hunt to discover more.</p>
        )}
      </div>
    </div>
  );
}

function OppCard({
  opp,
  tracked,
  onTrack,
  onLog,
}: {
  opp: Opportunity;
  tracked: boolean;
  onTrack: () => void;
  onLog: () => void;
}) {
  const flagged = (opp.integrityFlags?.length ?? 0) > 0;
  return (
    <div className={`th-opp${flagged ? " flagged" : ""}`}>
      <div className="th-opp-top">
        <span className="th-glyph" title={disciplineName(opp.discipline)}>
          {glyphOf(opp.discipline)}
        </span>
        <div className="th-opp-head">
          <div className="th-opp-title">{opp.title}</div>
          <div className="th-opp-sub">
            <ArenaTag arena={opp.arena} />
            <span>{disciplineName(opp.discipline)}</span>
            {opp.discoveredAt && <span className="th-new">newly discovered</span>}
          </div>
        </div>
        <FitBar fit={opp.fit ?? 0} />
      </div>

      <div className="th-opp-meta">
        <span>📍 {opp.place.label}</span>
        <span>🗓 {windowLabel(opp.window)}</span>
        {opp.cost && <span>💵 {opp.cost}</span>}
      </div>
      {opp.reward && <div className="th-opp-reward">🏅 {opp.reward}</div>}

      {opp.fitReasons && opp.fitReasons.length > 0 && (
        <div className="th-reasons">
          {opp.fitReasons.map((r, i) => (
            <span key={i} className="th-reason">
              {r}
            </span>
          ))}
        </div>
      )}

      {flagged && (
        <div className="th-flags">
          ⚠ Integrity: {opp.integrityFlags!.join("; ")}
        </div>
      )}

      <div className="th-opp-actions">
        <button className={`th-btn${tracked ? " ghost" : ""}`} onClick={onTrack} disabled={tracked}>
          {tracked ? "Tracking ✓" : "＋ Track"}
        </button>
        <button className="th-btn primary" onClick={onLog}>
          🏆 Log a trophy
        </button>
        {opp.url && (
          <a className="th-btn ghost" href={opp.url} target="_blank" rel="noreferrer">
            Open ↗
          </a>
        )}
      </div>
    </div>
  );
}
