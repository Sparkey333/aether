// Player combat: the DMC nervous system. Combo state machine over the weapon's move graph (light /
// heavy strings with cancel-window chaining), leyline specials + Cauterize on Aether, block & parry.
// Attacks are rooted (no root-motion in M3). Flow/Aether are updated in the player's onLandHit.
import type { Move, WeaponConfig, CombatConstants } from '@/data/types';
import type { Flow } from './Flow';
import type { Aether } from './Aether';
import { MoveRunner, type ActiveHit } from './MoveRunner';

export interface CombatInput {
  light: boolean;
  heavy: boolean;
  special1: boolean;
  special2: boolean;
  cauterize: boolean;
  blockHeld: boolean;
  parry: boolean;
}

export interface PlayerLike {
  x: number; y: number; z: number; yaw: number;
  stamina: number;
  flow: Flow;
  aether: Aether;
  invulnerable: boolean; // dodge i-frames
}

export type CombatState = 'idle' | 'attack' | 'special' | 'parry' | 'block';

export class PlayerCombat {
  runner: MoveRunner | null = null;
  state: CombatState = 'idle';
  blocking = false;
  private parryFrame = -1; // -1 = not parrying
  private cauterizeFrames = 0;

  constructor(
    private c: CombatConstants,
    private moves: Map<string, Move>,
    private weapon: WeaponConfig,
  ) {}

  get cauterized(): boolean {
    return this.cauterizeFrames > 0;
  }

  parryActive(): boolean {
    const [a, b] = this.c.parry.active;
    return this.parryFrame >= a && this.parryFrame <= b;
  }

  hyperArmor(): boolean {
    return this.runner?.hyperArmor() ?? false;
  }

  /** rooted / uninterruptible for locomotion purposes */
  isBusy(): boolean {
    return this.runner !== null || this.parryFrame >= 0;
  }

  activeHits(host: PlayerLike): ActiveHit[] {
    return this.runner ? this.runner.activeHits(host.x, host.y, host.z, host.yaw) : [];
  }

  /** the flowMoveId of the move currently landing (for the player's onLandHit). */
  currentFlowMoveId(): string | null {
    if (!this.runner) return null;
    return this.runner.move.flowMoveId ?? this.runner.move.id;
  }

  /** cancel the current attack (e.g. dodge-cancel in the cancel window). */
  cancel(): void {
    this.runner = null;
    this.parryFrame = -1;
    this.state = 'idle';
  }

  outgoingMult(): number {
    return this.cauterized ? 1 + this.c.specials.cauterize.damageBoostPct : 1;
  }

  step(host: PlayerLike, input: CombatInput): void {
    if (this.cauterizeFrames > 0) this.cauterizeFrames--;

    // ---- parry in progress ----
    if (this.parryFrame >= 0) {
      this.parryFrame++;
      if (this.parryFrame > this.c.parry.totalFrames) {
        this.parryFrame = -1;
        this.state = 'idle';
      }
      return;
    }

    // ---- attack in progress ----
    if (this.runner) {
      this.runner.step();
      if (this.runner.inCancelWindow(this.c.comboLinkWindowFrames) && this.tryChain(host, input)) return;
      if (this.runner.done) {
        this.runner = null;
        this.state = 'idle';
      }
      return;
    }

    // ---- idle: pick a new action ----
    this.blocking = false;

    if (input.cauterize && this.cauterizeFrames === 0 && host.aether.spend(this.c.specials.cauterize.aetherCost)) {
      this.cauterizeFrames = this.c.specials.cauterize.durationFrames;
    }

    if (input.parry && host.stamina >= this.c.staminaCosts.parry) {
      host.stamina -= this.c.staminaCosts.parry;
      this.parryFrame = 0;
      this.state = 'parry';
      return;
    }

    if (input.special1 && this.startSpecial(host, this.c.specials.groundCurrent.moveId, this.c.specials.groundCurrent.aetherCost)) return;
    if (input.special2 && this.startSpecial(host, this.c.specials.leylineLance.moveId, this.c.specials.leylineLance.aetherCost)) return;

    if (input.heavy && this.startAttack(host, this.weapon.heavyCombo[0])) return;
    if (input.light && this.startAttack(host, this.weapon.lightCombo[0])) return;

    if (input.blockHeld) {
      this.blocking = true;
      this.state = 'block';
    }
  }

  private tryChain(host: PlayerLike, input: CombatInput): boolean {
    const next = this.runner!.move.comboNext ?? [];
    if (input.heavy) {
      const id = next.find((n) => this.moves.get(n)?.kind === 'heavy');
      if (id && this.startAttack(host, id)) return true;
    }
    if (input.light) {
      const id = next.find((n) => {
        const k = this.moves.get(n)?.kind;
        return k === 'light' || k === 'launcher' || k === 'aerial';
      });
      if (id && this.startAttack(host, id)) return true;
    }
    return false;
  }

  private startAttack(host: PlayerLike, moveId: string | undefined): boolean {
    if (!moveId) return false;
    const move = this.moves.get(moveId);
    if (!move) return false;
    const cost = move.staminaCost ?? 0;
    if (host.stamina < cost) return false;
    host.stamina -= cost;
    this.runner = new MoveRunner(move);
    this.state = 'attack';
    return true;
  }

  private startSpecial(host: PlayerLike, moveId: string, aetherCost: number): boolean {
    const move = this.moves.get(moveId);
    if (!move) return false;
    if (!this.cauterized && !host.aether.spend(aetherCost)) return false;
    this.runner = new MoveRunner(move);
    this.state = 'special';
    return true;
  }
}
