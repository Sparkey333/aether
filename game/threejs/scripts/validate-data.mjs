// Headless validation of game/shared/design-data against the JSON Schemas + referential integrity.
// This is the CI gate that keeps the three engine builds comparable. Exit 1 on any failure.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const root = fileURLToPath(new URL('../../shared/design-data/', import.meta.url));
const rd = (p) => JSON.parse(readFileSync(root + p, 'utf8'));

const files = {
  combat: ['combat.json', 'schema/combat.schema.json'],
  moves: ['moves/moves.json', 'schema/moves.schema.json'],
  bosses: ['bosses/bosses.json', 'schema/bosses.schema.json'],
  enemies: ['enemies/enemies.json', 'schema/enemies.schema.json'],
  weapons: ['weapons/weapons.json', 'schema/weapons.schema.json'],
};

const ajv = new Ajv({ allErrors: true, strict: false });
let failed = false;
const data = {};

for (const [name, [dataPath, schemaPath]] of Object.entries(files)) {
  const d = rd(dataPath);
  const schema = rd(schemaPath);
  data[name] = d;
  const ok = ajv.validate(schema, d);
  if (!ok) {
    failed = true;
    console.error(`✗ ${name} failed schema validation:`);
    for (const e of ajv.errors ?? []) console.error(`    ${e.instancePath || '/'} ${e.message}`);
  } else {
    console.log(`✓ ${name} valid`);
  }
}

// referential integrity
const moveIds = new Set(data.moves.moves.map((m) => m.id));
const ref = (id, where) => {
  if (!moveIds.has(id)) {
    failed = true;
    console.error(`✗ unknown moveRef "${id}" referenced by ${where}`);
  }
};
for (const m of data.moves.moves) (m.comboNext ?? []).forEach((r) => ref(r, `${m.id}.comboNext`));
for (const b of data.bosses.bosses)
  b.phases.forEach((p) => p.attacks.forEach((a) => ref(a.moveRef, `${b.id}/${p.name}`)));
for (const e of data.enemies.enemies) e.attacks.forEach((a) => ref(a.moveRef, e.id));
for (const w of data.weapons.weapons)
  [...w.lightCombo, ...w.heavyCombo, ...(w.aerialCombo ?? []), w.launcher, w.dashAttack]
    .filter(Boolean)
    .forEach((r) => ref(r, w.id));

// tier-color parity with the Atlas source of truth
try {
  const atlasTiers = readFileSync(fileURLToPath(new URL('../../../src/lib/tiers.ts', import.meta.url)), 'utf8');
  for (const [tier, hex] of Object.entries(data.combat.tierColors)) {
    if (!atlasTiers.toLowerCase().includes(hex.toLowerCase())) {
      failed = true;
      console.error(`✗ tier color ${tier}=${hex} not found in src/lib/tiers.ts (mirror drift)`);
    }
  }
  if (!failed) console.log('✓ tier colors mirror src/lib/tiers.ts');
} catch {
  console.warn('… skipped tier-color parity check (src/lib/tiers.ts not readable)');
}

if (failed) {
  console.error('\nDESIGN-DATA VALIDATION FAILED');
  process.exit(1);
}
console.log('\nAll design-data valid and comparable.');
