// The IPC seam. One thin module the UI talks to, with a browser-only mock so
// the sidebar is viewable via plain `npm run dev` (no Tauri) while you iterate
// on the skin. Inside the real app, it calls the Rust commands.

import type { Snapshot, Status } from "./types";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export interface CairnApi {
  snapshot(): Promise<Snapshot>;
  logManual(summary: string, detail: string | null, asTask: boolean): Promise<Snapshot>;
  curate(id: string, status: Status): Promise<Snapshot>;
  undo(): Promise<Snapshot>;
  redo(): Promise<Snapshot>;
  setFamiliar(id: string): Promise<Snapshot>;
  setLens(level: string): Promise<Snapshot>;
  openGateway(target: string, kind: "url" | "path" | "app"): Promise<void>;
  onLedgerChanged(cb: () => void): Promise<() => void>;
  startClipboardWatch(onChange: () => void): () => void;
}

// --------------------------------------------------------------------------
// Real implementation (inside Tauri)
// --------------------------------------------------------------------------

function makeTauriApi(): CairnApi {
  // Imported lazily so the mock path never needs the Tauri runtime.
  const core = () => import("@tauri-apps/api/core");
  const event = () => import("@tauri-apps/api/event");
  const clip = () => import("@tauri-apps/plugin-clipboard-manager");
  const opener = () => import("@tauri-apps/plugin-opener");

  const call = async (cmd: string, args?: Record<string, unknown>) =>
    (await core()).invoke<Snapshot>(cmd, args);

  return {
    snapshot: () => call("get_snapshot"),
    logManual: (summary, detail, asTask) => call("log_manual", { summary, detail, asTask }),
    curate: (id, status) => call("curate", { id, status }),
    undo: () => call("undo"),
    redo: () => call("redo"),
    setFamiliar: (id) => call("set_familiar", { id }),
    setLens: (level) => call("set_lens", { level }),
    async openGateway(target, kind) {
      const o = await opener();
      if (kind === "url") await o.openUrl(target);
      else if (kind === "path") await o.openPath(target);
      else await o.openPath(target);
    },
    async onLedgerChanged(cb) {
      const { listen } = await event();
      return listen("ledger://changed", () => cb());
    },
    startClipboardWatch(onChange) {
      let last = "";
      let alive = true;
      const tick = async () => {
        if (!alive) return;
        try {
          const { readText } = await clip();
          const text = (await readText()) ?? "";
          if (text && text !== last) {
            last = text;
            const { invoke } = await core();
            await invoke("ingest_clipboard", { text });
            onChange();
          }
        } catch {
          /* clipboard empty or non-text; stay quiet */
        }
      };
      const handle = setInterval(tick, 1500);
      return () => {
        alive = false;
        clearInterval(handle);
      };
    },
  };
}

// --------------------------------------------------------------------------
// Mock implementation (plain browser) — just enough to see the skin breathe
// --------------------------------------------------------------------------

function makeMockApi(): CairnApi {
  const now = Date.now();
  let seq = 5;
  const snap: Snapshot = {
    canUndo: false,
    canRedo: false,
    settings: {
      familiar: null,
      lens: "default",
      gateways: [{ id: "aether", label: "Aether · the Atlas", target: "#", kind: "url" }],
      watchFolders: [{ path: "~/Desktop", screenshots: true }],
      deviceId: "dev-mock",
    },
    moments: [
      mock("m5", now - 1000 * 30, "save", "logged", "CORE_BONES.md", "docs/CORE_BONES.md"),
      mock("m4", now - 1000 * 90, "screenshot", "logged", "Screenshot 2026-06-16 at 2.14.png"),
      mock("m3", now - 1000 * 240, "link", "logged", "tauri.app/start", null, ["https://tauri.app/start"]),
      mock("m2", now - 1000 * 600, "save", "logged", "lib.rs", "crates/cairn-core/src/lib.rs"),
      mock("m1", now - 1000 * 900, "note", "open", "wire the Ledger to the sidebar"),
    ],
  };

  function mock(
    id: string,
    ts: number,
    kind: Snapshot["moments"][number]["kind"],
    status: Status,
    summary: string,
    detail: string | null = null,
    links: string[] = [],
  ): Snapshot["moments"][number] {
    return {
      id,
      ts,
      kind,
      status,
      summary,
      detail,
      source: "mock",
      payloadPath: null,
      links,
      undoable: status !== "logged",
      deviceId: "dev-mock",
    };
  }

  const clone = (): Snapshot => JSON.parse(JSON.stringify(snap));

  return {
    snapshot: async () => clone(),
    async logManual(summary, detail, asTask) {
      seq += 1;
      snap.moments.unshift(
        mock(`m${seq}`, Date.now(), asTask ? "task" : "note", asTask ? "open" : "logged", summary, detail),
      );
      snap.canUndo = true;
      snap.canRedo = false;
      return clone();
    },
    async curate(id, status) {
      const m = snap.moments.find((x) => x.id === id);
      if (m) m.status = status;
      snap.canUndo = true;
      return clone();
    },
    async undo() {
      snap.canUndo = false;
      return clone();
    },
    async redo() {
      return clone();
    },
    async setFamiliar(id) {
      snap.settings.familiar = id;
      return clone();
    },
    async setLens(level) {
      snap.settings.lens = level;
      return clone();
    },
    async openGateway() {
      /* no-op in the browser */
    },
    async onLedgerChanged() {
      return () => {};
    },
    startClipboardWatch() {
      return () => {};
    },
  };
}

export const api: CairnApi = isTauri ? makeTauriApi() : makeMockApi();
export const RUNNING_IN_TAURI = isTauri;
