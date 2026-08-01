"use client";

/**
 * CloneStudio — capture rig for building your AI clone fighter.
 *
 * Uses the Mac's built-in camera OR an iPhone via macOS Continuity Camera
 * (an iPhone 17 running iOS 26 alongside macOS Tahoe shows up as an ordinary
 * video input — no app, no cable; just pick it in the device list).
 *
 * Output feeds the clone pipeline:
 *   1. TURNAROUND  — 4 stills (front/left/right/back) => character sheet
 *   2. MOTION      — short clips of real technique => video-to-3D mocap
 *   3. GENERATE    => image-to-3D mesh + rig + retarget onto the fighter
 *
 * Everything here is local: frames stay in the browser until you download them.
 * Nothing is uploaded automatically.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const ANGLES = [
  { id: "front", label: "Front", hint: "square to camera, arms relaxed" },
  { id: "left", label: "Left ¾", hint: "turn 45° left, same distance" },
  { id: "right", label: "Right ¾", hint: "turn 45° right" },
  { id: "back", label: "Back", hint: "face away, arms relaxed" },
] as const;

type Shot = { angle: string; url: string; at: number };

export default function CloneStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [live, setLive] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  // Start optimistic so the server-rendered markup matches the first client
  // render (no hydration mismatch), then correct it once mounted.
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    setSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
    setRecording(false);
  }, []);

  const start = useCallback(
    async (id?: string) => {
      setErr(null);
      if (!supported) {
        setErr("This browser/webview does not expose a camera API.");
        return;
      }
      try {
        stop();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: id
            ? { deviceId: { exact: id }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setLive(true);
        // labels only populate after permission is granted
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (!id && cams[0]) setDeviceId(cams[0].deviceId);
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        setErr(
          /permission|denied|NotAllowed/i.test(m)
            ? "Camera permission denied. macOS: System Settings → Privacy & Security → Camera, enable this app, then relaunch."
            : `Could not open camera: ${m}`,
        );
      }
    },
    [stop, supported],
  );

  useEffect(() => {
    // enumerate (unlabeled) up-front so the picker isn't empty
    if (!supported) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((l) => setDevices(l.filter((d) => d.kind === "videoinput")))
      .catch(() => {});
    return () => stop();
  }, [stop, supported]);

  const grab = useCallback((angle: string) => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const x = c.getContext("2d");
    if (!x) return;
    x.drawImage(v, 0, 0);
    const url = c.toDataURL("image/png");
    setShots((s) => [...s.filter((p) => p.angle !== angle), { angle, url, at: Date.now() }]);
  }, []);

  const shootWithTimer = useCallback(
    (angle: string) => {
      if (countdown !== null) return;
      let n = 3;
      setCountdown(n);
      const iv = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearInterval(iv);
          setCountdown(null);
          grab(angle);
        } else setCountdown(n);
      }, 1000);
    },
    [countdown, grab],
  );

  const toggleRecord = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setClipUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setRecording(false);
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setErr("Recording not supported in this webview.");
    }
  }, [recording]);

  const isPhone = (label: string) =>
    /iphone|continuity|ipad/i.test(label);

  return (
    <div className="cs-wrap">
      <header className="cs-head">
        <div>
          <h1>Clone Studio</h1>
          <p>
            Capture yourself → build your fighter. Frames stay local until you
            download them.
          </p>
        </div>
        <div className="cs-actions">
          {!live ? (
            <button className="cs-btn primary" onClick={() => start(deviceId || undefined)}>
              ● Start camera
            </button>
          ) : (
            <button className="cs-btn" onClick={stop}>
              ■ Stop
            </button>
          )}
        </div>
      </header>

      {!supported && (
        <p className="cs-err">
          No camera API available here. Open this tab in the desktop app or a
          browser over <code>https://</code> / <code>localhost</code>.
        </p>
      )}
      {err && <p className="cs-err">{err}</p>}

      <div className="cs-grid">
        <div className="cs-stage">
          <video ref={videoRef} playsInline muted aria-label="Camera preview" />
          {!live && <div className="cs-idle">camera off</div>}
          {countdown !== null && <div className="cs-count">{countdown}</div>}
          {recording && <div className="cs-rec">● REC</div>}
        </div>

        <aside className="cs-side">
          <label className="cs-lab">Camera</label>
          <select
            className="cs-sel"
            value={deviceId}
            onChange={(e) => {
              setDeviceId(e.target.value);
              if (live) start(e.target.value);
            }}
          >
            {devices.length === 0 && <option value="">(start camera to list)</option>}
            {devices.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {isPhone(d.label) ? "📱 " : "💻 "}
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
          <p className="cs-tip">
            <b>iPhone 17?</b> Keep it unlocked and near the Mac — Continuity
            Camera makes it appear in this list automatically. It is the better
            sensor; use it for the turnaround.
          </p>

          <label className="cs-lab">1 · Turnaround</label>
          <div className="cs-angles">
            {ANGLES.map((a) => {
              const done = shots.some((s) => s.angle === a.id);
              return (
                <button
                  key={a.id}
                  className={`cs-angle${done ? " done" : ""}`}
                  disabled={!live}
                  onClick={() => shootWithTimer(a.id)}
                  title={a.hint}
                >
                  <span>{a.label}</span>
                  <small>{done ? "captured ✓" : a.hint}</small>
                </button>
              );
            })}
          </div>

          <label className="cs-lab">2 · Motion clip</label>
          <button
            className={`cs-btn wide${recording ? " rec" : ""}`}
            disabled={!live}
            onClick={toggleRecord}
          >
            {recording ? "■ Stop recording" : "● Record technique (5–10s)"}
          </button>
          <p className="cs-tip">
            Film one clean rep — a shot, a sprawl, a jab. This is what
            video-to-3D mocap retargets onto the fighter.
          </p>
        </aside>
      </div>

      {(shots.length > 0 || clipUrl) && (
        <section className="cs-out">
          <h2>Captures</h2>
          <div className="cs-thumbs">
            {shots.map((s) => (
              <figure key={s.angle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={`${s.angle} capture`} />
                <figcaption>
                  <span>{s.angle}</span>
                  <a href={s.url} download={`clone-${s.angle}.png`}>
                    download
                  </a>
                </figcaption>
              </figure>
            ))}
            {clipUrl && (
              <figure>
                <video src={clipUrl} controls />
                <figcaption>
                  <span>motion</span>
                  <a href={clipUrl} download="clone-motion.webm">
                    download
                  </a>
                </figcaption>
              </figure>
            )}
          </div>
          <p className="cs-tip">
            Drop these into <code>public/assets/clone/</code>, then run the clone
            pipeline — see <code>docs/CLONE_PIPELINE.md</code>.
          </p>
        </section>
      )}

      <style jsx>{`
        .cs-wrap {
          padding: 22px 26px 40px;
          max-width: 1040px;
          margin: 0 auto;
          color: var(--ink);
        }
        .cs-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 14px;
        }
        h1 {
          font: 600 22px/1.2 Georgia, serif;
          margin: 0 0 4px;
        }
        .cs-head p {
          margin: 0;
          color: var(--ink-dim);
          font-size: 13px;
        }
        .cs-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line);
          color: var(--ink);
          font: 600 12px/1 system-ui;
          padding: 10px 14px;
          border-radius: 9px;
          cursor: pointer;
        }
        .cs-btn:hover:not(:disabled) {
          border-color: var(--gold);
        }
        .cs-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .cs-btn.primary {
          background: rgba(138, 125, 255, 0.18);
          border-color: var(--accent);
        }
        .cs-btn.wide {
          width: 100%;
        }
        .cs-btn.rec {
          border-color: #cf5050;
          color: #ff9a9a;
        }
        .cs-err {
          background: rgba(207, 80, 80, 0.12);
          border: 1px solid rgba(207, 80, 80, 0.4);
          color: #ffb4b4;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 12.5px;
        }
        .cs-grid {
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 16px;
        }
        .cs-stage {
          position: relative;
          background: #05060a;
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          aspect-ratio: 16 / 10;
        }
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scaleX(-1);
        }
        .cs-idle {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink-dim);
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .cs-count {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font: 700 90px Georgia, serif;
          color: var(--gold);
          text-shadow: 0 4px 30px #000;
        }
        .cs-rec {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(207, 80, 80, 0.9);
          color: #fff;
          font: 700 11px system-ui;
          padding: 5px 9px;
          border-radius: 20px;
          letter-spacing: 0.6px;
        }
        .cs-side {
          background: var(--panel-solid);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
        }
        .cs-lab {
          display: block;
          font: 600 10.5px system-ui;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--ink-dim);
          margin: 14px 0 7px;
        }
        .cs-lab:first-child {
          margin-top: 0;
        }
        .cs-sel {
          width: 100%;
          background: #0b0d16;
          color: var(--ink);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 9px;
          font-size: 12.5px;
        }
        .cs-tip {
          color: var(--ink-dim);
          font-size: 11.5px;
          line-height: 1.5;
          margin: 9px 0 0;
        }
        .cs-tip b {
          color: var(--ink);
        }
        .cs-angles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }
        .cs-angle {
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--line);
          border-radius: 9px;
          padding: 9px;
          cursor: pointer;
          color: var(--ink);
        }
        .cs-angle:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .cs-angle span {
          display: block;
          font: 600 12px system-ui;
        }
        .cs-angle small {
          display: block;
          color: var(--ink-dim);
          font-size: 10px;
          margin-top: 2px;
        }
        .cs-angle.done {
          border-color: #46e08a;
        }
        .cs-angle.done small {
          color: #46e08a;
        }
        .cs-out {
          margin-top: 22px;
          background: var(--panel-solid);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
        }
        h2 {
          font: 600 15px Georgia, serif;
          margin: 0 0 12px;
        }
        .cs-thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        figure {
          margin: 0;
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
          background: #05060a;
        }
        figure img,
        figure video {
          width: 100%;
          display: block;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          transform: none;
        }
        figcaption {
          display: flex;
          justify-content: space-between;
          padding: 7px 9px;
          font-size: 11px;
          color: var(--ink-dim);
          text-transform: capitalize;
        }
        figcaption a {
          color: var(--gold);
        }
        code {
          background: rgba(255, 255, 255, 0.06);
          padding: 1px 5px;
          border-radius: 4px;
          color: var(--gold);
          font-size: 11px;
        }
        @media (max-width: 860px) {
          .cs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
