"use client";

// The Vault — Aether's asset manager. Every 2D / 3D / background / audio /
// video asset harvested from the DarkHearts ecosystem (see
// aether.assets.config.json), browsable by realm and kind, and re-forgeable
// through Higgsfield.

import { useEffect, useMemo, useState } from "react";
import {
  KINDS,
  REALMS,
  formatBytes,
  loadCatalog,
  realmHex,
  type AssetKind,
  type AssetRealm,
  type VaultAsset,
  type VaultCatalog,
} from "@/lib/vault";
import ForgePanel from "@/components/ForgePanel";

const KIND_ICON: Record<string, string> = Object.fromEntries(KINDS.map((k) => [k.id, k.icon]));

export default function VaultShell() {
  const [catalog, setCatalog] = useState<VaultCatalog | null>(null);
  const [q, setQ] = useState("");
  const [realms, setRealms] = useState<Set<AssetRealm>>(new Set());
  const [kinds, setKinds] = useState<Set<AssetKind>>(new Set());
  const [bgOnly, setBgOnly] = useState(false);
  const [sources, setSources] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [forgeRef, setForgeRef] = useState<VaultAsset | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");

  const reload = () => loadCatalog().then(setCatalog);
  useEffect(() => {
    reload();
  }, []);

  const assets = useMemo(() => catalog?.assets ?? [], [catalog]);
  const selected = useMemo(
    () => assets.find((a) => a.id === selectedId) ?? null,
    [assets, selectedId],
  );

  const toggle = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return assets.filter((a) => {
      if (realms.size && !realms.has(a.realm)) return false;
      if (kinds.size && !kinds.has(a.kind)) return false;
      if (bgOnly && a.role !== "background") return false;
      if (sources.size && !sources.has(a.source)) return false;
      if (needle) {
        const hay = `${a.name} ${a.tags.join(" ")} ${a.sourceLabel} ${a.prompt ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [assets, q, realms, kinds, bgOnly, sources]);

  const runSync = async () => {
    setSyncing(true);
    setSyncNote("");
    try {
      const r = await fetch("/api/vault/sync", { method: "POST" });
      if (!r.ok) throw new Error(String(r.status));
      await reload();
      setSyncNote("synced ✓");
    } catch {
      setSyncNote("no server here — run `npm run assets:sync` in the repo");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncNote(""), 5000);
    }
  };

  const sourceList = catalog?.sources.filter((s) => !s.skipped) ?? [];
  const syncedAt = catalog?.syncedAt ? new Date(catalog.syncedAt).toLocaleString() : "never";

  return (
    <div className="vault">
      {/* ── left: filters ─────────────────────────────── */}
      <aside className="panel vault-side">
        <h1 className="brand">Vault</h1>
        <p className="brand-sub">every asset, one place · reuse · tweak · regen</p>

        <input
          className="vault-search"
          placeholder="Search name, tag, prompt…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="section-title">Realm</div>
        {REALMS.map((r) => (
          <label key={r.id} className="row">
            <input
              type="checkbox"
              checked={realms.has(r.id)}
              onChange={() => toggle(realms, r.id, setRealms)}
            />
            <span className="dot" style={{ background: r.hex }} />
            {r.label}
            <span className="vault-count">{catalog?.counts.byRealm[r.id] ?? 0}</span>
          </label>
        ))}
        <p className="tier-blurb">spiritual · physical · virtual — label every layer.</p>

        <div className="section-title">Kind</div>
        <div className="vault-chips">
          {KINDS.map((k) => (
            <button
              key={k.id}
              className={`chip${kinds.has(k.id) ? " on" : ""}`}
              onClick={() => toggle(kinds, k.id, setKinds)}
            >
              {k.icon} {k.label}
              <span className="vault-count">{catalog?.counts.byKind[k.id] ?? 0}</span>
            </button>
          ))}
          <button className={`chip${bgOnly ? " on" : ""}`} onClick={() => setBgOnly(!bgOnly)}>
            ⛰ Backgrounds
          </button>
        </div>

        <div className="section-title">Sources — the ecosystem</div>
        {sourceList.map((s) => (
          <label key={s.id} className="row">
            <input
              type="checkbox"
              checked={sources.has(s.id)}
              onChange={() => toggle(sources, s.id, setSources)}
            />
            <span
              className="dot"
              style={{ background: s.online ? "#7fd08a" : "#5a5f7a" }}
              title={s.online ? "online — folder reachable" : "offline — folder not on this machine"}
            />
            {s.label}
            <span className="vault-count">{s.count}</span>
          </label>
        ))}

        <div className="legend-note">
          Sources live in <span className="kbd">aether.assets.config.json</span> — add any app or
          folder there and re-sync to pull copies of its assets in. Last sync: {syncedAt}.
        </div>
        <button className="btn" style={{ marginTop: 10, width: "100%" }} onClick={runSync} disabled={syncing}>
          {syncing ? "syncing…" : "⟳ Sync sources"}
        </button>
        {syncNote && <p className="forge-hint">{syncNote}</p>}
      </aside>

      {/* ── middle: the grid ───────────────────────────── */}
      <section className="vault-main">
        <div className="vault-toolbar">
          <span>
            {filtered.length} of {assets.length} assets
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="empty" style={{ padding: 24 }}>
            Nothing here yet. Run <span className="kbd">npm run assets:sync</span> on your Mac to
            pull assets in from every app and folder in{" "}
            <span className="kbd">aether.assets.config.json</span> — or forge something new on the
            right.
          </p>
        ) : (
          <div className="vault-grid">
            {filtered.map((a) => (
              <button
                key={a.id}
                className={`vcard${selectedId === a.id ? " on" : ""}${a.available ? "" : " off"}`}
                onClick={() => setSelectedId(a.id === selectedId ? null : a.id)}
                title={a.name}
              >
                <div className="vcard-thumb">
                  {a.url && (a.kind === "2d" || a.kind === "vector") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} loading="lazy" />
                  ) : a.url && a.kind === "video" ? (
                    <video src={a.url} muted loop playsInline />
                  ) : (
                    <span className="vcard-icon">{KIND_ICON[a.kind] ?? "▦"}</span>
                  )}
                  {a.generated && <span className="vcard-forged">⚒</span>}
                </div>
                <div className="vcard-name">{a.name}</div>
                <div className="vcard-meta">
                  <span className="dot" style={{ background: realmHex(a.realm) }} />
                  {a.kind}
                  {a.role === "background" ? " · bg" : ""} · {a.sourceLabel}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── right: inspector + forge ───────────────────── */}
      <aside className="panel right vault-side">
        {selected ? (
          <div className="vault-inspect">
            <div className="vault-inspect-thumb">
              {selected.url && (selected.kind === "2d" || selected.kind === "vector") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} alt={selected.name} />
              ) : selected.url && selected.kind === "video" ? (
                <video src={selected.url} controls muted loop playsInline />
              ) : selected.url && selected.kind === "audio" ? (
                <audio src={selected.url} controls />
              ) : (
                <span className="vcard-icon big">{KIND_ICON[selected.kind] ?? "▦"}</span>
              )}
            </div>
            <h3 style={{ margin: "10px 0 2px" }}>{selected.name}</h3>
            <p className="meta">
              {selected.kind} · {selected.role} ·{" "}
              <span style={{ color: realmHex(selected.realm) }}>{selected.realm}</span> ·{" "}
              {formatBytes(selected.bytes)}
            </p>
            <p className="meta">from {selected.sourceLabel}</p>
            {selected.prompt && <p className="meta">“{selected.prompt}”</p>}
            <p
              className="vault-origin"
              title="copy origin path"
              onClick={() => navigator.clipboard?.writeText(selected.origin)}
            >
              {selected.origin}
            </p>
            {selected.tags.length > 0 && (
              <div className="tags">
                {selected.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="vault-inspect-actions">
              <button className="btn primary" onClick={() => setForgeRef(selected)}>
                ⚒ Use in Forge
              </button>
              {selected.url && (
                <a className="btn" href={selected.url} download={`${selected.name}.${selected.ext}`}>
                  ⬇ Download
                </a>
              )}
            </div>
            {!selected.available && (
              <p className="forge-hint">
                Copy not on this machine — re-run the sync where “{selected.sourceLabel}” lives.
              </p>
            )}
          </div>
        ) : (
          <p className="empty">
            Select an asset to inspect it — its origin app, path, tags, and lineage — then send it
            to the Forge below to tweak or regenerate it.
          </p>
        )}

        <ForgePanel
          reference={forgeRef}
          onClearReference={() => setForgeRef(null)}
          onSaved={reload}
        />
      </aside>
    </div>
  );
}
