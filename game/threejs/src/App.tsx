import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { loadDesignData } from '@/data/loadDesignData';
import { game } from '@/engine/game';
import { GameRunner } from '@/engine/GameRunner';
import { RetroPipeline } from '@/render/RetroPipeline';
import { Scene } from '@/world/Scene';
import { Hud } from '@/hud/Hud';
import { useRunStore } from '@/state/runStore';

// Stylized retro colors: disable three's color management so posterize works on raw values.
THREE.ColorManagement.enabled = false;

export default function App() {
  const [ready, setReady] = useState(false);
  const setError = useRunStore((s) => s.setError);

  useEffect(() => {
    try {
      const data = loadDesignData();
      game.start(data);
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [setError]);

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(100vw, calc(100vh * 4 / 3))',
        height: 'min(100vh, calc(100vw * 3 / 4))',
        background: '#05070d',
        overflow: 'hidden',
      }}
    >
      {ready && (
        <Canvas
          flat
          linear
          dpr={1}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <GameRunner />
          <Scene />
          <RetroPipeline />
        </Canvas>
      )}
      <Hud />
    </div>
  );
}
