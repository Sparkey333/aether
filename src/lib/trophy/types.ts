// Trophy Hype — domain types.
//
// Trophy Hype tracks everything you compete in and gamifies the rewards, across
// two great arenas: the FIELD (physical athletics — races, peaks, angling, the
// full spectrum) and the STAGE (creative submissions — music first, then books,
// anime, games, apps, into festivals / competitions / open-calls / grants).
//
// The spine of the app is INTEGRITY. Every earned trophy carries an open, tiered
// proof of how it was verified — never hidden, never a delete key. That is what
// makes a leaderboard here trustworthy: you cannot game it with a claim, because
// a claim is visibly worth almost nothing next to a chip time or a jury
// acceptance. No corruption possible — not even the appearance of it.

/** The two arenas Trophy Hype spans. */
export type Arena = "field" | "stage";

/**
 * How strongly an earned trophy is proven. Ordered strongest → weakest.
 * Mirrors Aether's provenance doctrine: keep every layer, label every layer.
 * XP is weighted by this tier so lies never out-earn evidence (see gamify.ts).
 */
export type ProofTier = "verified" | "documented" | "attested" | "claimed";

/** How a result / award was (or can be) verified. */
export type ProofMethod =
  | "chip-time" // timing-chip / transponder result
  | "official-results" // sanctioning body / event results page
  | "gps-track" // recorded GPS activity (Strava, Garmin, GPX)
  | "summit-log" // register / peak-bagging log
  | "certificate" // finisher / award certificate
  | "jury-decision" // festival / competition jury or panel
  | "acceptance-letter" // accepted into a festival / show / anthology
  | "receipt" // proof of entry / purchase
  | "photo" // photo evidence (bib, medal, catch, screen)
  | "video" // video evidence
  | "witness" // named third-party attestation
  | "self-report"; // athlete's own log, no external evidence

/** A single piece of evidence backing a trophy. */
export interface Evidence {
  method: ProofMethod;
  label: string;
  /** Optional link to the evidence (results page, activity, certificate). */
  url?: string;
  /** ISO date the evidence is dated, if known. */
  dated?: string;
}

/** The integrity record attached to every earned trophy. */
export interface Proof {
  tier: ProofTier;
  evidence: Evidence[];
}

/**
 * A discipline within an arena — the taxonomy of what you can compete in.
 * e.g. road-running, trail-ultra, peak-bagging, angling, music, film, game-dev.
 */
export interface Discipline {
  id: string;
  arena: Arena;
  name: string;
  /** parent grouping label, e.g. "Endurance", "Water", "Sound", "Screen". */
  group: string;
  /** short line describing the discipline. */
  blurb?: string;
  /** emoji glyph used across the UI. */
  glyph?: string;
}

/** The kind of thing an opportunity is. */
export type OpportunityKind =
  | "race" // single dated race
  | "series" // a season / points series
  | "peak" // a summit or a bagging collection (14ers, etc.)
  | "award-collection" // a named collection of awards (Master Angler, etc.)
  | "festival" // a creative festival
  | "competition" // a judged creative competition
  | "open-call" // submissions open call / anthology / showcase
  | "grant" // a grant or funding call
  | "gig"; // a small private / indie event you can plan or host

/** Where an opportunity happens. */
export interface Place {
  /** human label, e.g. "Leadville, CO" or "Online". */
  label: string;
  lat?: number;
  lon?: number;
  /** true when it can be entered/attended fully online. */
  online?: boolean;
}

/** A time window for entry / occurrence. */
export interface Window {
  /** ISO date the event happens or submissions close (the deadline that matters). */
  date?: string;
  /** ISO date entry / submissions open. */
  opens?: string;
  /** true for rolling / always-open opportunities. */
  rolling?: boolean;
}

/**
 * A competition / race / festival / award-collection you can pursue.
 * These fill the library. The daily heartbeat discovers and expands them.
 */
