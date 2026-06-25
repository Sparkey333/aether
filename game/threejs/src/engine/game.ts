// Single-player game singleton: owns the fixed-step loop, input, seeded RNG, and the player.
// Systems are registered once and run in a fixed order (part of the determinism contract).
import { GameLoop } from '@/engine/GameLoop';
import { InputManager } from '@/input/InputManager';
import { Rng } from '@/engine/Rng';
import { PlayerController } from '@/actors/CharacterController';
import { applyLook, type CamState } from '@/render/camera/ThirdPersonCamera';
import type { DesignData } from '@/data/types';

class Game {
  loop = new GameLoop();
  input = new InputManager();
  rng = new Rng(1);
  player: PlayerController | null = null;
  cam: CamState = { yaw: Math.PI, pitch: 0.32 };
  data: DesignData | null = null;
  private started = false;

  start(data: DesignData): void {
    if (this.started) return;
    this.data = data;
    this.rng = new Rng(data.combat.prngSeed);
    this.input = new InputManager(data.combat.inputBufferFrames);
    this.player = new PlayerController(data.combat);

    // Fixed-step system: input -> camera angles -> player locomotion.
    this.loop.addSystem((dt, frame) => {
      this.input.beginFixedStep(frame);
      const [lx, ly] = this.input.consumeLook();
      applyLook(this.cam, lx, ly);
      const move = this.input.moveVector();
      const sprint = this.input.isHeld('Sprint');
      const dodge = this.input.consume('Dodge');
      this.player!.step(dt, move, this.cam.yaw, sprint, dodge);
    });

    this.started = true;
  }
}

export const game = new Game();
