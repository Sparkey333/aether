// Canonical action names (bible §2.13) and the default keyboard/mouse + gamepad bindings.
// Bindings are the comparison baseline; they are remappable later via settings.
export type Action =
  | 'LightAttack'
  | 'HeavyAttack'
  | 'Dodge'
  | 'Sprint'
  | 'Block'
  | 'Parry'
  | 'LockOn'
  | 'TargetSwitchLeft'
  | 'TargetSwitchRight'
  | 'UseFlask'
  | 'Special1'
  | 'Special2'
  | 'Cauterize'
  | 'Interact'
  | 'Pause';

// Movement is an analog vector (WASD or left stick); look is mouse / right stick.
export interface KeyBindings {
  moveForward: string;
  moveBack: string;
  moveLeft: string;
  moveRight: string;
  actions: Record<Action, string[]>; // KeyboardEvent.code(s) / 'Mouse0','Mouse1','Mouse2'
}

export const DEFAULT_KEYS: KeyBindings = {
  moveForward: 'KeyW',
  moveBack: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  actions: {
    LightAttack: ['Mouse0'],
    HeavyAttack: ['Mouse2'],
    Dodge: ['Space'],
    Sprint: ['ShiftLeft'],
    Block: ['KeyQ'],
    Parry: ['KeyE'],
    LockOn: ['Tab', 'Mouse1'],
    TargetSwitchLeft: ['BracketLeft'],
    TargetSwitchRight: ['BracketRight'],
    UseFlask: ['KeyR'],
    Special1: ['KeyF'],
    Special2: ['KeyC'],
    Cauterize: ['KeyV'],
    Interact: ['KeyE'],
    Pause: ['Escape'],
  },
};

// Standard gamepad button indices (Xbox layout) → actions.
export const GAMEPAD_BUTTONS: Partial<Record<number, Action>> = {
  0: 'Dodge', // A / Cross (also Sprint when held — resolved in code)
  2: 'LightAttack', // X / Square
  3: 'HeavyAttack', // Y / Triangle
  4: 'Block', // LB
  5: 'Special1', // RB
  10: 'LockOn', // R3 (right stick click)
  12: 'UseFlask', // Dpad up
  9: 'Pause', // Start
  1: 'Interact', // B / Circle
};
