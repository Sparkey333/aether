// The choice. Three edgy familiars, each a verb at the app's heart. You can
// change later (and they'll evolve), so this is a first bond, not a life sentence.

import { useState } from "react";
import { FAMILIARS, FAMILIAR_ORDER, type Emote, type FamiliarId } from "../familiars";
import { Familiar } from "./Familiar";

export function StarterSelect({ onChoose }: { onChoose: (id: FamiliarId) => void }) {
  const [hover, setHover] = useState<FamiliarId | null>(null);

  return (
    <div className="starter">
      <header className="starter-head">
        <div className="kicker">a cairn marks the trail you've walked</div>
        <h1>Choose your familiar</h1>
        <p className="sub">It keeps your ledger and nudges, gently. You can change it anytime.</p>
      </header>

      <div className="cards">
        {FAMILIAR_ORDER.map((id) => {
          const f = FAMILIARS[id];
          const emote: Emote = hover === id ? "stir" : "idle";
          return (
            <button
              key={id}
              className="card"
              data-fam={id}
              style={{ ["--accent" as string]: f.accent } as React.CSSProperties}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChoose(id)}
            >
              <div className="card-art">
                <Familiar id={id} emote={emote} size={92} />
              </div>
              <div className="card-name">
                <span className="glyph">{f.glyph}</span> {f.name}
              </div>
              <div className="card-role">{f.role}</div>
              <div className="card-tag">{f.tagline}</div>
              <p className="card-blurb">{f.blurb}</p>
              <div className="card-cta">bond with {f.name}</div>
            </button>
          );
        })}
      </div>

      <footer className="starter-foot">
        the bit crab 🦀 is their ancestor — kept as an easter egg, evolutions come later
      </footer>
    </div>
  );
}
