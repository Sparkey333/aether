// The familiar's body. Small, pixel-simple, a couple of moving parts — the
// charm is in the tiny gestures, not the detail. Each creature reads its colors
// from the canon and animates via the `emote` it's given.

import { FAMILIARS, type Emote, type FamiliarId } from "../familiars";

export function Familiar({
  id,
  emote = "idle",
  size = 64,
}: {
  id: FamiliarId;
  emote?: Emote;
  size?: number;
}) {
  const f = FAMILIARS[id];
  const style = {
    ["--accent" as string]: f.accent,
    ["--ink" as string]: f.ink,
    width: size,
    height: size,
  } as React.CSSProperties;

  return (
    <svg
      className="familiar-art breathe"
      data-emote={emote}
      data-fam={id}
      viewBox="0 0 64 64"
      style={style}
      role="img"
      aria-label={f.name}
    >
      {id === "cinder" && <Cinder />}
      {id === "murk" && <Murk />}
      {id === "vane" && <Vane />}
    </svg>
  );
}

function Cinder() {
  return (
    <g className="body">
      {/* antennae */}
      <path className="antenna" d="M30 22 Q26 14 22 12" />
      <path className="antenna" d="M34 22 Q38 14 42 12" />
      {/* wings */}
      <g className="wing wing-l">
        <path d="M31 30 C18 22 8 26 10 36 C12 46 24 44 31 38 Z" />
      </g>
      <g className="wing wing-r">
        <path d="M33 30 C46 22 56 26 54 36 C52 46 40 44 33 38 Z" />
      </g>
      {/* thorax + ember vein */}
      <ellipse className="torso" cx="32" cy="34" rx="3.4" ry="11" />
      <circle className="head" cx="32" cy="22" r="3" />
      <line className="ember" x1="32" y1="28" x2="32" y2="42" />
      <circle className="emberdot" cx="32" cy="44" r="1.6" />
    </g>
  );
}

function Murk() {
  return (
    <g className="body">
      {/* frills */}
      {[-1, 0, 1].map((i) => (
        <g className="frill frill-l" key={`l${i}`} style={{ ["--i" as string]: i }}>
          <path d={`M24 ${24 + i * 5} Q12 ${20 + i * 6} 8 ${24 + i * 6}`} />
          <circle cx="8" cy={24 + i * 6} r="2" />
        </g>
      ))}
      {[-1, 0, 1].map((i) => (
        <g className="frill frill-r" key={`r${i}`} style={{ ["--i" as string]: i }}>
          <path d={`M40 ${24 + i * 5} Q52 ${20 + i * 6} 56 ${24 + i * 6}`} />
          <circle cx="56" cy={24 + i * 6} r="2" />
        </g>
      ))}
      {/* head + tapering body */}
      <path className="torso" d="M22 24 Q32 16 42 24 L40 46 Q32 56 24 46 Z" />
      <circle className="eye" cx="28" cy="28" r="1.6" />
      <circle className="eye" cx="36" cy="28" r="1.6" />
      <path className="smile" d="M29 33 Q32 36 35 33" />
    </g>
  );
}

function Vane() {
  return (
    <g className="body">
      {/* tail / wing */}
      <path className="tail" d="M30 40 L18 52 L34 46 Z" />
      <path className="wing" d="M34 30 L52 40 L38 42 Z" />
      {/* body */}
      <ellipse className="torso" cx="34" cy="36" rx="11" ry="9" />
      {/* head + beak */}
      <g className="head">
        <circle className="skull" cx="26" cy="24" r="8" />
        <path className="beak" d="M18 24 L9 26 L18 28 Z" />
        <circle className="eye" cx="25" cy="22" r="2.4" />
        <circle className="glint" cx="25.8" cy="21.2" r="0.9" />
      </g>
    </g>
  );
}
