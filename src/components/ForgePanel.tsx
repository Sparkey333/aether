"use client";

// The Forge — tweak & regen Vault assets through Higgsfield, or conjure new
// ones from a prompt. Direct browser→Higgsfield (BYOK, key kept in
// localStorage only); works in web dev and the shipped Tauri app alike.

import { useEffect, useMemo, useState } from "react";
import {
  HF_KEY_STORAGE,
  HF_MODELS,
  generate,
  getStoredKey,
  uploadToHiggsfield,
  type HFResult,
} from "@/lib/higgsfield";
import type { VaultAsset } from "@/lib/vault";

const ASPECTS = ["1:1", "16:9", "4:3", "9:16", "3:4", "2:3"];

interface ForgeProps {
  /** asset sent over from the inspector ("Use in Forge") */
  reference: VaultAsset | null;
  onClearReference: () => void;
  /** called after a result is saved so the shell can reload the catalog */
  onSaved: () => void;
}

export default function ForgePanel({ reference, onClearReference, onSaved }: ForgeProps) {
  const [keyInput, setKeyInput] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  const [modelId, setModelId] = useState(HF_MODELS[0].id);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("1:1");
  const [refUrl, setRefUrl] = useState("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<HFResult["urls"]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());

  const model = useMemo(() => HF_MODELS.find((m) => m.id === modelId) ?? HF_MODELS[0], [modelId]);

  useEffect(() => {
    setHasKey(getStoredKey() != null);
  }, []);

  // when an asset is sent over, seed the prompt & pick a sensible model
  useEffect(() => {
    if (!reference) return;
    setPrompt(
      reference.prompt ??
        `${reference.name.replace(/[-_]/g, " ")} — refine and elevate; keep the composition, richer light and detail`,
    );
    if (model.imageInput === "none") setModelId("seedream-edit");
    setResults([]);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference?.id]);

  const saveKey = () => {
    try {
      if (keyInput.includes(":")) {
        localStorage.setItem(HF_KEY_STORAGE, keyInput.trim());
        setHasKey(true);
        setKeySaved(true);
        setKeyInput("");
        setTimeout(() => setKeySaved(false), 1800);
      } else if (!keyInput) {
        localStorage.removeItem(HF_KEY_STORAGE);
        setHasKey(false);
      }
    } catch {
      /* no storage */
    }
  };

  const resolveReferenceUrl = async (): Promise<string[] | undefined> => {
    if (model.imageInput === "none") return undefined;
    // explicit URL field wins; else the sent-over Vault asset
    if (refUrl.trim()) {
      if (/^https:\/\//.test(refUrl.trim())) return [refUrl.trim()];
      throw new Error("Reference URL must be https://");
    }
    if (reference?.url) {
      setStatus("uploading reference…");
      const blob = await (await fetch(reference.url)).blob();
      return [await uploadToHiggsfield(blob)];
    }
    if (model.imageInput === "required")
      throw new Error("This model needs a source image — pick an asset and press “Use in Forge”, or paste an https URL.");
    return undefined;
  };

  const run = async () => {
    setBusy(true);
    setError("");
    setResults([]);
    setStatus("submitting…");
    try {
      const imageUrls = await resolveReferenceUrl();
      const res = await generate(model, { prompt, aspect, imageUrls }, (s) => setStatus(`${s}…`));
      if (res.status === "completed" && res.urls.length) {
        setResults(res.urls);
        setStatus("");
      } else if (res.status === "nsfw") {
        setError("Flagged NSFW — credits refunded. Rephrase and re-forge.");
      } else {
        setError(`Generation ${res.status}${res.detail ? ` — ${res.detail}` : ""}.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  const saveToVault = async (url: string, type: "image" | "video") => {
    setSaving(url);
    try {
      const r = await fetch("/api/vault/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url,
          name: prompt.slice(0, 60),
          prompt,
          model: model.id,
          realm: reference?.realm ?? "virtual",
          role: type === "video" ? "motion" : reference?.role ?? "element",
          tags: reference ? [`from-${reference.source}`] : [],
          parentId: reference?.id,
        }),
      });
      if (!r.ok) throw new Error(`save ${r.status}`);
      setSavedUrls((s) => new Set(s).add(url));
      onSaved();
    } catch {
      // static (Tauri) build has no API — hand the file to the browser instead
      window.open(url, "_blank");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="forge">
      <div className="section-title">The Forge — Higgsfield</div>

      {!hasKey ? (
        <p className="empty" style={{ marginTop: 0 }}>
          Paste your Higgsfield <span className="kbd">KEY:SECRET</span> pair (from{" "}
          <a href="https://platform.higgsfield.ai" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            platform.higgsfield.ai
          </a>
          ). Stored on this device only — never bundled into a build.
        </p>
      ) : null}
      <div className="key-row" style={{ marginTop: 6 }}>
        <input
          type="password"
          placeholder={hasKey ? "key saved ✓ — paste to replace" : "hf key:secret"}
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <button className="btn" onClick={saveKey}>
          {keySaved ? "saved ✓" : "Save"}
        </button>
      </div>

      <label className="forge-label">Model</label>
      <select className="forge-select" value={modelId} onChange={(e) => setModelId(e.target.value)}>
        {HF_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <p className="forge-hint">{model.hint}</p>

      {model.imageInput !== "none" && (
        <>
          <label className="forge-label">Source image {model.imageInput === "required" ? "(required)" : "(optional)"}</label>
          {reference ? (
            <div className="forge-ref">
              {reference.url && (reference.kind === "2d" || reference.kind === "vector") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reference.url} alt={reference.name} />
              ) : (
                <span className="forge-ref-icon">◆</span>
              )}
              <span className="forge-ref-name">{reference.name}</span>
              <button className="forge-ref-x" onClick={onClearReference} title="clear">
                ✕
              </button>
            </div>
          ) : (
            <p className="forge-hint">Select an asset in the grid, then press “Use in Forge” — or paste an https URL:</p>
          )}
          <input
            className="forge-input"
            placeholder="https://… (overrides the selected asset)"
            value={refUrl}
            onChange={(e) => setRefUrl(e.target.value)}
          />
        </>
      )}

      <label className="forge-label">Prompt</label>
      <textarea
        className="forge-prompt"
        rows={4}
        placeholder="What should the Forge render?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {model.imageInput === "none" && (
        <>
          <label className="forge-label">Aspect</label>
          <div className="forge-aspects">
            {ASPECTS.map((a) => (
              <button
                key={a}
                className={`chip${aspect === a ? " on" : ""}`}
                onClick={() => setAspect(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </>
      )}

      <button className="btn primary forge-go" onClick={run} disabled={busy || !prompt.trim() || !hasKey}>
        {busy ? status || "forging…" : "⚒ Forge"}
      </button>
      {!hasKey && <p className="forge-hint">Add your key above to enable the Forge.</p>}
      {error && <p className="forge-error">{error}</p>}

      {results.length > 0 && (
        <div className="forge-results">
          {results.map((r) => (
            <div key={r.url} className="forge-result">
              {r.type === "video" ? (
                <video src={r.url} controls loop muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.url} alt="forged result" />
              )}
              <div className="forge-result-actions">
                <button
                  className="btn"
                  onClick={() => saveToVault(r.url, r.type)}
                  disabled={saving === r.url || savedUrls.has(r.url)}
                >
                  {savedUrls.has(r.url) ? "vaulted ✓" : saving === r.url ? "saving…" : "⬇ Save to Vault"}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setRefUrl(r.url);
                    setModelId(r.type === "video" ? modelId : "seedream-edit");
                  }}
                  disabled={r.type === "video"}
                >
                  ↻ Tweak this
                </button>
                <a className="btn" href={r.url} target="_blank" rel="noreferrer">
                  open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
