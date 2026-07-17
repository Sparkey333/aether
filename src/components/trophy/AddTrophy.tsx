"use client";

import { useMemo, useState } from "react";
import { disciplinesByArena } from "@/lib/trophy/library";
import { makeProof, PROOF_TIERS } from "@/lib/trophy/proof";
import { trophyXp } from "@/lib/trophy/gamify";
import type {
  Arena,
  Evidence,
  Opportunity,
  ProofMethod,
  Trophy,
  TrophyKind,
} from "@/lib/trophy/types";
import { newId } from "@/lib/trophy/store";
import { ProofBadge } from "./common";

const METHODS: { value: ProofMethod; label: string }[] = [
  { value: "chip-time", label: "Chip time (verified)" },
  { value: "official-results", label: "Official results (verified)" },
  { value: "gps-track", label: "GPS track (verified)" },
  { value: "summit-log", label: "Summit log / register (verified)" },
  { value: "jury-decision", label: "Jury decision (verified)" },
  { value: "acceptance-letter", label: "Acceptance / selection (verified)" },
  { value: "certificate", label: "Certificate (documented)" },
  { value: "receipt", label: "Receipt / entry proof (documented)" },
  { value: "photo", label: "Photo (documented)" },
  { value: "video", label: "Video (documented)" },
  { value: "witness", label: "Named witness (attested)" },
  { value: "self-report", label: "Self-report only (claimed)" },
];

const KINDS: TrophyKind[] = [
  "medal",
  "finish",
  "placement",
  "pr",
  "summit",
  "catch",
  "acceptance",
  "award",
  "shirt",
  "badge",
];

interface Props {
  prefill?: Opportunity | null;
  onAdd: (t: Trophy) => void;
  onClose: () => void;
}

export default function AddTrophy({ prefill, onAdd, onClose }: Props) {
  const [title, setTitle] = useState(prefill ? `${prefill.title} — Finisher` : "");
  const [arena, setArena] = useState<Arena>(prefill?.arena ?? "field");
  const [discipline, setDiscipline] = useState(prefill?.discipline ?? "road-running");
  const [kind, setKind] = useState<TrophyKind>(prefill?.arena === "stage" ? "acceptance" : "medal");
  const [difficulty, setDifficulty] = useState(2);
  const [earnedAt, setEarnedAt] = useState(new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState(prefill?.place.label ?? "");
  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([
    { method: (prefill?.verifyBy?.[0] as ProofMethod) ?? "photo", label: "" },
  ]);

  const disciplineChoices = disciplinesByArena(arena);

  // A row counts as evidence once a method is chosen; a blank note defaults to the
  // method's own name. Preview and submit share this so what you see is what you save.
  const methodName = (m: ProofMethod) =>
    METHODS.find((x) => x.value === m)?.label.replace(/\s*\(.*\)$/, "") ?? m;
  const usableEvidence = (list: Evidence[]): Evidence[] =>
    list
      .filter((e) => e.method)
      .map((e) => ({
        method: e.method,
        label: e.label.trim() || methodName(e.method),
        url: e.url?.trim() || undefined,
      }));

  const preview = useMemo(() => {
    const proof = makeProof(usableEvidence(evidence));
    return {
      tier: proof.tier,
      xp: trophyXp({ kind, difficulty, proof }),
      weight: PROOF_TIERS[proof.tier].weight,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidence, kind, difficulty]);

  const setEv = (i: number, patch: Partial<Evidence>) =>
    setEvidence((list) => list.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const addEv = () => setEvidence((list) => [...list, { method: "photo", label: "" }]);
  const rmEv = (i: number) => setEvidence((list) => list.filter((_, j) => j !== i));

  const submit = () => {
    if (!title.trim()) return;
    const usable = usableEvidence(evidence);
    const t: Trophy = {
      id: newId("t"),
      title: title.trim(),
      arena,
      discipline,
      kind,
      opportunityId: prefill?.id,
      earnedAt,
      place: place.trim() || undefined,
      difficulty,
      result: result.trim() || undefined,
      notes: notes.trim() || undefined,
      proof: makeProof(usable),
      xp: 0, // recomputed by the store on save
    };
    onAdd(t);
  };

  return (
    <div className="th-modal-scrim" onClick={onClose}>
      <div className="th-modal" onClick={(e) => e.stopPropagation()}>
        <div className="th-modal-head">
          <h3>Log a trophy</h3>
          <button className="th-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <label className="th-field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pikes Peak Ascent — Finisher" />
        </label>

        <div className="th-grid2">
          <label className="th-field">
            <span>Arena</span>
            <select
              value={arena}
              onChange={(e) => {
                const a = e.target.value as Arena;
                setArena(a);
                setDiscipline(disciplinesByArena(a)[0]?.id ?? discipline);
              }}
            >
              <option value="field">◈ Field (physical)</option>
              <option value="stage">✦ Stage (creative)</option>
            </select>
          </label>
          <label className="th-field">
            <span>Discipline</span>
            <select value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
              {disciplineChoices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.glyph} {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="th-grid2">
          <label className="th-field">
            <span>Kind</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as TrophyKind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="th-field">
            <span>Difficulty · {difficulty}×</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="th-grid2">
          <label className="th-field">
            <span>Date earned</span>
            <input type="date" value={earnedAt} onChange={(e) => setEarnedAt(e.target.value)} />
          </label>
          <label className="th-field">
            <span>Place</span>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Boulder, CO" />
          </label>
        </div>

        <label className="th-field">
          <span>Result (optional)</span>
          <input value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. 3:58:11 · 42/310 AG" />
        </label>

        <div className="th-field">
          <span>Proof — attach evidence</span>
          {evidence.map((e, i) => (
            <div className="th-ev-row" key={i}>
              <select value={e.method} onChange={(ev) => setEv(i, { method: ev.target.value as ProofMethod })}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Describe it — e.g. chip time 48:22"
                value={e.label}
                onChange={(ev) => setEv(i, { label: ev.target.value })}
              />
              <input
                placeholder="URL (optional)"
                value={e.url ?? ""}
                onChange={(ev) => setEv(i, { url: ev.target.value })}
              />
              {evidence.length > 1 && (
                <button className="th-x small" onClick={() => rmEv(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="th-btn ghost small" onClick={addEv}>
            ＋ Add evidence
          </button>
        </div>

        <div className="th-preview">
          <div>
            Proof tier <ProofBadge tier={preview.tier} /> — XP counts at{" "}
            <b>{Math.round(preview.weight * 100)}%</b>
          </div>
          <div className="th-preview-xp">
            +{preview.xp} XP
          </div>
        </div>
        <p className="th-note">
          The tier is derived from your strongest evidence — never entered by hand. A bare claim is
          allowed and never hidden, but it counts for a fraction until you back it. That is the whole
          point: the board can&apos;t be gamed.
        </p>

        <div className="th-modal-actions">
          <button className="th-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="th-btn primary" onClick={submit} disabled={!title.trim()}>
            Add to Trophy Case
          </button>
        </div>
      </div>
    </div>
  );
}
