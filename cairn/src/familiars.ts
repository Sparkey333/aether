// The character canon. These three are *skins* over one fixed expression API
// (a name, an accent, a voice, an emote). Swapping them never touches logic —
// that is the whole point of keeping the bones separate.
//
// Each familiar is also a verb at the heart of the app:
//   Cinder = make · Murk = restore · Vane = watch.

import type { Kind, LensLevel, Moment } from "./types";

export type FamiliarId = "cinder" | "murk" | "vane";
export type Emote = "idle" | "blink" | "stir" | "alert" | "soft";

export interface Familiar {
  id: FamiliarId;
  name: string;
  animal: string;
  element: string;
  glyph: string;
  role: string;
  tagline: string;
  blurb: string;
  accent: string; // primary glow
  ink: string; // body
  adverbs: string[];
}

export const FAMILIARS: Record<FamiliarId, Familiar> = {
  cinder: {
    id: "cinder",
    name: "Cinder",
    animal: "soot-moth",
    element: "ember",
    glyph: "🜂",
    role: "the maker's familiar",
    tagline: "drawn to the light of whatever you just made",
    blurb:
      "A soot-winged moth with one ember vein. Warms when you finish something; logs every creation and save like a small proud flame.",
    accent: "#ff7a3c",
    ink: "#cdb4a0",
    adverbs: ["warmly", "approvingly", "brightly", "with a little singe", "quietly proud"],
  },
  murk: {
    id: "murk",
    name: "Murk",
    animal: "ghost-axolotl",
    element: "deep water",
    glyph: "🜄",
    role: "the undo familiar",
    tagline: "regrows what you lose, never judges the loss",
    blurb:
      "A translucent axolotl with black-pinprick eyes and bioluminescent frills. Regeneration incarnate — it is your undo, made calm and patient.",
    accent: "#5bd6c0",
    ink: "#a9c7d6",
    adverbs: ["calmly", "without judgement", "slowly", "gently", "unbothered"],
  },
  vane: {
    id: "vane",
    name: "Vane",
    animal: "ink-raven",
    element: "storm-shadow",
    glyph: "🜁",
    role: "the watcher",
    tagline: "keeps the lamp and the ledger, taps the glass when it's time",
    blurb:
      "A glitch-feathered raven with a static-blue eye-glint. The watchman of the constellation — it remembers everything and nudges, dry and unhurried.",
    accent: "#7aa2ff",
    ink: "#9aa0b4",
    adverbs: ["wryly", "with one eye open", "knowingly", "drily", "watchfully"],
  },
};

export const FAMILIAR_ORDER: FamiliarId[] = ["cinder", "murk", "vane"];

interface KindVoice {
  verb: string;
  emote: Emote;
  tallyable?: boolean;
}

const KIND_VOICE: Record<Kind, KindVoice> = {
  create: { verb: "made", emote: "stir", tallyable: true },
  save: { verb: "saved", emote: "soft", tallyable: true },
  edit: { verb: "tweaked", emote: "soft" },
  clip: { verb: "copied", emote: "stir" },
  paste: { verb: "pasted", emote: "soft" },
  screenshot: { verb: "captured", emote: "alert", tallyable: true },
  move: { verb: "moved", emote: "soft" },
  task: { verb: "set out to", emote: "alert" },
  note: { verb: "marked", emote: "soft" },
  link: { verb: "kept a link to", emote: "stir" },
};

const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

function ordinal(n: number): string {
  return ORDINALS[n] ?? `${n}th`;
}

// Stable, deterministic pick so a given moment always speaks the same way.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface Utterance {
  text: string;
  adverb: string;
  emote: Emote;
}

/** The familiar's gentle line about one Moment, at the chosen Lens grain. */
export function voice(
  fam: Familiar,
  m: Moment,
  lens: LensLevel,
  tally: number,
): Utterance {
  const kv = KIND_VOICE[m.kind];
  const adverb = fam.adverbs[hash(m.id) % fam.adverbs.length];

  if (lens === "whisper") {
    return { text: m.summary, adverb: "", emote: "soft" };
  }

  let text = `${kv.verb} ${m.summary}`;
  if (kv.tallyable && tally > 1) {
    text += ` — your ${ordinal(tally)} ${m.kind === "screenshot" ? "shot" : m.kind} today`;
  }

  if (lens === "verbose" && m.detail && m.detail !== m.summary) {
    const d = m.detail.length > 120 ? m.detail.slice(0, 120) + "…" : m.detail;
    text += `\n${d}`;
  }

  return { text, adverb, emote: kv.emote };
}

/** A short idle greeting for the header. */
export function greeting(fam: Familiar): string {
  switch (fam.id) {
    case "cinder":
      return "watching for your next spark";
    case "murk":
      return "here, and forgetting nothing";
    case "vane":
      return "the ledger is open";
  }
}
