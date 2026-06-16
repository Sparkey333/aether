"use client";

import type { Hypothesis, POI } from "@/lib/types";
import { TIERS } from "@/lib/tiers";

interface Props {
  data: { generatedAt: string | null; hypotheses: Hypothesis[]; baseline: unknown } | null;
  pois: POI[];
}

export default function LoomFeed({ data, pois }: Props) {
  const nameOf = (id: string) => pois.find((p) => p.id === id)?.name ?? id;
  const hyps = data?.hypotheses ?? [];

  return (
    <aside className="panel right">
      <div className="section-title">The Loom · pattern feed</div>

      {hyps.length === 0 ? (
        <p className="empty">
          The Loom is still. Run a heartbeat to let it seek alignments across your sites and grid
          nodes — every line judged against a random-chance baseline:
          <br />
          <br />
          <span className="kbd">npm run heartbeat:run</span>
          <br />
          <br />
          Detected lines and nexus points appear here with their confidence and how far they beat
          chance.
        </p>
      ) : (
        <>
          {data?.generatedAt && (
            <p className="empty">last pulse: {new Date(data.generatedAt).toLocaleString()}</p>
          )}
          {hyps.map((h) => (
            <div key={h.id} className="hyp">
              <div className="h-title" style={{ color: TIERS[h.tier].hex }}>
                {h.kind === "alignment" ? "⊶ Alignment" : "✦ Nexus"} · {h.memberIds.length} nodes
              </div>
              <div className="h-stat">{h.note}</div>
              <div className="h-stat" style={{ marginTop: 4 }}>
                observed {h.observed} vs chance {h.expected.toFixed(1)}±{h.sd.toFixed(1)} · z=
                {h.z.toFixed(1)}
              </div>
              <div className="h-stat">{h.memberIds.map(nameOf).join(" — ")}</div>
              <div className="bar">
                <span style={{ width: `${Math.round(h.confidence * 100)}%` }} />
              </div>
            </div>
          ))}
        </>
      )}

      <div className="legend-note">
        Confidence rises only when a pattern beats what a random field <em>with the same
        clustering</em> would throw by chance. Honest lines, not wishful ones.
        <br />
        <br />
        The null is now <em>density-matched</em>: it resamples a random field that preserves how
        these sites cluster, so z measures alignment, not the fact that sacred places clump
        together. (A uniform-random null — which counts clustering as signal — is kept only for
        contrast.) Each line is judged against the null&apos;s <em>longest</em> line; each nexus
        against its <em>busiest</em> node.
      </div>
    </aside>
  );
}
