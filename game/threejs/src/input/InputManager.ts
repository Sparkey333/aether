// Polls keyboard / mouse / gamepad, maps to canonical actions, and maintains a 6-frame input
// buffer (combat.json:inputBufferFrames). Combat reads consume()/isHeld() on the fixed step.
import { type Action, type KeyBindings, DEFAULT_KEYS, GAMEPAD_BUTTONS } from './bindings';

interface BufferedPress {
  action: Action;
  frame: number;
}

export class InputManager {
  private keys = new Set<string>(); // currently-held key codes / mouse buttons
  private edges = new Set<string>(); // pressed-this-frame
  private buffer: BufferedPress[] = [];
  private bufferFrames: number;
  private bindings: KeyBindings;

  // analog look accumulated from pointer movement since last fixed step
  private lookDX = 0;
  private lookDY = 0;
  private pointerLocked = false;

  private gamepadIndex: number | null = null;
  private prevPadButtons: boolean[] = [];

  private detach: (() => void) | null = null;

  constructor(bufferFrames = 6, bindings: KeyBindings = DEFAULT_KEYS) {
    this.bufferFrames = bufferFrames;
    this.bindings = bindings;
  }

  attach(el: HTMLElement): void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!this.keys.has(e.code)) this.edges.add(e.code);
      this.keys.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    const mouseCode = (b: number) => `Mouse${b}`;
    const onMouseDown = (e: MouseEvent) => {
      const c = mouseCode(e.button);
      if (!this.keys.has(c)) this.edges.add(c);
      this.keys.add(c);
      if (!this.pointerLocked && el.requestPointerLock) el.requestPointerLock();
    };
    const onMouseUp = (e: MouseEvent) => this.keys.delete(mouseCode(e.button));
    const onMouseMove = (e: MouseEvent) => {
      if (this.pointerLocked) {
        this.lookDX += e.movementX;
        this.lookDY += e.movementY;
      }
    };
    const onContext = (e: Event) => e.preventDefault();
    const onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === el;
    };
    const onGamepad = (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('contextmenu', onContext);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('gamepadconnected', onGamepad);

    this.detach = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('contextmenu', onContext);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('gamepadconnected', onGamepad);
    };
  }

  dispose(): void {
    this.detach?.();
    this.detach = null;
  }

  private codesFor(action: Action): string[] {
    return this.bindings.actions[action];
  }

  private heldByKeys(action: Action): boolean {
    return this.codesFor(action).some((c) => this.keys.has(c));
  }

  /** call at the START of each fixed step: advances the buffer and folds in gamepad edges */
  beginFixedStep(frame: number): void {
    const pad = this.pollGamepad();

    // record edges (keyboard/mouse) into the buffer
    for (const action of Object.keys(this.bindings.actions) as Action[]) {
      const pressedByKey = this.codesFor(action).some((c) => this.edges.has(c));
      const pressedByPad = pad.edges.has(action);
      if (pressedByKey || pressedByPad) this.buffer.push({ action, frame });
    }
    // expire old buffer entries
    this.buffer = this.buffer.filter((b) => frame - b.frame < this.bufferFrames);
    this.edges.clear();
  }

  /** buffer-aware consume: true if the action was pressed within the buffer window; consumes it */
  consume(action: Action): boolean {
    const idx = this.buffer.findIndex((b) => b.action === action);
    if (idx >= 0) {
      this.buffer.splice(idx, 1);
      return true;
    }
    return false;
  }

  isHeld(action: Action): boolean {
    if (this.heldByKeys(action)) return true;
    return this.padHeld.has(action);
  }

  /** analog move vector in [-1,1]^2 (x=right, y=forward) combining WASD + left stick */
  moveVector(): [number, number] {
    let x = 0;
    let y = 0;
    if (this.keys.has(this.bindings.moveRight)) x += 1;
    if (this.keys.has(this.bindings.moveLeft)) x -= 1;
    if (this.keys.has(this.bindings.moveForward)) y += 1;
    if (this.keys.has(this.bindings.moveBack)) y -= 1;
    // gamepad left stick overrides when deflected
    const lx = this.padAxes[0] ?? 0;
    const ly = this.padAxes[1] ?? 0;
    if (Math.hypot(lx, ly) > 0.2) {
      x = lx;
      y = -ly;
    }
    const len = Math.hypot(x, y);
    return len > 1 ? [x / len, y / len] : [x, y];
  }

  /** consume accumulated look delta (mouse pixels + right stick) for this step */
  consumeLook(): [number, number] {
    const stickX = this.padAxes[2] ?? 0;
    const stickY = this.padAxes[3] ?? 0;
    const dx = this.lookDX + (Math.abs(stickX) > 0.15 ? stickX * 18 : 0);
    const dy = this.lookDY + (Math.abs(stickY) > 0.15 ? stickY * 18 : 0);
    this.lookDX = 0;
    this.lookDY = 0;
    return [dx, dy];
  }

  // ---- gamepad ----
  private padAxes: number[] = [];
  private padHeld = new Set<Action>();
  private pollGamepad(): { edges: Set<Action> } {
    const edges = new Set<Action>();
    const pads = navigator.getGamepads?.() ?? [];
    const pad = this.gamepadIndex != null ? pads[this.gamepadIndex] : pads.find((p) => p);
    if (!pad) return { edges };
    this.padAxes = pad.axes.slice();
    this.padHeld.clear();
    pad.buttons.forEach((btn, i) => {
      const action = GAMEPAD_BUTTONS[i];
      const pressed = btn.pressed || btn.value > 0.5;
      const was = this.prevPadButtons[i] ?? false;
      if (action && pressed) this.padHeld.add(action);
      if (action && pressed && !was) edges.add(action);
      this.prevPadButtons[i] = pressed;
    });
    return { edges };
  }
}
