"use client";

import { disciplineName, glyphOf } from "@/lib/trophy/library";
import type { Opportunity, Pursuit, PursuitStatus } from "@/lib/trophy/types";
import { windowLabel } from "./common";

const STATUSES: PursuitStatus[] = [
  "eyeing",
  "training",
  "registered",
  "submitted",
  "completed",
  "abandoned",
];

const STATUS_LABEL: Record<PursuitStatus, string> = {
  eyeing: "Eyeing",
  training: "Training / Building",
  registered: "Registered",
  submitted: "Submitted",
  completed: "Completed",
  abandoned: "Set aside",
};

interface Props {
  pursuits: Pursuit[];
  oppById: Map<string, Opportunity>;
  onStatus: (id: string, status: PursuitStatus) => void;
  onRemove: (id: string) => void;
  onLog: (opp: Opportunity) => void;
}

export default function Pursuits({ pursuits, oppById, onStatus, onRemove, onLog }: Props) {
  if (pursuits.length === 0) {
    return (
      <p className="th-empty">
        No pursuits tracked yet. Find a race, festival, or collection in <b>Discover</b> and hit
        <b> ＋ Track</b> to start planning for it.
      </p>
    );
  }

  const byStatus = (s: PursuitStatus) => pursuits.filter((p) => p.status === s);

  return (
    <div className="th-pursuits">
      {STATUSES.filter((s) => byStatus(s).length > 0).map((s) => (
        <div key={s} className="th-pcol">
          <div className="th-pcol-title">
            {STATUS_LABEL[s]} <span>{byStatus(s).length}</span>
          </div>
          {byStatus(s).map((p) => {
            const opp = oppById.get(p.opportunityId);
            return (
              <div key={p.id} className="th-pursuit">
                <div className="th-pursuit-head">
                  <span className="th-glyph small">
                    {opp ? glyphOf(opp.discipline) : "•"}
                  </span>
                  <div className="th-pursuit-title">{opp?.title ?? p.opportunityId}</div>
                </div>
                {opp && (
                  <div className="th-pursuit-meta">
                    {disciplineName(opp.discipline)} · {windowLabel(opp.window)}
                  </div>
                )}
                {p.targetDate && (
                  <div className="th-pursuit-target">🎯 target {p.targetDate}</div>
                )}
                {p.notes && <div className="th-pursuit-notes">{p.notes}</div>}
                <div className="th-pursuit-actions">
                  <select
                    className="th-select small"
                    value={p.status}
                    onChange={(e) => onStatus(p.id, e.target.value as PursuitStatus)}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABEL[st]}
                      </option>
                    ))}
                  </select>
                  {opp && (
                    <button className="th-btn ghost small" onClick={() => onLog(opp)}>
                      🏆 Log
                    </button>
                  )}
                  <button className="th-x small" onClick={() => onRemove(p.id)} title="Remove">
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
