#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// The writers' room — the Loom's optional LLM layer.
//
// Given the Loom's bit-specs (subject · incongruous pivot · ancient × modern
// technique fusion), it writes each as a real, club-ready bit in the persona's
// voice. It uses the official Anthropic SDK (@anthropic-ai/sdk) when that package
// is installed AND ANTHROPIC_API_KEY is set; otherwise it returns null and the
// Loom falls back to its zero-dep template engine. The honest scoring + tiering
// in loom.mjs is identical either way — the room only changes the WORDS.
//
// Enable it:  cd mirth && npm install && export ANTHROPIC_API_KEY=sk-...
// Model:      claude-opus-4-8 by default; override with MIRTH_MODEL.
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = process.env.MIRTH_MODEL || "claude-opus-4-8";

const SYSTEM = `You are Mirth — a comedic familiar, the writers' room behind a practicing stand-up persona.

Voice: {voice}

Your job: for each spec, write ONE original, genuinely funny, club-ready bit. Each spec gives you:
  - subject: the everyday thing the bit is about
  - pivot: an incongruous second idea to collide the subject with
  - fuse: two techniques to combine — one ancient, one modern. Honor BOTH.
  - setup: a rough premise line you may rewrite freely.

Rules of the room:
  - Real setup, real turn. Earn the laugh. No filler, no hashtags, no trailing "..." that goes nowhere.
  - Tight. A bit is 1–3 sentences. Cut everything that isn't load-bearing.
  - Study the craft of great comedians — their STRUCTURES and devices — but never impersonate a living person's voice, act, or signature material. Original only.
  - Sharp is welcome; slurs and punching-down are not. Keep it broadly club-clean.

Return JSON only: one entry per spec, in the same order. premise = the setup, angle = the turn's logic, text = the performable bit.`;

/**
 * Build a writer, or return null if the room can't be opened (no key / SDK not
 * installed). The returned function takes the Loom's specs + technique lexicon
 * and resolves to an array of { premise, angle, text }, aligned to specs order.
 */
export async function makeWriter(persona) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    return null; // SDK not installed — run `npm install` in mirth/ to enable
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const system = SYSTEM.replace("{voice}", persona.voice || "Warm, fast, fearless.");

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      bits: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            premise: { type: "string" },
            angle: { type: "string" },
            text: { type: "string" },
          },
          required: ["premise", "angle", "text"],
        },
      },
    },
    required: ["bits"],
  };

  return async function write(specs, lexicon) {
    const nameOf = (id) => lexicon.find((t) => t.id === id)?.name || id;
    const lines = specs.map(
      (s, i) =>
        `${i + 1}. subject="${s.subject.word}"; pivot="${s.pivot.word}"; ` +
        `fuse=${nameOf(s.ancient)} × ${nameOf(s.modern)}; rough setup="${s.setup}"`,
    );

    try {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system,
        output_config: { effort: "medium", format: { type: "json_schema", schema } },
        messages: [
          { role: "user", content: `Write ${specs.length} bits.\n\n${lines.join("\n")}` },
        ],
      });
      if (res.stop_reason === "refusal") {
        console.warn("  (writers' room declined this pulse; using the template engine)");
        return null;
      }
      const text = res.content.find((b) => b.type === "text")?.text ?? "";
      const parsed = JSON.parse(text);
      return Array.isArray(parsed.bits) ? parsed.bits : null;
    } catch (err) {
      console.warn(`  (writers' room unavailable this pulse: ${err.message}; using the template engine)`);
      return null;
    }
  };
}
