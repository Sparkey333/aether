// Loads game/shared/design-data, validates it against the JSON Schemas with Ajv,
// and exposes typed, frozen views. A validation failure HARD-FAILS boot — a build that
// fails validation is not comparable to the other engines and is rejected (bible Appendix A.1).
import Ajv from 'ajv';

import combatJson from '@shared/design-data/combat.json';
import movesJson from '@shared/design-data/moves/moves.json';
import bossesJson from '@shared/design-data/bosses/bosses.json';
import enemiesJson from '@shared/design-data/enemies/enemies.json';
import weaponsJson from '@shared/design-data/weapons/weapons.json';

import combatSchema from '@shared/design-data/schema/combat.schema.json';
import movesSchema from '@shared/design-data/schema/moves.schema.json';
import bossesSchema from '@shared/design-data/schema/bosses.schema.json';
import enemiesSchema from '@shared/design-data/schema/enemies.schema.json';
import weaponsSchema from '@shared/design-data/schema/weapons.schema.json';

import type {
  CombatConstants, Move, BossConfig, EnemyConfig, WeaponConfig, DesignData,
} from './types';
import { TIER_COLORS } from './tiers';

export class DesignDataError extends Error {}

function validate(name: string, schema: object, data: unknown): void {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const ok = ajv.validate(schema, data);
  if (!ok) {
    const msg = (ajv.errors ?? [])
      .map((e) => `  ${e.instancePath || '/'} ${e.message}`)
      .join('\n');
    throw new DesignDataError(`design-data validation failed for ${name}:\n${msg}`);
  }
}

let cached: DesignData | null = null;

export function loadDesignData(): DesignData {
  if (cached) return cached;

  validate('combat.json', combatSchema, combatJson);
  validate('moves.json', movesSchema, movesJson);
  validate('bosses.json', bossesSchema, bossesJson);
  validate('enemies.json', enemiesSchema, enemiesJson);
  validate('weapons.json', weaponsSchema, weaponsJson);

  const combat = combatJson as unknown as CombatConstants;

  // Cross-engine contract check: tier colors here must equal the mirrored constant.
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    if (combat.tierColors[tier].toLowerCase() !== TIER_COLORS[tier].toLowerCase()) {
      throw new DesignDataError(
        `tier color mismatch for ${tier}: combat.json=${combat.tierColors[tier]} vs tiers.ts=${TIER_COLORS[tier]}`,
      );
    }
  }

  const moves = new Map<string, Move>(
    (movesJson.moves as unknown as Move[]).map((m) => [m.id, m]),
  );
  const bosses = new Map<string, BossConfig>(
    (bossesJson.bosses as unknown as BossConfig[]).map((b) => [b.id, b]),
  );
  const enemies = new Map<string, EnemyConfig>(
    (enemiesJson.enemies as unknown as EnemyConfig[]).map((e) => [e.id, e]),
  );
  const weapons = new Map<string, WeaponConfig>(
    (weaponsJson.weapons as unknown as WeaponConfig[]).map((w) => [w.id, w]),
  );

  // Referential integrity: every moveRef / comboNext must resolve.
  const requireMove = (id: string, where: string) => {
    if (!moves.has(id)) throw new DesignDataError(`unknown moveRef "${id}" referenced by ${where}`);
  };
  for (const m of moves.values()) (m.comboNext ?? []).forEach((id) => requireMove(id, `${m.id}.comboNext`));
  for (const b of bosses.values())
    b.phases.forEach((p) => p.attacks.forEach((a) => requireMove(a.moveRef, `${b.id}/${p.name}`)));
  for (const e of enemies.values()) e.attacks.forEach((a) => requireMove(a.moveRef, e.id));
  for (const w of weapons.values())
    [...w.lightCombo, ...w.heavyCombo, ...(w.aerialCombo ?? []), w.launcher, w.dashAttack]
      .filter(Boolean)
      .forEach((id) => requireMove(id as string, w.id));

  cached = Object.freeze({ combat, moves, bosses, enemies, weapons }) as DesignData;
  return cached;
}
