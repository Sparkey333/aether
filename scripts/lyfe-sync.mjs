// lyfe-sync — turn the LIFE Tree Master Tracker (the FACT layer) into the Lyfe
// seed (facts + an INTERPRETATION layer: a pillar for each project). This is the
// auto-categorizer that fills the tracker's own blank "Category (optimize later)"
// column. Pure Node, zero deps — run with: npm run lyfe:sync
//
// Provenance doctrine: facts come straight from tracker.raw.md untouched; the
// pillar is clearly labelled as derived, and the few classifier overrides are
// listed explicitly below so nothing is hidden.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src/data/lyfe/tracker.raw.md");
const OUT = join(ROOT, "src/data/lyfe/projects.seed.json");

// ── The classifier: first match wins, top to bottom. The same keyword logic
//    Lyfe will eventually run live over any new project. ───────────────────
const RULES = [
  ["craft", /\bmusic\b|album|guitar|flashjam|live set|solo live|\bmodes\b|cymatics|\bart(s|work)?\b|\bgame|arcade|pokemon|tribes|writing|\bwrite\b|\bblog|photo|video|youtube|rumble|woodwork|horror of/i],
  ["body", /fitness|diet|alchemy|personal care|physical|mental prep|\bhealth|hunting|shooting|scuba|\bhik|snowmobile|mountain|summit|hot spring|\bfarm|garden|pond|\bdam\b|sanctuary|\bzoo\b|husky|breeding|wolfden|vacation|vacay|\btravel|florissant|cripple creek|build house|seed pod/i],
  ["spirit", /spirit|church|medit|truth|conscious|subconscious|therapy|temple|healing|mind reading|\bjudge\b|peter pan|3 ?6 ?9|3 6 2009|frequency vibration|\bbridge\b|\bunity\b|universal law/i],
  ["work", /career|business|\bllc\b|finance|real estate|rental|\bstore\b|market|land develop|legal|politic|legislat|license|\bown\b|spheres|manufactur|auditorium|home offices/i],
  ["service", /charity|nonprofit|non profit|mentor|teach|dojo|guide young|communit|\bmembers\b|women/i],
];

// Explicit overrides where the keyword classifier guesses wrong (by Todoist id).
// Kept tiny and visible on purpose — this is the interpretation we stand behind.
const OVERRIDES = {
  "6P7QmmFfR8fFF7Rj": "mind", // Pokemon Robots AI — robotics/AI, not a game
  "6PC5Hm67xXVxCmfQ": "craft", // Sin Eater - DTDT — a music project
  "6P7QqHVPRHqqf6mX": "mind", // Space Travel — space science, not a vacation
  "6PC5PfgHgPrR3JWV": "craft", // Treasure Island — a story/game
};

function classify(name) {
  for (const [pillar, re] of RULES) if (re.test(name)) return pillar;
  return "mind"; // default: the engineering/science/learning bench
}

const cell = (s) => s.trim();
const num = (s) => {
  const n = parseInt(cell(s), 10);
  return Number.isFinite(n) ? n : 0;
};

const lines = readFileSync(SRC, "utf8")
  .split("\n")
  .filter((l) => l.startsWith("|") && !/^\|\s*:?-+/.test(l)); // drop the separator row

const projects = [];
let overrideCount = 0;
for (const line of lines) {
  const c = line.split("|").map(cell);
  // c[0] is "" (leading pipe). Header row has "Group \#" in c[1].
  if (c[1] === "Group \\#" || c[2] === "Project") continue;
  const name = c[2];
  const todoistId = c[5];
  if (!name || !todoistId) continue;

  const pillar = OVERRIDES[todoistId] ?? classify(name);
  if (OVERRIDES[todoistId]) overrideCount++;

  const total = num(c[10]);
  const stateRaw = c[11].toLowerCase();
  projects.push({
    id: `t-${todoistId}`,
    name,
    pillar,
    group: c[1] === "" ? null : num(c[1]),
    todoistId,
    sections: num(c[6]),
    tasks: num(c[7]),
    subtasks: num(c[8]),
    totalItems: total,
    state: stateRaw.includes("shell") ? "shell" : "active",
    source: "todoist-tracker",
  });
}

const byPillar = projects.reduce((m, p) => ((m[p.pillar] = (m[p.pillar] ?? 0) + 1), m), {});
const today = new Date().toISOString().slice(0, 10);

const out = {
  meta: {
    title: "LIFE Tree — full sync",
    capturedFrom:
      "Google Drive · 'LIFE Tree Master Tracker — Project Index (138 projects, current)' (fileId 1FZeko6kvSR1d-YW8LL_ISefJG1KQjkkSTWIKHQWDy6I)",
    capturedAt: today,
    completeness: `complete — ${projects.length} projects parsed from tracker.raw.md`,
    pillarMapping: `derived by scripts/lyfe-sync.mjs — ${overrideCount} explicit overrides; the rest by keyword classifier. Re-sort freely.`,
    byPillar,
    doctrine:
      "Facts (name/counts/state/group) are verbatim from the tracker; pillar is the only derived field and is labelled as such.",
  },
  projects,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`lyfe-sync: wrote ${projects.length} projects → ${OUT}`);
console.log("by pillar:", byPillar);
