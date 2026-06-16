import { useCallback, useEffect, useRef, useState } from "react";
import { api, RUNNING_IN_TAURI } from "./api";
import { Familiar } from "./components/Familiar";
import { StarterSelect } from "./components/StarterSelect";
import { ChatLog } from "./components/ChatLog";
import { Composer } from "./components/Composer";
import { Gateways } from "./components/Gateways";
import { FAMILIARS, greeting, type Emote, type FamiliarId } from "./familiars";
import type { LensLevel, Snapshot, Status } from "./types";

function asLens(s: string): LensLevel {
  return s === "whisper" || s === "verbose" ? s : "default";
}

export default function App() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [emote, setEmote] = useState<Emote>("idle");
  const prevCount = useRef(0);

  const refresh = useCallback(async () => {
    setSnap(await api.snapshot());
  }, []);

  // initial load + live wiring
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let stopClip: (() => void) | undefined;
    (async () => {
      await refresh();
      unlisten = await api.onLedgerChanged(refresh);
      stopClip = api.startClipboardWatch(refresh);
    })();
    return () => {
      unlisten?.();
      stopClip?.();
    };
  }, [refresh]);

  // a small stir whenever the ledger grows
  useEffect(() => {
    if (!snap) return;
    if (snap.moments.length > prevCount.current && prevCount.current !== 0) {
      setEmote("stir");
      const t = setTimeout(() => setEmote("idle"), 800);
      return () => clearTimeout(t);
    }
    prevCount.current = snap.moments.length;
  }, [snap]);

  // Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      (e.shiftKey ? api.redo() : api.undo()).then(setSnap);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!snap) return <div className="boot">…</div>;

  const famId = snap.settings.familiar as FamiliarId | null;
  if (!famId) {
    return <StarterSelect onChoose={(id) => api.setFamiliar(id).then(setSnap)} />;
  }

  const fam = FAMILIARS[famId];
  const lens = asLens(snap.settings.lens);
  const openTo = snap.moments.filter((m) => m.status === "open").length;

  const curate = (id: string, status: Status) => api.curate(id, status).then(setSnap);
  const open = (target: string, kind: "url" | "path" | "app") =>
    void api.openGateway(target, kind);

  return (
    <div className="app" style={{ ["--accent" as string]: fam.accent } as React.CSSProperties}>
      <header className="topbar" data-tauri-drag-region>
        <div className="avatar">
          <Familiar id={famId} emote={emote} size={40} />
        </div>
        <div className="who">
          <div className="name">
            {fam.name} <span className="glyph">{fam.glyph}</span>
          </div>
          <div className="status">{greeting(fam)}</div>
        </div>
        <div className="tally" title="open to-dos">
          {openTo > 0 ? `${openTo} open` : "clear"}
        </div>
      </header>

      <ChatLog
        moments={snap.moments}
        familiar={fam}
        lens={lens}
        onCurate={curate}
        onOpen={open}
      />

      <div className="dock">
        <Gateways gateways={snap.settings.gateways} onOpen={open} />
        <Composer
          lens={lens}
          onLens={(l) => api.setLens(l).then(setSnap)}
          onSubmit={(summary, asTask) => api.logManual(summary, null, asTask).then(setSnap)}
        />
        <div className="undobar">
          <button disabled={!snap.canUndo} onClick={() => api.undo().then(setSnap)}>
            ↶ undo
          </button>
          <button disabled={!snap.canRedo} onClick={() => api.redo().then(setSnap)}>
            redo ↷
          </button>
          {!RUNNING_IN_TAURI && <span className="mockflag">browser preview</span>}
        </div>
      </div>
    </div>
  );
}
