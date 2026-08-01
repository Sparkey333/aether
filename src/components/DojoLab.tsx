"use client";

/**
 * DojoLab — "The Construct: Sparring Program"
 *
 * A green-rain homage to 90s cyber-dojo cinema (aesthetic only — no trademarked
 * characters or marks). Renders an animated wooden dojo with two silhouettes
 * running a sparring loop, plus the live asset-pipeline board showing which
 * game assets are still vector placeholders vs. AI-generated.
 *
 * This is the staging room for the upgraded asset set: as Higgsfield (or any
 * configured provider) renders avatars/sprites/backdrops, they replace the
 * placeholders here first, before shipping into /play.
 */

import { useEffect, useRef, useState } from "react";

type AssetRow = {
  id: string;
  category: string;
  status: "placeholder" | "queued" | "generated";
  note: string;
};

// Mirrors public/assets/manifest.json categories. `generated` flips to true
// once scripts/generate-assets.mjs writes into public/assets/generated/.
const PIPELINE: AssetRow[] = [
  { id: "hero-portrait", category: "hero", status: "queued", note: "Founder — Ground Sovereign bible" },
  { id: "hero-stance", category: "hero", status: "queued", note: "full-body wrestling stance" },
  { id: "spr-idle", category: "sprites", status: "queued", note: "idle / breathing loop" },
  { id: "spr-shot", category: "sprites", status: "queued", note: "double-leg shot" },
  { id: "spr-armbar", category: "sprites", status: "queued", note: "armbar finish" },
  { id: "dojo-construct", category: "locations", status: "queued", note: "this room, rendered" },
  { id: "bjj-grappler", category: "avatars", status: "placeholder", note: "vector silhouette live" },
  { id: "muaythai-striker", category: "avatars", status: "placeholder", note: "vector silhouette live" },
  { id: "katana", category: "weapons", status: "placeholder", note: "vector prop live" },
  { id: "longsword", category: "weapons", status: "placeholder", note: "vector prop live" },
];

