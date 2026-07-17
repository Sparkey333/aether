"use client";

import { PROOF_TIERS } from "@/lib/trophy/proof";
import type { ProofTier, Window } from "@/lib/trophy/types";

/** The open proof-tier chip — the integrity marker worn by every trophy. */
export function ProofBadge({ tier, title }: { tier: ProofTier; title?: string }) {
  const t = PROOF_TIERS[tier];
  return (
    <span
      className="th-proof"
      style={{ color: t.hex, borderColor: t.hex }}
      title={title ?? t.blurb}
    >
      <b>{t.short}</b> {t.label}
    </span>
  );
}

/** A 0..1 fit meter with an optional numeric label. */
export function FitBar({ fit }: { fit: number }) {
  const pct = Math.round(fit * 100);
  return (
    <div className="th-fit" title={`Fit ${pct}%`}>
      <div className="th-fit-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="th-fit-num">{pct}</span>
    </div>
  );
}

/** Arena tag. */
export function ArenaTag({ arena }: { arena: "field" | "stage" }) {
  return (
    <span className={`th-arena th-arena-${arena}`}>
      {arena === "field" ? "◈ Field" : "✦ Stage"}
    </span>
  );
}

/** Human-readable window / deadline. */
export function windowLabel(w: Window): string {
  if (w.rolling) return "Rolling · open now";
  if (!w.date) return "TBA";
  const d = new Date(w.date + "T00:00:00Z");
  const now = Date.now();
  const days = Math.round((d.getTime() - now) / 86_400_000);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (days < 0) return `${date} · passed`;
  if (days === 0) return `${date} · today`;
  if (days <= 60) return `${date} · in ${days}d`;
  return date;
}
