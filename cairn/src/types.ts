// Mirrors cairn-core's serialized shapes. Keep these in lockstep with
// crates/cairn-core/src/lib.rs — they are the contract across the IPC seam.

export type Kind =
  | "create"
  | "save"
  | "edit"
  | "clip"
  | "paste"
  | "screenshot"
  | "move"
  | "task"
  | "note"
  | "link";

export type Status = "logged" | "open" | "done" | "dismissed";

export interface Moment {
  id: string;
  ts: number;
  kind: Kind;
  status: Status;
  summary: string;
  detail: string | null;
  source: string;
  payloadPath: string | null;
  links: string[];
  undoable: boolean;
  deviceId: string;
}

export interface Gateway {
  id: string;
  label: string;
  target: string;
  kind: "url" | "path" | "app";
}

export interface WatchFolder {
  path: string;
  screenshots: boolean;
}

export type LensLevel = "whisper" | "default" | "verbose";

export interface Settings {
  familiar: string | null;
  lens: string;
  gateways: Gateway[];
  watchFolders: WatchFolder[];
  deviceId: string;
}

export interface Snapshot {
  moments: Moment[];
  canUndo: boolean;
  canRedo: boolean;
  settings: Settings;
}
