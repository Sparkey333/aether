// DOM HUD overlay (chunky, pixel-styled). Reads the once-per-frame snapshot from runStore.
import { useRunStore } from '@/state/runStore';

function Bar({ label, value, max, color, width = 190 }: { label: string; value: number; max: number; color: string; width?: number }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0)) * 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 9, letterSpacing: 1, opacity: 0.8 }}>{label}</div>
      <div style={{ width, height: 10, background: '#0c0f18', border: '1px solid #2a3550' }}>
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
      {/* top-left player vitals */}
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <Bar label="HEALTH" value={s.hp} max={s.hpMax} color="#c0414e" />
        <Bar label="STAMINA" value={s.stamina} max={s.staminaMax} color="#78e6a0" />
        <Bar label="AETHER" value={s.aether} max={s.aetherMax} color="#50c8ff" />
        <Bar label="POISE" value={s.poise} max={s.poiseMax} color="#8a93a8" width={120} />
        {s.cauterized && (
          <div style={{ marginTop: 4, fontSize: 10, color: '#ebbe5a', fontWeight: 700 }}>◆ CAUTERIZE ACTIVE</div>
        )}
      </div>

      {/* top-right flow meter */}
      <div style={{ position: 'absolute', top: 12, right: 16, textAlign: 'right' }}>
        <div style={{ fontSize: 9, opacity: 0.7 }}>FLOW</div>
        <div style={{ fontSize: 34, lineHeight: '30px', color: '#ebbe5a', fontWeight: 700 }}>{s.flowRank}</div>
        <div style={{ width: 90, height: 6, background: '#0c0f18', border: '1px solid #2a3550', marginLeft: 'auto', marginTop: 2 }}>
          <div style={{ width: `${Math.min(100, (s.flowFp / (s.flowMax || 1)) * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#ebbe5a,#fff)' }} />
        </div>
      </div>

      {/* zone name */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, opacity: 0.85 }}>
        {s.zone}
      </div>

      {/* target / enemy bar */}
      {s.targetName && (
        <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', width: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 1, opacity: 0.9, marginBottom: 2 }}>
            {s.lockedOn ? '◎ ' : ''}{s.targetName}
          </div>
          <div style={{ width: '100%', height: 8, background: '#0c0f18', border: '1px solid #4a2530' }}>
            <div style={{ width: `${Math.max(0, Math.min(1, s.targetHpPct)) * 100}%`, height: '100%', background: s.targetIsBoss ? '#e66e8c' : '#c0414e' }} />
          </div>
        </div>
      )}

      {/* lock-on reticle */}
      {s.reticleVisible && (
        <div
          style={{
            position: 'absolute', left: `${s.reticleX}%`, top: `${s.reticleY}%`, transform: 'translate(-50%,-50%)',
            width: 16, height: 16, border: '2px solid #ebbe5a', borderRadius: 2, boxShadow: '0 0 0 1px #000',
          }}
        />
      )}

      {/* controls */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 9, opacity: 0.65, lineHeight: '14px' }}>
        WASD move · Mouse look · L-click LIGHT · R-click HEAVY · Space DODGE · Shift SPRINT<br />
        Q BLOCK · E PARRY · Tab LOCK-ON · F/C SPECIAL · V CAUTERIZE
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 9, opacity: 0.5 }}>
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
