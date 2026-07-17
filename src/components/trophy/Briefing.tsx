"use client";

import { PROOF_ORDER, PROOF_TIERS } from "@/lib/trophy/proof";
import { disciplineName, glyphOf } from "@/lib/trophy/library";
import type { DiscoveryFeed, Opportunity } from "@/lib/trophy/types";
import { FitBar } from "./common";

interface Props {
  feed: DiscoveryFeed | null;
  /** in-app top picks, used when no heartbeat feed is present yet. */
  fallbackPicks: Opportunity[];
  streak: number;
  onGoDiscover: () => void;
}

export default function Briefing({ feed, fallbackPicks, streak, onGoDiscover }: Props) {
  const generated = feed?.generatedAt
    ? new Date(feed.generatedAt).toLocaleString()
    : null;

  return (
    <div className="th-briefing">
      <div className="th-brief-hero">
        <div>
          <div className="th-brief-kicker">The Hunt · morning briefing</div>
          <h2 className="th-brief-title">
            {feed
              ? `${feed.counts.library} opportunities in your library`
              : "Your opportunity library is ready"}
          </h2>
          <p className="th-brief-sub">
            {feed ? (
              <>
                Last pulse {generated} · {feed.counts.discovered} discovered,{" "}
                {feed.counts.newThisPulse} new this morning.
              </>
            ) : (
              <>
                Run <span className="th-kbd">npm run trophy:heartbeat</span> to let the Hunt expand
                and rank your library each morning. Until then, here are your best in-app picks.
              </>
            )}
          </p>
        </div>
        <div className="th-brief-streak">
          <div className="th-streak-num">{streak}</div>
          <div className="th-streak-label">day streak🔥</div>
        </div>
      </div>

      {feed && feed.newThisPulse.length > 0 && (
        <section className="th-brief-section">
          <div className="th-section-title">✨ New this pulse</div>
          <div className="th-newpills">
            {feed.newThisPulse.map((n) => (
              <span key={n.id} className="th-newpill">
                {n.arena === "field" ? "◈" : "✦"} {n.title}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="th-brief-section">
        <div className="th-section-title">🏅 Top picks for you</div>
        <div className="th-picks">
          {feed && feed.topPicks.length > 0
            ? feed.topPicks.map((p) => (
                <div key={p.id} className="th-pick">
                  <span className="th-glyph small">{glyphOf(p.discipline)}</span>
                  <div className="th-pick-body">
                    <div className="th-pick-title">{p.title}</div>
                    <div className="th-pick-reason">{p.reason || disciplineName(p.discipline)}</div>
                  </div>
                  <FitBar fit={p.fit} />
                </div>
              ))
            : fallbackPicks.map((o) => (
                <div key={o.id} className="th-pick">
                  <span className="th-glyph small">{glyphOf(o.discipline)}</span>
                  <div className="th-pick-body">
                    <div className="th-pick-title">{o.title}</div>
                    <div className="th-pick-reason">
                      {(o.fitReasons ?? [])[0] || disciplineName(o.discipline)}
                    </div>
                  </div>
                  <FitBar fit={o.fit ?? 0} />
                </div>
              ))}
        </div>
        <button className="th-btn ghost" onClick={onGoDiscover} style={{ marginTop: 12 }}>
          Browse the full library →
        </button>
      </section>

      <section className="th-brief-section th-integrity">
        <div className="th-section-title">🛡 Integrity</div>
        <p className="th-integrity-doctrine">
          {feed?.integrity.doctrine ??
            "No corruption possible — not even the appearance of it. A trophy's worth is capped by what it can prove; unverifiable rewards are surfaced honestly but ranked down."}
        </p>
        <div className="th-tierkey">
          {PROOF_ORDER.map((t) => {
            const m = PROOF_TIERS[t];
            return (
              <div key={t} className="th-tierkey-row">
                <span className="th-proof" style={{ color: m.hex, borderColor: m.hex }}>
                  <b>{m.short}</b> {m.label}
                </span>
                <span className="th-tierkey-weight">{Math.round(m.weight * 100)}% XP</span>
                <span className="th-tierkey-blurb">{m.blurb}</span>
              </div>
            );
          })}
        </div>
        {feed && feed.integrity.flagged.length > 0 && (
          <div className="th-flagged">
            <div className="th-flagged-title">⚠ {feed.integrity.flagged.length} listing(s) flagged & ranked down</div>
            {feed.integrity.flagged.map((f) => (
              <div key={f.id} className="th-flagged-row">
                <b>{f.title}</b> — {f.flags.join("; ")}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
