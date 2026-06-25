// DOM HUD overlay (chunky, pixel-styled). Reads the once-per-step snapshot from runStore.
// M1/M2 shows bars + title + controls; combat wires live values in M3.
import { useRunStore } from '@/state/runStore';

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.8 }}>{label}</div>
      <div style={{ width: 180, height: 10, background: '#0c0f18', border: '1px solid #2a3550' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

export function Hud() {
  const s = useRunStore();
  const font = '"Courier New", monospace';
  return (
    <div
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', color: '#dfe6f2',
        font: `12px ${font}`, textShadow: '1px 1px 0 #000', imageRendering: 'pixelated',
      }}
    >
      {/* top-left bars */}
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <Bar label="HEALTH" value={s.hp} max={s.hpMax} color="#c0414e" />
        <Bar label="STAMINA" value={s.stamina} max={s.staminaMax} color="#78e6a0" />
        <Bar label="AETHER" value={s.aether} max={s.aetherMax} color="#50c8ff" />
      </div>

      {/* top-right flow rank */}
      <div style={{ position: 'absolute', top: 12, right: 16, textAlign: 'right' }}>
        <div style={{ fontSize: 9, opacity: 0.7 }}>FLOW</div>
        <div style={{ fontSize: 34, lineHeight: '34px', color: '#ebbe5a', fontWeight: 700 }}>{s.flowRank}</div>
      </div>

      {/* zone name */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, opacity: 0.85 }}>
        {s.zone}
      </div>

      {/* controls hint */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10, opacity: 0.7, lineHeight: '15px' }}>
        WASD move · Mouse look (click to capture) · Shift sprint · Space dodge
      </div>

      <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, opacity: 0.55 }}>
        AETHER · The Sundered Nexus — vertical slice (Three.js build)
      </div>

      {s.error && (
        <div
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,10,16,0.92)', color: '#e66e8c', font: `13px ${font}`, padding: 24,
            whiteSpace: 'pre-wrap', textAlign: 'left',
          }}
        >
          {`design-data failed to load:\n\n${s.error}`}
        </div>
      )}
    </div>
  );
}
