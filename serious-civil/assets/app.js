// app.js — the cockpit. Reads the form, runs the honest engine, and lets Gus
// and Marcus react. Classic script; depends on window.SeriousCivilEngine.
(function () {
  "use strict";
  const E = window.SeriousCivilEngine;
  const $ = (id) => document.getElementById(id);

  let units = "imperial"; // "imperial" | "si"

  // ── Gus (grumpy mentor) and Marcus (older brother) react to the verdict ──
  // Gus tells you the truth that keeps the bridge standing. Marcus tells you
  // the truth that keeps YOU standing. Both are honest. Neither one lies to be
  // kind, and neither one is cruel to feel strong.
  const VOICES = {
    fail: {
      gus: "Tear it up. The fiber stress blew past allowable — that's not a design, that's a lawsuit with a ribbon on it. Go bigger or go home.",
      marcus: "Hey. Failing the check on paper is the cheapest failure there is. Nobody got hurt, nothing got poured. Size it up and run it again — you caught it. That's the job.",
    },
    edge: {
      gus: "It holds. On paper. With zero margin and a bad day waiting. I've buried designs that 'held.' Give me daylight, not a coin flip.",
      marcus: "It's close, and close makes me nervous too. Bump the section a notch — sleeping at night is part of the spec. You know this one.",
    },
    pass_soft: {
      gus: "Strong enough, sure. But it'll bounce like a diving board and every tenant will feel it. Stiffness isn't strength. Fix the deflection.",
      marcus: "Numbers are good — it just feels lively. People trust a floor that doesn't move. Little deeper section and it's golden.",
    },
    pass: {
      gus: "...Fine. It holds, with real margin, and you didn't waste a ton of steel doing it. Don't let it go to your head.",
      marcus: "There it is. Clean, honest, efficient. THIS is the feeling — I'd ship a save file over this. Proud of you, man.",
    },
    refusal: {
      gus: "Good. You felt that itch that says 'this number's too clean to be real.' Concrete is rebar and crack patterns, not a textbook block. Reach for ACI 318, not a shortcut.",
      marcus: "I love that you stopped instead of bluffing. The honest 'I don't know yet' is worth more than a confident wrong answer every single time. We'll learn the concrete chapter together.",
    },
    invalid: {
      gus: "I can't judge empty boxes. Numbers. Real ones. Then we'll talk.",
      marcus: "No rush — fill in the span, the load, the section. I got you. We'll take it one field at a time.",
    },
  };

  // Unit label + parse helpers ------------------------------------------------
  function L_unit() { return units === "si" ? "m" : "ft"; }
  function P_unit() { return units === "si" ? "kN" : "lbf"; }
  function W_unit() { return units === "si" ? "kN/m" : "lbf/ft"; }
  function dim_unit() { return units === "si" ? "mm" : "in"; }

  function toSI() {
    // Pull raw numbers and convert everything to SI for the engine.
    const num = (id) => parseFloat($(id).value);
    const Lraw = num("span"), Praw = num("pload"), Wraw = num("udl");
    const braw = num("width"), hraw = num("height");

    let L, P, w, b, h;
    if (units === "si") {
      L = Lraw;                 // m
      P = Praw * 1000;          // kN -> N
      w = Wraw * 1000;          // kN/m -> N/m
      b = braw / 1000;          // mm -> m
      h = hraw / 1000;          // mm -> m
    } else {
      L = Lraw * E.UNIT.ft;     // ft -> m
      P = Praw * E.UNIT.lbf;    // lbf -> N
      w = Wraw * E.UNIT.lbf_per_ft; // lbf/ft -> N/m
      b = braw * E.UNIT.in;     // in -> m
      h = hraw * E.UNIT.in;     // in -> m
    }
    return { L, P, w, b, h };
  }

  // Display formatting --------------------------------------------------------
  function fmtMoment(M) {
    if (units === "si") return { v: (M / 1000).toFixed(2), u: "kN·m" };
    return { v: (M / E.UNIT.Nm_to_lbft).toFixed(0), u: "lbf·ft" };
  }
  function fmtForce(F) {
    if (units === "si") return { v: (F / 1000).toFixed(2), u: "kN" };
    return { v: (F / E.UNIT.lbf).toFixed(0), u: "lbf" };
  }
  function fmtStress(s) {
    if (units === "si") return { v: (s / 1e6).toFixed(1), u: "MPa" };
    return { v: (s / E.UNIT.Pa_to_psi).toFixed(0), u: "psi" };
  }
  function fmtDefl(d) {
    if (units === "si") return { v: (d * 1000).toFixed(2), u: "mm" };
    return { v: (d / E.UNIT.in).toFixed(3), u: "in" };
  }

  function metric(k, obj) {
    return `<div class="metric"><div class="k">${k}</div><div class="v">${obj.v} <span class="u">${obj.u}</span></div></div>`;
  }

  // Main recompute ------------------------------------------------------------
  function recompute() {
    const loadCase = $("loadcase").value;
    const material = $("material").value;
    const lc = E.LOAD_CASES[loadCase];
    const { L, P, w, b, h } = toSI();

    // Toggle which load field is relevant.
    $("field-pload").style.display = lc.needsPoint ? "" : "none";
    $("field-udl").style.display = lc.needsUDL ? "" : "none";

    const loadVal = lc.needsPoint ? P : w;
    const valid =
      isFinite(L) && L > 0 &&
      isFinite(loadVal) && loadVal > 0 &&
      isFinite(b) && b > 0 && isFinite(h) && h > 0;

    const out = $("results");
    const vbox = $("verdict");

    if (!valid) {
      out.innerHTML = `<div class="metric" style="grid-column:1/-1;color:var(--ink-dim)">Awaiting real numbers…</div>`;
      renderVerdict(vbox, { kind: "invalid", headline: "Nothing to judge yet." }, VOICES.invalid);
      setPower(E.powerLevel({ valid: false }));
      return;
    }

    const { I, S } = E.sectionRect(b, h);
    const r = E.solveBeam({ loadCase, L, P, w, E: E.MATERIALS[material].E, I, S });
    const v = E.verdict({ material, sigma: r.sigma, defl: r.defl, L });

    // Metrics
    let html =
      metric("Reaction", fmtForce(r.R)) +
      metric("Max shear", fmtForce(r.V)) +
      metric("Max moment", fmtMoment(r.M)) +
      metric("Max deflection", fmtDefl(r.defl));

    if (v.kind !== "refusal") {
      html += metric("Peak bending stress", fmtStress(r.sigma));
      html += metric("Allowable stress", fmtStress(v.allowable));
      const pct = Math.min(v.utilization * 100, 200);
      const cls = v.kind === "fail" ? "u-fail" : v.kind === "edge" ? "u-edge" : "u-pass";
      html += `<div class="util-bar ${cls}" style="grid-column:1/-1" title="stress ÷ allowable">
                 <span style="width:${Math.min(pct, 100)}%"></span>
                 <div class="pct">UTILIZATION ${(v.utilization * 100).toFixed(0)}% — L/${v.deflRatio === Infinity ? "∞" : v.deflRatio.toFixed(0)} stiffness</div>
               </div>`;
    } else {
      html += `<div class="metric" style="grid-column:1/-1;color:var(--cyan)">Bending stress: <b>withheld — see verdict</b></div>`;
    }
    out.innerHTML = html;

    // Verdict + voices
    let voice;
    if (v.kind === "refusal") voice = VOICES.refusal;
    else if (v.kind === "fail") voice = VOICES.fail;
    else if (v.kind === "edge") voice = VOICES.edge;
    else if (v.kind === "pass" && !v.servicePass) voice = VOICES.pass_soft;
    else voice = VOICES.pass;

    renderVerdict(vbox, v, voice);

    setPower(E.powerLevel({
      valid: true,
      utilization: v.kind === "refusal" ? null : v.utilization,
      servicePass: v.servicePass,
      refusal: v.kind === "refusal",
    }));
  }

  function renderVerdict(box, v, voice) {
    const kind = v.kind || "invalid";
    let extra = "";
    if (v.reasons) extra = `<ul style="margin:8px 0 0;padding-left:18px;color:var(--ink-dim);font-size:13.5px">${v.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>`;
    box.className = "verdict kind-" + kind;
    box.innerHTML = `
      <div class="headline">${v.headline}</div>
      ${extra}
      <div class="dialogue gus">
        <div class="who"><div class="name">GUS “REBAR”</div><div class="role">grumpy PE, 41 yrs</div></div>
        <div class="says">${voice.gus}</div>
      </div>
      <div class="dialogue marcus">
        <div class="who"><div class="name">MARCUS</div><div class="role">your older brother</div></div>
        <div class="says">${voice.marcus}</div>
      </div>`;
  }

  function setPower(p) {
    $("pl-value").textContent = p.value.toLocaleString();
    $("pl-tier").textContent = p.tier;
    $("pl-line").textContent = p.line;
    const pct = Math.max(4, Math.min(100, (p.value / 9001) * 100));
    $("pl-bar").style.width = pct + "%";
    $("power").classList.toggle("over9000", p.value >= 9000);
  }

  // Unit toggle + relabeling --------------------------------------------------
  function relabel() {
    $("u-span").textContent = `Span (${L_unit()})`;
    $("u-pload").textContent = `Point load (${P_unit()})`;
    $("u-udl").textContent = `Uniform load (${W_unit()})`;
    $("u-width").textContent = `Width b (${dim_unit()})`;
    $("u-height").textContent = `Height h (${dim_unit()})`;
  }

  function setUnits(next) {
    if (next === units) return;
    units = next;
    $("btn-imperial").classList.toggle("active", units === "imperial");
    $("btn-si").classList.toggle("active", units === "si");
    relabel();
    recompute();
  }

  // Wire up -------------------------------------------------------------------
  function init() {
    // Populate selects
    const lcSel = $("loadcase");
    Object.entries(E.LOAD_CASES).forEach(([k, c]) => {
      const o = document.createElement("option");
      o.value = k; o.textContent = c.label; lcSel.appendChild(o);
    });
    const mSel = $("material");
    Object.entries(E.MATERIALS).forEach(([k, m]) => {
      const o = document.createElement("option");
      o.value = k; o.textContent = m.label; mSel.appendChild(o);
    });

    ["span", "pload", "udl", "width", "height"].forEach((id) =>
      $(id).addEventListener("input", recompute));
    ["loadcase", "material"].forEach((id) =>
      $(id).addEventListener("change", recompute));
    $("btn-imperial").addEventListener("click", () => setUnits("imperial"));
    $("btn-si").addEventListener("click", () => setUnits("si"));

    relabel();
    recompute();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
