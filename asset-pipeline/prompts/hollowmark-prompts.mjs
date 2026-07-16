// A curated, ready-to-fire prompt library for HOLLOWMARK concept art —
// original character/creature/environment/item designs plus a few
// deliberate spinoff riffs. Every entry shares a style suffix so a batch
// run reads as one coherent art direction regardless of provider.
// Use: node cli.mjs --provider <name> --promptKey rook
//      node cli.mjs --provider <name> --all            (fires every entry)

const STYLE = 'Gritty stylized sci-fantasy digital concept art, painterly ' +
  'brushwork, dramatic rim lighting, teal Vyre bioluminescence against ' +
  'violet Hollow corruption, rust-and-bone industrial architecture, ' +
  'PS2-era action game mood — grounded, not photoreal.';

export const PROMPTS = {
  // ---------------------------------------------------------------- cast
  rook: {
    kind: 'image',
    prompt: `Character concept sheet: Rook, a lean wasteland courier turned escaped test subject, worn leather-and-scrap armor over a courier's underlayer, a Warden sidearm holstered at his hip, faint teal Vyre veins visible under the skin of his forearms. Front and side view, neutral pose. ${STYLE}`,
  },
  pip: {
    kind: 'image',
    prompt: `Character concept: Pip, a small chittering fox-marten creature mutated by a Hollow Vyre vat, sleek dark fur with faint bioluminescent teal markings, expressive annoyed posture, perched as if riding on someone's shoulder. ${STYLE}`,
  },
  marrow: {
    kind: 'image',
    prompt: `Character concept: Marrow, a gruff ex-enforcer resistance handler, scarred face, heavy patched coat over old Ironwatch armor plating, standing in a dim sewer-tunnel hideout lit by a single bare bulb. ${STYLE}`,
  },
  sable: {
    kind: 'image',
    prompt: `Character concept: Captain Sable, Magnate Corvayne's estranged daughter and secret defector, sharp Ironwatch officer uniform slightly disheveled, insignia partly torn off, cold controlled expression. ${STYLE}`,
  },
  wren: {
    kind: 'image',
    prompt: `Character concept: Wren, a young brilliant garage mechanic, goggles pushed up on messy hair, welding-scarred jacket covered in tool pouches, standing beside a half-built hoverboard chassis crackling with teal energy. ${STYLE}`,
  },
  cleave: {
    kind: 'image',
    prompt: `Character concept: Cleave, a towering wasteland mercenary who hunts the Rend, heavy scavenged armor plating, an oversized signature cannon slung on his back, sun-bleached scarring, standing in open desert dunes. ${STYLE}`,
  },
  vex: {
    kind: 'image',
    prompt: `Character concept: Commander Vex, Corvayne's prize super-soldier and champion racer, sleek predatory Ironwatch battle-armor with racing accents, arrogant smirk, faint cybernetic seams along the jaw. ${STYLE}`,
  },
  corvayne: {
    kind: 'image',
    prompt: `Character concept: Magnate Corvayne, tyrant ruler of Karrow, ornate heavy war-rig armor fused to his body, cables feeding corrupted Hollow Vyre into his chest, imposing and desperate rather than purely evil. ${STYLE}`,
  },
  paleWarden: {
    kind: 'image',
    prompt: `Character concept, two states side by side: "the Greybeard" — a kindly stooped old refugee in worn robes — beside his true form "the Pale Warden" — an ancient bone-white Warden progenitor wreathed in cracked violet energy, same eyes in both. ${STYLE}`,
  },
  theSpark: {
    kind: 'image',
    prompt: `Character concept: the Spark, a mute boy of about eight, simple wasteland clothes, faint pure white-gold Vyre light glowing beneath his skin unlike any other character's teal or violet, standing very still, watched by others. ${STYLE}`,
  },

  // ------------------------------------------------------------ creatures
  rendGrunt: {
    kind: 'image',
    prompt: `Creature concept: a Rend grunt, a hunched biomechanical horror fused from scavenged industrial parts and organic matter, a glowing teal-cyan core embedded in its chest as its one weak point, claws built for melee. ${STYLE}`,
  },
  rendSpitter: {
    kind: 'image',
    prompt: `Creature concept: a Rend spitter, a rooted stationary biomechanical horror with a distended sac-like head that launches corrosive green-yellow spit, spindly stabilizing legs, a glowing core at its base. ${STYLE}`,
  },
  vatThing: {
    kind: 'image',
    prompt: `Boss creature concept: the Vat-Thing, a hulking failed super-soldier experiment breaking free of its containment vat, cracked glass and tubing still fused to its back, one arm overgrown and monstrous, roaring. ${STYLE}`,
  },
  broodMother: {
    kind: 'image',
    prompt: `Boss creature concept: the Brood-Mother of the Wastes, a massive egg-swollen Rend queen half-buried in desert sand, chitinous plating fused with rusted wreckage, surrounded by smaller Rend nests. ${STYLE}`,
  },

  // --------------------------------------------------------- environments
  karrowVerge: {
    kind: 'image',
    prompt: `Environment concept: the Verge, the slum district of Karrow built against the outer wall, stacked scrap-metal shanties, hanging laundry, teal Vyre-lamp streetlight glow cutting through fog at dusk. ${STYLE}`,
  },
  karrowUndermarket: {
    kind: 'image',
    prompt: `Environment concept: the Undermarket, a black-market wager-arena beneath Karrow, packed crowd silhouettes, a fighting pit lit by garish neon signage, smoke haze. ${STYLE}`,
  },
  karrowSpire: {
    kind: 'image',
    prompt: `Environment concept: the Spire, Magnate Corvayne's looming Citadel tower over Karrow, brutalist industrial architecture fused with ornate Warden-relic gold trim, storm clouds and searchlights. ${STYLE}`,
  },
  hollowWastes: {
    kind: 'image',
    prompt: `Environment concept: the Hollow Wastes, an open sun-bleached desert dotted with rusted Rend nests and half-buried Warden ruins, a lone hover-buggy trail cutting through the dunes toward the horizon. ${STYLE}`,
  },
  wardensReach: {
    kind: 'image',
    prompt: `Environment concept: Wardens' Reach, ancient floating bone-white ruins high above the clouds, impossible geometric architecture, no gunfire here — a pure platforming temple, serene and alien. ${STYLE}`,
  },
  riftmawApproach: {
    kind: 'image',
    prompt: `Environment concept: the Riftmaw Approach, a hellscape where the sky itself is torn open by a massive violet rift, jagged floating debris, Rend pouring through the tear, apocalyptic scale. ${STYLE}`,
  },

  // ---------------------------------------------------------------- items
  splitfangMaw: {
    kind: 'image',
    prompt: `Weapon concept: the Splitfang's Maw core, a stubby wide-barreled Vyre-buckshot module glowing orange at the vents, scavenged industrial materials with Warden-tech energy coils. Item render on a plain dark background. ${STYLE}`,
  },
  splitfangLance: {
    kind: 'image',
    prompt: `Weapon concept: the Splitfang's Lance core, a slender precision-barrel module glowing cyan along a single focusing rail, sleek and controlled compared to the other cores. Item render on a plain dark background. ${STYLE}`,
  },
  splitfangSunder: {
    kind: 'image',
    prompt: `Weapon concept: the Splitfang's Sunder core, a heavy charge-coil module crackling with violet arc-plasma between three exposed prongs, clearly the most dangerous and unstable-looking core. Item render on a plain dark background. ${STYLE}`,
  },
  theSkiff: {
    kind: 'image',
    prompt: `Vehicle concept: the Skiff, a scavenged trick hoverboard with exposed teal repulsor coils on the underside, worn grip-taped deck, small Warden-tech stabilizer fins. Three-quarter view on a plain dark background. ${STYLE}`,
  },

  // -------------------------------------------------------- Hollow states
  hollowFormRook: {
    kind: 'image',
    prompt: `Character transformation concept: Rook mid-Hollow-form, veins blazing violet-black, posture more feral and predatory, faint distortion/static in the air around him, terrifying rather than heroic. ${STYLE}`,
  },
  haloFormRook: {
    kind: 'image',
    prompt: `Character transformation concept: Rook in Halo form, the late-game counterweight to Hollow — pale gold-white light instead of violet, calmer controlled posture, a faint protective aura, hopeful rather than dreadful. ${STYLE}`,
  },

  // ------------------------------------------------------------- key art
  titlePoster: {
    kind: 'image',
    prompt: `Key art poster for "HOLLOWMARK: Ashes of the Warden Crown" — Rook mid-transformation on a rusted rooftop, one side teal Vyre, one side violet Hollow corruption, Karrow's vertical skyline behind him under a rift-torn sky, Pip on his shoulder. Leave clean space at the bottom third for a title lockup. ${STYLE}`,
  },
};

export function listPromptKeys() {
  return Object.keys(PROMPTS);
}
