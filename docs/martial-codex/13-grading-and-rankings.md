# The Grading Engine — Rankings, Tier List & Lineage Clusters

This is the payoff layer. Every one of the **134 styles** in the Codex (109 real, 25 reality-built fictional) carries a **17-stat block** (0–10). Here those stats are turned into transparent, reproducible leaderboards. Nothing here is a vibe — every number is computed by [`rank.mjs`](../../src/data/martial-arts.seed.json) from the seed dataset, so you can re-weight and re-run it.

> **Honest caveat.** The stat blocks are *expert estimates*, calibrated across arts by domain research — not laboratory measurements (Aether tier **B**, with the historical claims behind them tiered A–D in each section). "Effectiveness" is contested and context-dependent; treat the rankings as a defensible model, not gospel. The point is a *consistent* yardstick, openly stated, that you can argue with.

## The 17 stats

`rangeStriking · rangeClinch · rangeGround · rangeWeapon · learningCurve · physicalDemand · injuryRiskTraining · selfDefense1v1 · vsArmed · vsMultiple · adaptability · energyEfficiency · accessibility · competitionDepth · spectacle · funFactor · safetyForSparring`

## The leaderboards (exact weights)

Each composite is a weighted blend of the stats, scaled to 0–100. Fictional styles are excluded from the "real-only" boards (you can't enroll in gun-fu).

| Board | Weights | Pool |
|---|---|---|
| **Street Self-Defense** | selfDefense1v1 .40 · vsMultiple .12 · vsArmed .12 · adaptability .12 · energyEfficiency .08 · (10−learningCurve) .08 · accessibility .08 | real |
| **Sport / Competition** | competitionDepth .45 · safetyForSparring .15 · (avg striking/clinch/ground) .20 · selfDefense1v1 .10 · physicalDemand .10 | real |
| **Cinematic Spectacle** | spectacle .55 · funFactor .20 · rangeWeapon .10 · rangeStriking .075 · adaptability .075 | all |
| **Overall Versatility** | adaptability .18 · selfDefense1v1 .16 · 4 ranges (.12/.12/.12/.10) · vsArmed .10 · vsMultiple .10 | real |
| **Aether Fight Club (Fun-&-Safe)** | funFactor .28 · safetyForSparring .28 · spectacle .16 · accessibility .16 · (10−injuryRiskTraining) .12 | real |

---

### 🥊 Street Self-Defense — Top 12
| # | Style | Score |
|---|---|---|
| 1 | **Filipino Eskrima / Arnis / Kali** | 76.0 |
| 2 | Defendu | 74.4 |
| 3 | **Mixed Martial Arts** | 71.2 |
| 4 | **Brazilian Jiu-Jitsu** | 68.4 |
| 5 | Krav Maga | 67.6 |
| 6 | Sambo & Combat Sambo | 66.8 |
| 7 | Judo | 65.6 |
| 8 | Pencak Silat | 65.2 |
| 9 | Kill or Get Killed (Applegate/OSS) | 65.2 |
| 10 | British Commando Close-Combat | 65.2 |
| 11 | Muay Thai | 64.4 |
| 12 | SOCP | 64.4 |

*The weapon-aware arts (Kali, Silat) and the lethal combatives (Defendu, Commando, SOCP) beat pure sports here because self-defense weights `vsArmed`/`vsMultiple` that ring sports score low on. **MMA and BJJ still crack the top 4** — the empirical 1v1 floor.*

### 🏆 Sport / Competition — Top 12
| # | Style | Score |
|---|---|---|
| 1 | **Mixed Martial Arts** | 89.0 |
| 2 | Olympic Freestyle Wrestling | 82.7 |
| 3 | Muay Thai | 81.3 |
| 4 | Judo | 81.3 |
| 5 | **Brazilian Jiu-Jitsu** | 80.5 |
| 6 | American Folkstyle Wrestling | 78.8 |
| 7 | Boxing | 76.8 |
| 8 | Greco-Roman Wrestling | 75.7 |
| 9 | Japanese Kickboxing / K-1 | 73.3 |
| 10 | Sambo & Combat Sambo | 71.8 |
| 11 | Olympic Fencing | 67.0 |
| 12 | Sumo | 66.7 |

*The Olympic/professional core. Deep, safe-to-spar, fully alive.*

### 🎬 Cinematic Spectacle — Top 12 (fiction allowed)
| # | Style | Score |
|---|---|---|
| 1 | **John Wick Gun-Fu** *(fiction)* | 93.5 |
| 2 | Jackie Chan *(fiction)* | 93.3 |
| 3 | Bruce Lee / JKD *(fiction)* | 90.8 |
| 4 | The Raid — Pencak Silat *(fiction)* | 88.3 |
| 5 | Avatar: TLA bending *(fiction)* | 87.5 |
| 6 | **Capoeira** *(real)* | 86.7 |
| 7 | Ong-Bak — Muay Boran *(fiction)* | 86.0 |
| 8 | Jason Bourne *(fiction)* | 85.5 |
| 9 | MGS CQC *(fiction)* | 85.3 |
| 10 | **Mixed Martial Arts** *(real)* | 85.2 |
| 11 | Yakuza *(fiction)* | 84.8 |
| 12 | Sifu — Pak Mei *(fiction)* | 83.3 |

*The only **real** arts that out-spectacle the screen are **Capoeira** and **MMA**. Everything else cinematic is choreography on top of real roots — which is exactly the raw material for the [Fusion Lab](14-fusion-lab.md).*

### 🧰 Overall Versatility — Top 12
| # | Style | Score |
|---|---|---|
| 1 | **Mixed Martial Arts** | 72.4 |
| 2 | SOCP | 72.4 |
| 3 | Filipino Eskrima / Arnis / Kali | 70.8 |
| 4 | Pencak Silat | 70.4 |
| 5 | Defendu | 68.6 |
| 6 | Vale Tudo | 67.8 |
| 7 | Bokator | 64.8 |
| 8 | MACP (Modern Army Combatives) | 64.6 |
| 9 | Kapu Kuʻialua (Lua) | 64.0 |
| 10 | Modern PMC / Close-Protection | 63.0 |
| 11 | Sambo & Combat Sambo | 62.6 |
| 12 | Bartitsu | 62.0 |

*Versatility rewards covering **all ranges including weapons** — so the weapon-integrated military/FMA/Silat systems edge out the sport specialists.*

### 🎉 Aether Fight Club (Fun-&-Safe) — Top 12 — **our flagship board**
| # | Style | Score |
|---|---|---|
| 1 | **Capoeira** | 80.8 |
| 2 | **Brazilian Jiu-Jitsu** | 76.0 |
| 3 | Taekwondo | 75.2 |
| 4 | Shotokan Karate | 72.0 |
| 5 | Olympic Fencing | 72.0 |
| 6 | Tai Chi Chuan | 71.2 |
| 7 | Boxing | 70.0 |
| 8 | Judo | 69.6 |
| 9 | Olympic Freestyle Wrestling | 69.2 |
| 10 | American Folkstyle Wrestling | 69.2 |
| 11 | Shito-ryu Karate | 68.8 |
| 12 | Vovinam | 67.6 |

*This is the board that matters for the [**Aether Fight Club**](15-aether-fight-club.md): fun + safe-to-spar + spectacle + accessible, minus injury risk. **Capoeira and BJJ run away with it** — joyful, endlessly sparrable, low-damage. Note **Tai Chi and Fencing** sneak in: trivially safe, weirdly fun. The damage-dealers (Muay Thai #34, Lethwei nowhere) are *demoted* here — by design.*

---

## Overall Tier List (real arts, general combat-effectiveness)

`combat = selfDefense1v1 .30 · (avg 3 unarmed ranges) .22 · adaptability .16 · competitionDepth .10 · vsMultiple .07 · vsArmed .07 · physicalDemand .08`

- **🟥 S (the proving-ground apex):** **Mixed Martial Arts** *[88]*
- **🟧 A (elite, fully-tested):** Vale Tudo · **Sambo & Combat Sambo** · **Brazilian Jiu-Jitsu** · **Muay Thai**
- **🟨 B (excellent, battle/sport-validated):** Judo · Filipino Kali · MACP · Pencak Silat · **Pankration** · SOCP · Catch Wrestling · Defendu · Lethwei · Freestyle Wrestling · Folkstyle Wrestling · Boxing · K-1 Kickboxing · Sanda · Bokator · Jeet Kune Do · Kyokushin Karate · Pradal Serey · Laamb · Malla-yuddha · Vovinam · Wushu(Sanda)
- **🟩 C (solid, context-dependent):** Kushti · Bartitsu · Lua · Krav Maga · Bare-Knuckle · MCMAP · Greco-Roman · Hisardut · Shuai Jiao · HEMA Ringen · Applegate OSS · PMC · Savate · Commando · Pahlavani · KAPAP · Greek Boxing · Sumo · Hapkido · Koryū Jujutsu · Roman/Gladiatorial · Choy Li Fut · HEMA Armizare · American Kickboxing · Mongolian Bökh · Praying Mantis · Gōjū-ryū · Defendo · **Taekwondo** · Glíma · Kalaripayattu · Wadō-ryū · Angampora · Shitō-ryū · Thang-Ta · Shaolin · Beni Hasan wrestling · **Shotokan** · Silambam · Jogo do Pau · Dambe · RBSD
- **🟦 D (limited as a complete fighting method — niche, demo, health, or extinct):** Uechi-ryū · LINE · **Baguazhang** · **Xingyiquan** · Daitō-ryū · Oil Wrestling · Taekkyeon · Bōjutsu · Tang Soo Do · HEMA Longsword · Schwingen · Hung Gar · Bak Mei · **Capoeira** · Xilam · Isshin-ryū · Drunken Boxing · Kendo · Gatka · Sumerian wrestling · **Wing Chun** · Naginata · Tahtib · Nuba · Aztec ritual · I.33 · **Olympic Fencing** · Glíma · **Aikido** · **Systema** · Engolo · **Tai Chi Chuan** · Iaidō · Kyūdō · Qigong

> **Read the D-tier correctly.** A low combat score is **not** an insult — it means the art optimizes for something *other* than open-rules unarmed fighting. Olympic Fencing is D for *street combat* yet **#5 Fun-&-Safe** and an Olympic sport. Tai Chi is D for fighting yet a peer-reviewed **health** practice. Capoeira is D for combat yet **#1** on our flagship Fun board. Weapon arts (Kenjutsu, HEMA, Kali's blade) are penalized because the score weights *unarmed* ranges. *Keep every layer, label every layer.*

## Where the heavy hitters land (and the surprises)

| Style | Self-Def | Sport | Spectacle | Versatility | Fun-&-Safe |
|---|---|---|---|---|---|
| **BJJ** | #4 | #5 | #91 | #24 | **#2** |
| **MMA** | #3 | **#1** | #10 | **#1** | #25 |
| **Muay Thai** | #11 | #3 | #45 | #26 | #34 |
| **Boxing** | #15 | #7 | #26 | #68 | #7 |
| **Judo** | #7 | #4 | #80 | #28 | #8 |
| **Wrestling (FS)** | #43 | **#2** | #92 | #59 | #9 |
| **Kali** | **#1** | #31 | #32 | #3 | #13 |
| **Krav Maga** | #5 | #69 | #98 | #17 | #61 |
| **Capoeira** | #95 | #50 | #6 | #97 | **#1** |
| **Tai Chi** | #104 | #74 | #118 | #101 | #6 |
| **Systema** | #101 | #106 | #129 | #93 | #41 |

**Surprises worth calling out:**
- **You were right about BJJ.** It is top-5 in self-defense *and* sport *and* our flagship Fun board — the single most well-rounded *recreational-yet-effective* pick. It just isn't flashy (Spectacle #91).
- **Wrestling is a sport monster (#2) but a self-defense mid-tier (#43)** — devastating control, but no answer to weapons/multiples that the self-defense board punishes.
- **Capoeira and Tai Chi are combat D-tier but Fun-&-Safe top-6** — proof the boards measure *different things on purpose*.
- **Systema sits near the bottom of every board.** Its reputation is marketing (Aether tier **D**); the numbers agree.
- **Kali is the self-defense #1** precisely because it trains the weapon problem everyone else ignores.

---

## Similarity & Lineage Clusters

Grouping the 134 styles by mechanical + historical kinship reveals ~9 families. Each family shares strengths — and a shared **blind spot**.

1. **The Jūjutsu → Judo → BJJ submission line** *(Kanō judo · BJJ · Sambo · Catch wrestling · Kosen · Daitō-ryū → Aikido/Hapkido offshoots).* Off-balance, control, submit. **Blind to:** strikes, weapons, multiple attackers.
2. **Global folk wrestling** *(Freestyle · Greco · Folkstyle · Shuai Jiao · Bökh · Oil · Kushti · Pahlavani · Glíma · Schwingen · Laamb · Nuba · Sumo · Beni Hasan · Jiao Li).* Humanity's universal sport — clinch + throw. **Blind to:** ground submissions and striking.
3. **The kick-heavy striking belt** *(Muay Thai · Lethwei · Pradal Serey · Taekwondo · Kyokushin · Savate · Sanda · K-1 · Karate family).* Range, timing, devastating legs. **Blind to:** the ground.
4. **Hand-striking / pugilism** *(Boxing · Bare-Knuckle · Dambe · Greek Pygmachia).* The best hands on Earth. **Blind to:** legs, grappling, weapons.
5. **Chinese internal & forms arts** *(Tai Chi · Bagua · Xingyi · Wing Chun · Shaolin · Hung Gar · Choy Li Fut · Mantis · Bak Mei · Drunken · Wushu).* Body mechanics, health, aesthetics, deep theory. **Blind to:** alive resistance (the chronic CMA failure under pressure-testing — see Xu Xiaodong).
6. **Filipino & SE-Asian weapon arts** *(Kali/Eskrima · Silat · Silambam · Gatka · Thang-Ta · Bokator · Krabi-krabong · Angampora · Kalaripayattu).* Weapon-first, blade-literate, ambidextrous. **Blind to:** sport-grappling depth.
7. **European weapon & historical arts** *(HEMA longsword/Fiore/I.33/Ringen · Kenjutsu/Kendo · Iaido · Naginata · Fencing · Jogo do Pau · Bartitsu).* Manuscript-reconstructed blade science + the safest sparring (fencing). **Blind to:** living unbroken transmission (mostly reconstructed).
8. **Military & reality-based combatives** *(Defendu/Commando · MCMAP · MACP · SOCP · Krav Maga · Combat Sambo · KAPAP · Defendo · PMC · RBSD · Systema · + the Wick/Bourne screen styles).* Weapon-integrated, lethal-intent, fast to deploy. **Blind to:** sport feedback loops (you can't fully spar a neck-crank), and **prone to marketing myth** (flag Systema/Spetsnaz hype as D).
9. **The hybrid synthesis (the meta-family)** *(MMA · Vale Tudo · Jeet Kune Do).* The empirical apex that *absorbs* families 1–4 and refuses to be blind to any unarmed range. **Blind to:** weapons and multiple attackers (the sport ruleset's edges).

**Cross-pollination is the whole story.** The arrow of progress runs **ancient pankration/wrestling → koryū jūjutsu → Kanō judo → Maeda → Gracie BJJ → Vale Tudo → UFC → modern MMA**, while strikers fed in from **boxing + Muay Thai** and the military line braided in **Defendu → MACP/SOCP** (which then re-imported BJJ). Every modern "complete" system is a re-mix of these nine families. That is the premise of the [Fusion Lab](14-fusion-lab.md).
