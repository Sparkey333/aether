// Mirth domain types. Every bit carries a provenance tier — Aether's doctrine,
// turned from the land to the laugh: keep every bit, label every bit, and let no
// bit borrow the authority of a real laugh it has not earned.
// See ../../content/canon/mirth.md and ../../docs/MIRTH.md.

/** A-killed is the only tier the Loom CANNOT assign itself — only a room can. */
export type BitTier = "A-killed" | "B-crafted" | "C-styled" | "D-raw";

export type Era = "ancient" | "modern";

export interface Technique {
  id: string;
  name: string;
  era: Era;
  /** structure | frame | delivery | bit */
  kind: string;
  note: string;
}

/** One real performance of a bit. Laughs are the only thing that promotes to A. */
export interface Performance {
  at: string;
  venue: "chat" | "set" | "recording" | "stage";
  laughs: number;
  audienceSize: number;
}

/** A unit of comedy. Echoes Aether's Hypothesis: always carries its evidence. */
export interface Bit {
  id: string;
  createdAt: string;
  premise: string;        // the setup
  angle: string;          // the turn / punchline logic
  text: string;           // the rendered, human-readable bit
  subject: string;
  pivot: string;          // the incongruous second domain that makes the fusion
  technique: string[];    // [ancientId, modernId] — the move pair
  lineage?: string;       // studied influence, DISCLOSED — never impersonation
  tier: BitTier;
  performances: Performance[];
  // honest measurement — mirrors Hypothesis in Aether's src/lib/types.ts.
  // In Phase 1 this is STRUCTURAL SURPRISE (incongruity vs a random-pivot
  // baseline), explicitly NOT a laugh measurement. It can promote to B, never A.
  observed: number;
  expected: number;
  sd: number;
  z: number;
  confidence: number;
}

export interface Persona {
  id: string;
  name: string;
  form: number;
  level: number;
  practiceXp: number;
  movePool: string[];     // learned technique ids
  setList: string[];      // A-killed bit ids — earned in a room
  evolution: { killedNeeded: number; nextForm: string; note: string };
  voice: string;
}

/** The Loom's output, written each pulse — sibling to Aether's hypotheses.json. */
export interface MirthSet {
  generatedAt: string;
  engine: string;
  note: string;
  params: Record<string, number>;
  persona: Pick<Persona, "id" | "name" | "form" | "level"> & { movePoolSize: number };
  set: Bit[];     // the sequenced set (opener → build → closer)
  shelf: Bit[];   // kept, not deleted — the seed bank of bombs and near-misses
  vows: string[];
}