export interface Opportunity {
  id: string;
  title: string;
  arena: Arena;
  /** discipline id (see disciplines.seed.json). */
  discipline: string;
  kind: OpportunityKind;
  place: Place;
  window: Window;
  /** hosting org / sanctioning body / festival name. */
  org?: string;
  /** listing / registration / submission URL. */
  url?: string;
  /** entry cost, human string, e.g. "$85", "Free", "$20 per work". */
  cost?: string;
  /** what you can win / earn — medal, shirt, cash, laurels, publication. */
  reward?: string;
  /** how a result here can be verified — sets the ceiling on provable proof. */
  verifyBy: ProofMethod[];
  /** where this listing came from (source name) + how trusted it is. */
  source?: string;
  sourceTier?: ProofTier;
  tags?: string[];
  description?: string;
  /** 0..1 fit vs the profile, filled by the heartbeat. */
  fit?: number;
  /** why the heartbeat surfaced it (short reasons). */
  fitReasons?: string[];
  /** ISO timestamp the heartbeat first discovered this opportunity. */
  discoveredAt?: string;
  /** integrity warnings raised by the Hunt's anti-corruption pass, if any. */
  integrityFlags?: string[];
  /** true when hand-curated in a seed rather than machine-discovered. */
  seed?: boolean;
}

/** The kind of reward a trophy represents. */
export type TrophyKind =
  | "medal"
  | "shirt"
  | "placement" // podium / age-group / division placing
  | "finish" // a finish / completion
  | "pr" // personal record
  | "summit"
  | "catch" // an angling / collection entry
  | "acceptance" // accepted / selected / published
  | "award" // won an award / prize
  | "badge"; // an in-app milestone badge

/** An earned reward in your Trophy Case — the integrity-bearing record. */
export interface Trophy {
  id: string;
  title: string;
  arena: Arena;
  discipline: string;
  kind: TrophyKind;
  /** the opportunity this came from, if tracked. */
  opportunityId?: string;
  /** ISO date earned. */
  earnedAt: string;
  place?: string;
  /** the open, tiered integrity record. */
  proof: Proof;
  /** computed XP (see gamify.ts) — stored for stable leaderboards. */
  xp: number;
  /** raw difficulty 1..5 used in XP; higher = harder / more prestigious. */
  difficulty?: number;
  notes?: string;
  /** free-form result detail, e.g. "3:58:11 · 42/310 AG". */
  result?: string;
}

/** How far along you are on an opportunity you've committed to. */
export type PursuitStatus =
  | "eyeing"
  | "training"
  | "registered"
  | "submitted"
  | "completed"
  | "abandoned";

/** A tracked pursuit — the planning surface. */
export interface Pursuit {
  id: string;
  opportunityId: string;
  status: PursuitStatus;
  /** ISO target date you're aiming at. */
  targetDate?: string;
  notes?: string;
  createdAt: string;
}

/** A ranked pick in the morning briefing. */
export interface TopPick {
  id: string;
  title: string;
  arena: Arena;
  discipline: string;
  fit: number;
  reason: string;
}

/** The output the Hunt heartbeat writes to public/data/trophy-discoveries.json. */
export interface DiscoveryFeed {
  generatedAt: string;
  engine: string;
  note?: string;
  profileSummary?: { disciplines: string[]; creations: string[]; home: string | null };
  counts: { seed: number; discovered: number; newThisPulse: number; library: number };
  integrity: {
    doctrine: string;
    scanned: number;
    flagged: { id: string; title: string; flags: string[] }[];
  };
  topPicks: TopPick[];
  newThisPulse: { id: string; title: string; arena: Arena }[];
  discoveries: Opportunity[];
}

/** The athlete/creator profile that steers discovery. */
export interface Profile {
  name?: string;
  home?: Place;
  /** discipline ids the athlete/creator actively pursues. */
  disciplines: string[];
  /** free tags used by the heartbeat to match opportunities. */
  interests: string[];
  /** how far the athlete will travel for a physical event, km. */
  maxTravelKm?: number;
  /** creative work the user submits — steers the STAGE discovery. */
  creations?: string[];
}
