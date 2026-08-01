// Lyfe domain types. Lyfe reads the *person*: the scattered constellation of
// projects, tasks, and files across drives and apps, gathered into one honest
// picture. See content/canon/lyfe.md.

/** The pillars of a whole life. Mind · Body · Spirit are the core triad; the
 *  rest are the arenas those three express themselves through. A balanced life
 *  keeps no pillar drowned (the Water-Line). */
export type Pillar =
  | "mind" // learning, engineering, science, invention
  | "body" // health, fitness, food, land, animals
  | "spirit" // faith, meditation, truth, inner work
  | "craft" // music, writing, art, games — the making of beauty
  | "work" // career, business, wealth, the trade that sustains
  | "service"; // people, teaching, charity, community

/** Where Lyfe learned about a thing — provenance, the same doctrine as Aether.
 *  Never a delete key; always a label. */
export type ProjectSource =
  | "todoist-tracker" // the LIFE Tree Master Tracker (Todoist export)
  | "todoist-backup" // a Todoist .zip backup
  | "drive-folder" // a Google Drive folder
  | "local-scan" // a folder scanned on this machine (Tauri fs)
  | "manual"; // entered by hand

/** A life project — one branch of the tree. */
export interface LyfeProject {
  id: string;
  name: string;
  /** the suggested pillar; the person can always re-sort (see canon §"reveal, don't impose") */
  pillar: Pillar;
  /** the person's own grouping number from the master tracker (0–12, or null) */
  group: number | null;
  /** original Todoist project id, when known */
  todoistId?: string;
  sections?: number;
  tasks?: number;
  subtasks?: number;
  totalItems?: number;
  /** "active" = has work in it; "shell" = a named-but-empty intention */
  state: "active" | "shell";
  source: ProjectSource;
  note?: string;
}

/** A duplicate / fragmentation finding — the clutter the Vacuum will address. */
export interface Snag {
  id: string;
  kind: "duplicate" | "fragmented" | "shell" | "orphan";
  title: string;
  detail: string;
  /** project ids or file labels this snag concerns */
  members: string[];
  /** the SAFE suggested action — always backup-first, always reversible */
  suggestion: string;
}

/** The three tides every plan is weighed against — the Water-Line. */
export interface Tides {
  urgency: number; // 0..1 — how time-pressed
  priority: number; // 0..1 — how much it matters
  soul: number; // 0..1 — how much it feeds the spirit
}

/** A single pillar's standing in the balance read. */
export interface PillarBalance {
  pillar: Pillar;
  projects: number;
  active: number;
  shells: number;
  /** share of total active work, 0..1 */
  share: number;
}
