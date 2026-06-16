// Gateways: link-outs to your other worlds — aether-geomancy, folders, AI
// projects. Cairn is the keeper of the record, not the owner of everything;
// these are the doors to the rest of the constellation.

import type { Gateway } from "../types";

export function Gateways({
  gateways,
  onOpen,
}: {
  gateways: Gateway[];
  onOpen: (target: string, kind: "url" | "path" | "app") => void;
}) {
  if (gateways.length === 0) return null;
  return (
    <div className="gateways">
      <div className="gw-label">gateways</div>
      <div className="gw-chips">
        {gateways.map((g) => (
          <button key={g.id} className="gw-chip" onClick={() => onOpen(g.target, g.kind)}>
            <span className="gw-dot" /> {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
