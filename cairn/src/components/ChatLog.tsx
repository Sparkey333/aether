// The live log: the familiar narrating, newest at the bottom-feel but newest
// first in the stream. Each line carries quiet affordances to curate it into a
// to-do, finish it, or wave it away — and that curation is what undo/redo moves.

import type { Familiar } from "../familiars";
import { voice } from "../familiars";
import type { Kind, LensLevel, Moment, Status } from "../types";

const KIND_GLYPH: Record<Kind, string> = {
  create: "✦",
  save: "▣",
  edit: "✎",
  clip: "⧉",
  paste: "⊟",
  screenshot: "▦",
  move: "⇄",
  task: "◇",
  note: "·",
  link: "↗",
};

function ago(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 45) return "just now";
  if (s < 90) return "a min ago";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Cumulative same-kind tally for the day, so "your 4th save today" is honest.
function buildTallies(moments: Moment[]): Record<string, number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const cutoff = startOfDay.getTime();
  const counts: Partial<Record<Kind, number>> = {};
  const out: Record<string, number> = {};
  // oldest first so counts grow with the day
  for (const m of [...moments].reverse()) {
    if (m.ts < cutoff) continue;
    counts[m.kind] = (counts[m.kind] ?? 0) + 1;
    out[m.id] = counts[m.kind]!;
  }
  return out;
}

export function ChatLog({
  moments,
  familiar,
  lens,
  onCurate,
  onOpen,
}: {
  moments: Moment[];
  familiar: Familiar;
  lens: LensLevel;
  onCurate: (id: string, status: Status) => void;
  onOpen: (target: string, kind: "url" | "path" | "app") => void;
}) {
  const tallies = buildTallies(moments);

  if (moments.length === 0) {
    return (
      <div className="log empty">
        <p>nothing yet. copy something, take a screenshot, or jot a note below —</p>
        <p className="muted">{familiar.name} is watching.</p>
      </div>
    );
  }

  return (
    <div className="log">
      {moments.map((m) => {
        const u = voice(familiar, m, lens, tallies[m.id] ?? 1);
        return (
          <article key={m.id} className={`moment k-${m.kind} st-${m.status}`}>
            <div className="m-glyph" aria-hidden>
              {KIND_GLYPH[m.kind]}
            </div>
            <div className="m-body">
              <div className="m-text">
                {u.text.split("\n").map((line, i) => (
                  <span key={i} className={i === 0 ? "m-line" : "m-detail"}>
                    {line}
                  </span>
                ))}
                {u.adverb && <span className="m-adverb">, {u.adverb}</span>}
              </div>
              <div className="m-meta">
                <span className="m-ago">{ago(m.ts)}</span>
                <span className="m-actions">
                  {m.links.length > 0 && (
                    <button onClick={() => onOpen(m.links[0], "url")}>open</button>
                  )}
                  {m.payloadPath && (
                    <button onClick={() => onOpen(m.payloadPath as string, "path")}>reveal</button>
                  )}
                  {(m.status === "logged" || m.status === "dismissed") && (
                    <button onClick={() => onCurate(m.id, "open")}>→ to-do</button>
                  )}
                  {m.status === "open" && (
                    <button className="primary" onClick={() => onCurate(m.id, "done")}>
                      done
                    </button>
                  )}
                  {m.status === "done" && (
                    <button onClick={() => onCurate(m.id, "open")}>↺ reopen</button>
                  )}
                  {m.status !== "dismissed" && m.status !== "done" && (
                    <button className="ghost" onClick={() => onCurate(m.id, "dismissed")}>
                      dismiss
                    </button>
                  )}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
