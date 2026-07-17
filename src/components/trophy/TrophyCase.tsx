"use client";

import { useMemo, useState } from "react";
import { disciplineName, glyphOf } from "@/lib/trophy/library";
import type { Trophy } from "@/lib/trophy/types";
import { ArenaTag, ProofBadge } from "./common";

interface Props {
  trophies: Trophy[];
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export default function TrophyCase({ trophies, onRemove, onAdd }: Props) {
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const shown = useMemo(
    () =>
      [...trophies]
        .filter((t) => !verifiedOnly || t.proof.tier === "verified")
        .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt)),
    [trophies, verifiedOnly],
  );

  return (
    <div className="th-case">
      <div className="th-filters">
        <label className="th-check">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          Verified only
        </label>
        <span className="th-count">
          {shown.length} of {trophies.length} trophies
        </span>
        <button className="th-btn primary" style={{ marginLeft: "auto" }} onClick={onAdd}>
          🏆 Log a trophy
        </button>
      </div>

      <div className="th-trophies">
        {shown.map((t) => (
          <div key={t.id} className="th-trophy">
            <div className="th-trophy-top">
              <span className="th-glyph" title={disciplineName(t.discipline)}>
                {glyphOf(t.discipline)}
              </span>
              <div className="th-trophy-head">
                <div className="th-trophy-title">{t.title}</div>
                <div className="th-opp-sub">
                  <ArenaTag arena={t.arena} />
                  <span>{disciplineName(t.discipline)}</span>
                </div>
              </div>
              <div className="th-xp-chip">+{t.xp}</div>
            </div>

            <div className="th-trophy-meta">
              <span>{new Date(t.earnedAt + "T00:00:00Z").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
              {t.place && <span>· {t.place}</span>}
              {t.result && <span>· {t.result}</span>}
            </div>

            <div className="th-trophy-proof">
              <ProofBadge tier={t.proof.tier} />
              <div className="th-ev-list">
                {t.proof.evidence.map((e, i) => (
                  <span key={i} className="th-ev">
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer">
                        {e.label || e.method}
                      </a>
                    ) : (
                      e.label || e.method
                    )}
                  </span>
                ))}
              </div>
            </div>

            <button className="th-trophy-rm" onClick={() => onRemove(t.id)} title="Remove">
              ✕
            </button>
          </div>
        ))}

        {shown.length === 0 && (
          <p className="th-empty">
            {verifiedOnly
              ? "No verified trophies yet — attach a chip time, GPS track, or jury acceptance to reach the top tier."
              : "Your Trophy Case is empty. Log your first win to start earning XP."}
          </p>
        )}
      </div>
    </div>
  );
}
