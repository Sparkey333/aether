// engine.js — the honest core of Serious Civil.
//
// Doctrine: a beam does not care about your feelings. The load is the load.
// Every number in here is textbook Euler–Bernoulli statics. Where the simple
// model stops being honest (e.g. reinforced concrete in bending), this engine
// REFUSES to fake a number rather than lie to you with confidence. That refusal
// is the whole point. White light in truth — even when the truth stings.
//
// Internally everything is SI: newtons (N), meters (m), pascals (Pa).
// Conversion happens only at the edges, for display.
//
// Classic script on purpose: no build step, no bundler, no `import`. Open
// index.html straight off disk and it runs. Exposes window.SeriousCivilEngine.

(function (root) {
  "use strict";

  const UNIT = {
    ft: 0.3048,
    in: 0.0254,
    lbf: 4.4482216153,
    lbf_per_ft: 4.4482216153 / 0.3048, // ≈ 14.5939 N/m
    Nm_to_lbft: 1.3558179483,
    Pa_to_psi: 6894.757293,
  };

  // Homogeneous, linearly-elastic materials only. These are the ones where
  // σ = M/S is an honest first-order answer. E in Pa, allowable bending stress
  // Fb in Pa (ASD-flavored, deliberately conservative). See docs/FORMULAS.md.
  // None of this stamps a drawing.
  const MATERIALS = {
    steel_a36: {
      label: "Steel · ASTM A36",
      E: 200e9, Fy: 250e6, Fb: 165e6, // ≈ 0.66·Fy classic ASD allowable
      note: "The honest workhorse. Ductile, predictable — it warns you before it lets go.",
    },
    aluminum_6061: {
      label: "Aluminum · 6061-T6",
      E: 69e9, Fy: 240e6, Fb: 145e6, // ≈ 0.6·Fy, rough
      note: "Light, springy, fatigues if you abuse it. Respect the cycles.",
    },
    titanium_ti64: {
      label: "Titanium · Ti-6Al-4V",
      E: 114e9, Fy: 880e6, Fb: 528e6, // ≈ 0.6·Fy
      note: "Strength-to-weight royalty. Expensive, gorgeous, metal as hell.",
    },
    wood_dfl: {
      label: "Wood · Douglas Fir-Larch",
      E: 11e9, Fy: null, Fb: 6.9e6, // ≈ 1000 psi typical Fb
      note: "Grew in the dirt and still holds your roof up. Honest material.",
    },
    concrete_rc: {
      label: "Reinforced Concrete",
      E: 25e9, Fy: null, Fb: null, // <-- the refusal lives here
      note: "Cracks in tension by design. σ=M/S is a LIE for this. See verdict.",
    },
  };

  const LOAD_CASES = {
    ss_point: { label: "Simply supported · point load at center", needsPoint: true, needsUDL: false },
    ss_udl: { label: "Simply supported · uniform load", needsPoint: false, needsUDL: true },
    cant_point: { label: "Cantilever · point load at free end", needsPoint: true, needsUDL: false },
    cant_udl: { label: "Cantilever · uniform load", needsPoint: false, needsUDL: true },
  };

  // Rectangular section second moment of area and section modulus.
  function sectionRect(b, h) {
    const I = (b * Math.pow(h, 3)) / 12; // m^4
    const S = (b * Math.pow(h, 2)) / 6; // m^3 (= I / c, c = h/2)
    return { I, S, c: h / 2 };
  }

  // Core solver. All inputs SI. Returns SI results.
  function solveBeam(opts) {
    const { loadCase, L, P, w, E, I, S } = opts;
    let R, V, M, defl;
    switch (loadCase) {
      case "ss_point":
        R = P / 2; V = P / 2; M = (P * L) / 4;
        defl = (P * Math.pow(L, 3)) / (48 * E * I);
        break;
      case "ss_udl": {
        const W = w * L;
        R = W / 2; V = W / 2; M = (w * L * L) / 8;
        defl = (5 * w * Math.pow(L, 4)) / (384 * E * I);
        break;
      }
      case "cant_point":
        R = P; V = P; M = P * L; // moment at the fixed support
        defl = (P * Math.pow(L, 3)) / (3 * E * I);
        break;
      case "cant_udl": {
        const W = w * L;
        R = W; V = W; M = (w * L * L) / 2;
        defl = (w * Math.pow(L, 4)) / (8 * E * I);
        break;
      }
      default:
        throw new Error("Unknown load case: " + loadCase);
    }
    const sigma = M / S; // peak bending stress, Pa (extreme fiber)
    return { R, V, M, defl, sigma };
  }

  const DEFLECTION_LIMIT_RATIO = 240; // total-load L/240, conservative-ish

  // The honest read. Returns a structured judgement the UI dresses in Gus's
  // voice (brutal) and Marcus's voice (warm). No spin. No false green.
  function verdict(args) {
    const { material, sigma, defl, L } = args;
    const mat = MATERIALS[material];

    // The refusal. Concrete in simple bending is not a σ=M/S problem.
    if (mat.Fb == null) {
      return {
        kind: "refusal",
        utilization: null,
        deflRatio: defl > 0 ? L / defl : Infinity,
        headline: "I won't fake this number.",
        reasons: [
          mat.label + " cracks in tension on purpose — concrete carries compression, steel rebar carries tension. σ = M/S treats it as one solid elastic block, which it is NOT.",
          "A real answer needs ACI 318: rebar area, cover, φ-factors, cracked-section analysis. I'll give you the deflection sketch, but I will not hand you a bending-stress number that lies with a straight face.",
        ],
        defl,
      };
    }

    const utilization = sigma / mat.Fb; // 1.0 == exactly at allowable
    const deflRatio = defl > 0 ? L / defl : Infinity; // bigger = stiffer

    let kind;
    if (utilization > 1.0) kind = "fail";
    else if (utilization > 0.9) kind = "edge";
    else kind = "pass";

    const servicePass = deflRatio >= DEFLECTION_LIMIT_RATIO;

    let headline;
    if (kind === "fail") headline = "This breaks. Not maybe. It breaks.";
    else if (kind === "edge") headline = "It holds — barely. No margin to be proud of.";
    else if (!servicePass) headline = "Strong enough, but it bounces. People will feel it.";
    else headline = "It holds, with honest margin to spare.";

    return { kind, utilization, deflRatio, servicePass, headline, defl, allowable: mat.Fb };
  }

  // Engi-Nerd power level. Rigor is the only thing that raises it — not vibes.
  function powerLevel(args) {
    const { valid, utilization, servicePass, refusal } = args;
    if (!valid) return { value: 0, tier: "DORMANT", line: "Feed me real numbers." };

    if (refusal) {
      // Choosing not to lie is itself max rigor. We honor it.
      return { value: 9001, tier: "TRUTH OVER GLORY", line: "You'd rather be right than look right. That's the whole game." };
    }

    let v = 1500; // a baseline for showing up and doing it right
    if (utilization != null) {
      if (utilization <= 1.0) v += 3000; // it actually stands up
      if (utilization >= 0.6 && utilization <= 0.85) v += 2500; // efficient, not wasteful, not reckless
      if (utilization > 1.0) v = Math.max(500, v - 1000); // overstressed tanks you
    }
    if (servicePass) v += 2200;

    let tier = "APPRENTICE";
    if (v >= 9000) tier = "OVER 9000";
    else if (v >= 7000) tier = "JOURNEYMAN";
    else if (v >= 4000) tier = "ENGI-NERD";

    let line = "Keep your units straight and your conscience straighter.";
    if (v >= 9000) line = "IT'S OVER 9000. And it's because the math is clean, not because you yelled.";
    else if (v >= 7000) line = "Tight design. Gus almost smiled. Almost.";

    return { value: Math.round(v), tier, line };
  }

  root.SeriousCivilEngine = {
    UNIT, MATERIALS, LOAD_CASES, DEFLECTION_LIMIT_RATIO,
    sectionRect, solveBeam, verdict, powerLevel,
  };
})(typeof window !== "undefined" ? window : this);
