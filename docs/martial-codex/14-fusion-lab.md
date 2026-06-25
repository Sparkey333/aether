# The Fusion Lab — Proposed Hybrid Styles

Every "complete" art in history is a remix (judo from jūjutsu, MMA from everything). The Fusion Lab does this **on purpose**, using the [stat model](13-grading-and-rankings.md) to target a gap. Seven blends below are **real-only** — every component is a living, trainable art, so these could be built and sparred *today*. Two are **sci-fi-flavored** — clearly speculative, but reasoned from real mechanics.

Target profiles use the Codex's 0–10 stats. These are **design goals**, not measurements.

---

## Real-only fusions

### 1. PANANTUKAN PRIME — "the weapon-aware striker"
**Components:** Filipino Kali/Eskrima + Western Boxing + Muay Thai elbows/dirty-boxing.
**Synergy:** Kali's #1 self-defense weapon-literacy welded to boxing's #1 hands. Empty-hand and blade share the same angles, so the practitioner flows knife → stick → fists without re-learning. (Dan Inosanto's *panantukan* already proves the concept; we formalize and pressure-test it.)
**Gap closed:** strikers ignore weapons; weapon arts neglect alive boxing. This fixes both.
**Target:** `rangeStriking 9 · rangeWeapon 9 · selfDefense1v1 9 · vsArmed 9 · vsMultiple 7 · adaptability 9`. **Use case:** the self-defense leaderboard king.

### 2. THE EASTERN BLOC — "Sambo-Thai"
**Components:** Combat Sambo + Muay Thai.
**Synergy:** Sambo brings elite throws + leglocks + an MMA-ready base; Muay Thai patches Sambo's only weakness (no sport chokes, thin striking) with the world's best clinch-knees-elbows. Fedor Emelianenko was basically this.
**Gap closed:** Sambo's striking; Muay Thai's ground.
**Target:** `rangeStriking 8 · rangeClinch 9 · rangeGround 8 · selfDefense1v1 9 · competitionDepth 8`. **Use case:** an MMA podium machine.

### 3. SOFT STEEL — "the control & retention art"
**Components:** Judo + Filipino stick/knife + Aikido/Daitō-ryū wrist control + a dash of Bartitsu cane.
**Synergy:** Judo's throws and Aikido's joint control, made *honest* by weapon-retention drilling — built for security/LEO/de-escalation where you must control, not destroy, and never lose your tool.
**Gap closed:** the "I need to restrain a person and keep my weapon" problem that sport arts and lethal combatives both skip.
**Target:** `rangeClinch 9 · rangeWeapon 8 · vsArmed 8 · injuryRiskTraining 4 · selfDefense1v1 8`. **Use case:** professional protection, the realistic [SOCP](09-us-military-combatives.md) civilian cousin.

### 4. FLOW-STRIKE — "the spectacle/safety art" ⭐ *(the Aether Fight Club flagship style)*
**Components:** Capoeira + Taekwondo + Tricking (martial arts gymnastics) + light point-kickboxing scoring.
**Synergy:** takes the two **Fun-&-Safe** chart-toppers (Capoeira #1, plus TKD #3) and fuses them into a pad-and-flow sport that is *maximally watchable and minimally damaging* — spinning, evasive, acrobatic, scored on control and creativity rather than concussion.
**Gap closed:** the entire premise of this project — **a real martial art you can go 100% on, that looks incredible on camera, and sends everyone home fine.**
**Target:** `spectacle 10 · funFactor 10 · safetyForSparring 9 · injuryRiskTraining 3 · accessibility 7`. **Use case:** the headline ruleset of the [Aether Fight Club](15-aether-fight-club.md) and the YouTube engine.

### 5. BLADE CONCORD — "the unified weapon sport"
**Components:** HEMA (longsword + Ringen) + Filipino blade/stick + Olympic-fencing timing + Bartitsu cane.
**Synergy:** every weapon family already has *protective-gear sparring* traditions; unify their footwork/timing/measure into one curriculum that scales from feder to rattan to walking-cane. Fencing's safety + HEMA's depth + Kali's flow.
**Gap closed:** there is no single "world weapon art." This is it — and it's **safe to spar hard** (fencing is our #5 Fun-&-Safe pick).
**Target:** `rangeWeapon 10 · safetyForSparring 8 · competitionDepth 6 · funFactor 8 · spectacle 8`.

### 6. GROUND SOVEREIGN — "Wrestle-Jitsu"
**Components:** Folkstyle/Freestyle Wrestling + No-Gi BJJ + Catch Wrestling.
**Synergy:** wrestling's unstoppable takedowns + top control, BJJ's submission system off the bottom, catch's leglocks/cranks tying them together. This *is* the modern grappling meta (ADCC) — we name it as a discipline and tune it for safe submission-only sparring.
**Gap closed:** wrestling can't finish; BJJ can't always take down. Together: total grappling.
**Target:** `rangeClinch 9 · rangeGround 10 · selfDefense1v1 9 · safetyForSparring 8 · competitionDepth 9`.

### 7. SOFT POWER — "internal arts, made honest"
**Components:** Tai Chi/Baguazhang body mechanics + Western Boxing aliveness + push-hands-as-sparring.
**Synergy:** the **rehabilitation of the internal arts.** Keep the genuine value of CMA (structure, relaxation, whole-body power, footwork, the #6 Fun-&-Safe health profile of Tai Chi) but subject it to boxing's resistance so it stops failing under pressure (the honest answer to the Xu Xiaodong demolitions).
**Gap closed:** internal arts' chronic lack of alive testing; boxing's lack of body-structure depth.
**Target:** `energyEfficiency 9 · rangeStriking 7 · safetyForSparring 7 · injuryRiskTraining 4 · funFactor 7`.

---

## Sci-fi-flavored concepts *(speculative — clearly labeled)*

### 8. EXO-CQC — powered-exosuit combatives
**Reasoned from:** [MGS CQC](11-games-cqc.md) + Krav Maga + judo, re-derived for a body whose strength/reach/armor are augmented. If a powered suit removes the strength deficit, **leverage and timing matter more, not less** — throws become catastrophic, so the art would emphasize *balance-breaking, joint-axis control, and suit-vs-suit grip-fighting* over striking (punching a powered plate is pointless). The *Megalo Box* "Gear" premise, taken seriously. **Status: speculative.**

### 9. NULL-JITSU — zero-gravity grappling
**Reasoned from:** BJJ + Sambo + sumo, re-derived for microgravity. There is **no ground and no weight**, so the entire "guard/mount/pin" hierarchy collapses. Control becomes *anchoring* (to your opponent or to handholds), and every action obeys conservation of momentum — push them and you both move. The art would prize **double-grip control, leg-triangles as anchors, and momentum-cancellation**, with submissions (chokes, joint locks) intact because they don't need gravity. The honest answer to "how would you fight on a space station?" **Status: speculative, but mechanically coherent.**

---

*The Fusion Lab is open-ended. The seed dataset (`src/data/martial-arts.seed.json`) lets you mix any components and predict the blended profile before anyone throws a punch — then the [Aether Fight Club](15-aether-fight-club.md) is where you test it safely.*