export default function DojoLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rain, setRain] = useState(true);
  const rainRef = useRef(true);

  useEffect(() => {
    rainRef.current = rain;
  }, [rain]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const W = (cv.width = 960);
    const H = (cv.height = 460);
    const GROUND = H - 70;

    const reduced =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- digital rain columns ----
    const COLS = Math.floor(W / 14);
    const drops = Array.from({ length: COLS }, () => Math.random() * -H);
    const speeds = Array.from({ length: COLS }, () => 55 + Math.random() * 150);
    const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01".split("");

    // ---- sparring choreography (looping exchange) ----
    const SEQ = [
      { a: "guard", b: "guard", t: 1.0 },
      { a: "strike", b: "guard", t: 0.5 },
      { a: "guard", b: "kick", t: 0.6 },
      { a: "grab", b: "hurt", t: 0.8 },
      { a: "guard", b: "guard", t: 0.7 },
      { a: "hurt", b: "strike", t: 0.5 },
      { a: "guard", b: "guard", t: 0.9 },
    ];
    let seqI = 0;
    let seqT = 0;

    let raf = 0;
    let last = 0;
    let time = 0;

    function fighter(
      x: number,
      face: 1 | -1,
      state: string,
      phase: number,
      color: string,
    ) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, GROUND);
      ctx.scale(face, 1);
      ctx.globalAlpha = 0.95;

      // grounded shadow
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      const bob = Math.sin(phase * 3) * 2;
      const hip = { x: 0, y: -56 + bob };
      const sh = { x: 2, y: -100 + bob };
      const head = { x: 4, y: -119 + bob };
      let arm1 = { x: 12, y: -84 };
      let lean = 0;
      let footR = { x: 14, y: 0 };

      if (state === "guard") arm1 = { x: 13, y: -95 };
      if (state === "strike") {
        arm1 = { x: 54, y: -98 };
        lean = 4;
      }
      if (state === "kick") {
        footR = { x: 50, y: -52 };
        lean = -6;
      }
      if (state === "grab") arm1 = { x: 40, y: -88 };
      if (state === "hurt") {
        lean = -9;
        arm1 = { x: -12, y: -76 };
      }
      ctx.translate(lean, 0);

      const line = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        w: number,
      ) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };

      line(hip.x, hip.y, -13, 0, 10);
      line(hip.x, hip.y, footR.x, footR.y, 10);
      line(hip.x, hip.y, sh.x, sh.y, 15);
      line(sh.x, sh.y, -9, -64, 7);
      line(sh.x, sh.y, arm1.x, arm1.y, 8);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw(dt: number) {
      if (!ctx) return;
      time += dt;

      // --- room ---
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a0d0a");
      g.addColorStop(1, "#050705");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // shoji screen wall
      ctx.save();
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 6; i++) {
        const x = 90 + i * 130;
        const lit = 0.05 + 0.05 * Math.abs(Math.sin(time * 0.5 + i));
        ctx.fillStyle = `rgba(190, 210, 170, ${lit})`;
        ctx.fillRect(x, 60, 108, GROUND - 130);
        ctx.strokeStyle = "rgba(60,45,30,0.85)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, 60, 108, GROUND - 130);
        ctx.lineWidth = 1;
        for (let r = 1; r < 4; r++) {
          ctx.beginPath();
          ctx.moveTo(x, 60 + ((GROUND - 130) / 4) * r);
          ctx.lineTo(x + 108, 60 + ((GROUND - 130) / 4) * r);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x + 54, 60);
        ctx.lineTo(x + 54, GROUND - 70);
        ctx.stroke();
      }
      ctx.restore();

      // ceiling beams
      ctx.fillStyle = "#1a140e";
      ctx.fillRect(0, 0, W, 60);
      ctx.fillStyle = "#241a11";
      for (let i = 0; i < 8; i++) ctx.fillRect(i * 128, 0, 16, 60);

      // floor
      const fg = ctx.createLinearGradient(0, GROUND - 10, 0, H);
      fg.addColorStop(0, "#3a2a1a");
      fg.addColorStop(1, "#150f09");
      ctx.fillStyle = fg;
      ctx.fillRect(0, GROUND - 10, W, H - GROUND + 10);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, GROUND + i * 8);
        ctx.lineTo(W, GROUND + i * 8);
        ctx.stroke();
      }

      // --- rain ---
      if (rainRef.current) {
        ctx.font = "13px monospace";
        for (let i = 0; i < COLS; i++) {
          drops[i] += speeds[i] * dt;
          if (drops[i] > H + 40) drops[i] = -Math.random() * 260;
          const x = i * 14 + 3;
          for (let k = 0; k < 7; k++) {
            const y = drops[i] - k * 15;
            if (y < 0 || y > H) continue;
            const a = k === 0 ? 0.85 : 0.42 - k * 0.055;
            ctx.fillStyle =
              k === 0 ? `rgba(200,255,205,${a})` : `rgba(50,220,90,${a})`;
            ctx.fillText(
              GLYPHS[(i * 7 + k + Math.floor(time * 6)) % GLYPHS.length],
              x,
              y,
            );
          }
        }
      }

      // --- sparring loop ---
      seqT += dt;
      if (seqT > SEQ[seqI].t) {
        seqT = 0;
        seqI = (seqI + 1) % SEQ.length;
      }
      const step = SEQ[seqI];
      const gap = step.a === "grab" ? 92 : 128;
      fighter(W / 2 - gap / 2, 1, step.a, time, "#1d3326");
      fighter(W / 2 + gap / 2, -1, step.b, time + 1.4, "#182c20");

      // rim light from the screens
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const rl = ctx.createRadialGradient(
        W / 2,
        GROUND - 90,
        20,
        W / 2,
        GROUND - 90,
        320,
      );
      rl.addColorStop(0, "rgba(70,200,110,0.12)");
      rl.addColorStop(1, "rgba(70,200,110,0)");
      ctx.fillStyle = rl;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // vignette + scanlines
      const vg = ctx.createRadialGradient(W / 2, H / 2, 140, W / 2, H / 2, 620);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    }

    function loop(ts: number) {
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      draw(reduced ? dt * 0.35 : dt);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const counts = {
    generated: PIPELINE.filter((p) => p.status === "generated").length,
    queued: PIPELINE.filter((p) => p.status === "queued").length,
    placeholder: PIPELINE.filter((p) => p.status === "placeholder").length,
  };

  return (
    <div className="dojo-wrap">
      <header className="dojo-head">
        <div>
          <h1>The Construct — Sparring Program</h1>
          <p>
            Asset staging room. Upgraded art lands here first, then ships into{" "}
            <a href="/play/index.html">the Arena</a>. Aesthetic homage only.
          </p>
        </div>
        <button className="dojo-btn" onClick={() => setRain((r) => !r)}>
          {rain ? "RAIN ON" : "RAIN OFF"}
        </button>
      </header>

      <div className="dojo-stage">
        <canvas ref={canvasRef} aria-label="Animated dojo sparring program" />
      </div>

      <section className="dojo-pipe">
        <div className="dojo-pipe-head">
          <h2>Asset pipeline</h2>
          <span>
            <b>{counts.generated}</b> generated · <b>{counts.queued}</b> queued ·{" "}
            <b>{counts.placeholder}</b> placeholder
          </span>
        </div>
        <p className="dojo-hint">
          Queue is defined in <code>public/assets/manifest.json</code>. Run{" "}
          <code>npm run assets:plan</code> to preview, <code>assets:generate</code>{" "}
          to render. Provider: Higgsfield (video/3D/motion) or Gemini (stills).
        </p>
        <ul className="dojo-rows">
          {PIPELINE.map((r) => (
            <li key={r.id} className={`dojo-row ${r.status}`}>
              <span className="dot" aria-hidden />
              <code>{r.id}</code>
              <span className="cat">{r.category}</span>
              <span className="note">{r.note}</span>
              <span className="st">{r.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <style jsx>{`
        .dojo-wrap {
          padding: 22px 26px 40px;
          max-width: 1040px;
          margin: 0 auto;
          color: var(--ink);
        }
        .dojo-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }
        h1 {
          font: 600 22px/1.2 Georgia, serif;
          margin: 0 0 4px;
        }
        .dojo-head p {
          margin: 0;
          color: var(--ink-dim);
          font-size: 13px;
        }
        .dojo-head a {
          color: var(--gold);
        }
        .dojo-btn {
          background: rgba(50, 220, 90, 0.1);
          border: 1px solid rgba(50, 220, 90, 0.45);
          color: #7ef0a0;
          font: 600 11px/1 system-ui;
          letter-spacing: 0.6px;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
        }
        .dojo-btn:hover {
          background: rgba(50, 220, 90, 0.18);
        }
        .dojo-stage {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          background: #050705;
          box-shadow: 0 20px 60px -30px rgba(50, 220, 90, 0.4);
        }
        canvas {
          display: block;
          width: 100%;
          aspect-ratio: 960 / 460;
        }
        .dojo-pipe {
          margin-top: 22px;
          background: var(--panel-solid);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px;
        }
        .dojo-pipe-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        h2 {
          font: 600 16px/1 Georgia, serif;
          margin: 0;
        }
        .dojo-pipe-head span {
          color: var(--ink-dim);
          font-size: 12px;
        }
        .dojo-pipe-head b {
          color: var(--ink);
        }
        .dojo-hint {
          color: var(--ink-dim);
          font-size: 12px;
          margin: 8px 0 14px;
        }
        code {
          background: rgba(255, 255, 255, 0.06);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11.5px;
          color: var(--gold);
        }
        .dojo-rows {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dojo-row {
          display: grid;
          grid-template-columns: 10px 150px 82px 1fr 84px;
          gap: 10px;
          align-items: center;
          padding: 8px 10px;
          border: 1px solid var(--line);
          border-radius: 8px;
          font-size: 12px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6b7080;
        }
        .queued .dot {
          background: var(--gold);
        }
        .generated .dot {
          background: #46e08a;
        }
        .cat,
        .note,
        .st {
          color: var(--ink-dim);
        }
        .st {
          text-align: right;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        .queued .st {
          color: var(--gold);
        }
        @media (max-width: 720px) {
          .dojo-row {
            grid-template-columns: 10px 1fr 70px;
          }
          .cat,
          .note {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
