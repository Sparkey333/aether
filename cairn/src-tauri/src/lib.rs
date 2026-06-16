//! Cairn — the shell.
//!
//! This is the *skin* over `cairn-core`. It owns the window, the senses that
//! feed the Ledger (a file-system watcher here; the clipboard is polled from
//! the webview), and the small set of commands the sidebar calls. None of the
//! invariant logic lives here — only wiring.

use std::path::PathBuf;
use std::sync::Mutex;

use cairn_core::{Draft, Kind, Moment, Status, Vault};
use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

// ---------------------------------------------------------------------------
// Settings & snapshots — what the sidebar reads
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Gateway {
    pub id: String,
    pub label: String,
    pub target: String,
    /// "url" | "path" | "app"
    pub kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchFolder {
    pub path: String,
    pub screenshots: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub familiar: Option<String>,
    pub lens: String,
    pub gateways: Vec<Gateway>,
    pub watch_folders: Vec<WatchFolder>,
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub moments: Vec<Moment>,
    pub can_undo: bool,
    pub can_redo: bool,
    pub settings: Settings,
}

// ---------------------------------------------------------------------------
// App state
// ---------------------------------------------------------------------------

pub struct AppState {
    vault: Mutex<Vault>,
    watcher: Mutex<Option<RecommendedWatcher>>,
    last_clip: Mutex<String>,
}

type CmdResult<T> = Result<T, String>;

fn home() -> PathBuf {
    std::env::var("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("."))
}

fn default_settings(device_id: String) -> Settings {
    let desktop = home().join("Desktop");
    Settings {
        familiar: None,
        lens: "default".into(),
        // One example gateway out to the sibling world; the keeper edits these.
        gateways: vec![Gateway {
            id: "aether".into(),
            label: "Aether · the Atlas".into(),
            target: "http://localhost:3000/atlas".into(),
            kind: "url".into(),
        }],
        watch_folders: vec![WatchFolder {
            path: desktop.to_string_lossy().to_string(),
            screenshots: true,
        }],
        device_id,
    }
}

fn load_settings(vault: &Vault) -> Settings {
    let device_id = vault.device_id().to_string();
    let mut s = default_settings(device_id);
    if let Ok(Some(f)) = vault.get_meta("familiar") {
        s.familiar = Some(f);
    }
    if let Ok(Some(l)) = vault.get_meta("lens") {
        s.lens = l;
    }
    if let Ok(Some(j)) = vault.get_meta("gateways") {
        if let Ok(g) = serde_json::from_str(&j) {
            s.gateways = g;
        }
    }
    if let Ok(Some(j)) = vault.get_meta("watch_folders") {
        if let Ok(w) = serde_json::from_str(&j) {
            s.watch_folders = w;
        }
    }
    s
}

fn snapshot(state: &AppState) -> CmdResult<Snapshot> {
    let vault = state.vault.lock().map_err(|e| e.to_string())?;
    Ok(Snapshot {
        moments: vault.recent(250).map_err(|e| e.to_string())?,
        can_undo: vault.can_undo(),
        can_redo: vault.can_redo(),
        settings: load_settings(&vault),
    })
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_snapshot(state: State<AppState>) -> CmdResult<Snapshot> {
    snapshot(&state)
}

#[tauri::command]
fn log_manual(
    summary: String,
    detail: Option<String>,
    as_task: bool,
    app: AppHandle,
    state: State<AppState>,
) -> CmdResult<Snapshot> {
    {
        let mut vault = state.vault.lock().map_err(|e| e.to_string())?;
        let mut draft = Draft::note(summary);
        draft.detail = detail;
        if as_task {
            draft.kind = Kind::Task;
            draft.status = Status::Open;
        }
        vault.log_manual(draft).map_err(|e| e.to_string())?;
    }
    let _ = app.emit("ledger://changed", ());
    snapshot(&state)
}

/// Called by the webview's clipboard poll. Dedupes against the last value so a
/// quiet clipboard stays quiet.
#[tauri::command]
fn ingest_clipboard(text: String, app: AppHandle, state: State<AppState>) -> CmdResult<Snapshot> {
    let trimmed = text.trim().to_string();
    if trimmed.is_empty() {
        return snapshot(&state);
    }
    {
        let mut last = state.last_clip.lock().map_err(|e| e.to_string())?;
        if *last == trimmed {
            return snapshot(&state);
        }
        *last = trimmed.clone();
    }
    {
        let vault = state.vault.lock().map_err(|e| e.to_string())?;
        let mut draft = Draft {
            kind: Kind::Clip,
            status: Status::Logged,
            summary: preview(&trimmed),
            detail: Some(trimmed.clone()),
            source: "clipboard".into(),
            payload_path: None,
            links: vec![],
        };
        // a copied URL is a little gift; tag it as a link so it's openable
        if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
            draft.kind = Kind::Link;
            draft.links = vec![trimmed.clone()];
        }
        vault.log_sense(draft).map_err(|e| e.to_string())?;
    }
    let _ = app.emit("ledger://changed", ());
    snapshot(&state)
}

#[tauri::command]
fn curate(id: String, status: Status, state: State<AppState>) -> CmdResult<Snapshot> {
    {
        let mut vault = state.vault.lock().map_err(|e| e.to_string())?;
        vault.curate(&id, status).map_err(|e| e.to_string())?;
    }
    snapshot(&state)
}

#[tauri::command]
fn undo(state: State<AppState>) -> CmdResult<Snapshot> {
    {
        let mut vault = state.vault.lock().map_err(|e| e.to_string())?;
        vault.undo().map_err(|e| e.to_string())?;
    }
    snapshot(&state)
}

#[tauri::command]
fn redo(state: State<AppState>) -> CmdResult<Snapshot> {
    {
        let mut vault = state.vault.lock().map_err(|e| e.to_string())?;
        vault.redo().map_err(|e| e.to_string())?;
    }
    snapshot(&state)
}

#[tauri::command]
fn set_familiar(id: String, state: State<AppState>) -> CmdResult<Snapshot> {
    {
        let vault = state.vault.lock().map_err(|e| e.to_string())?;
        vault.set_meta("familiar", &id).map_err(|e| e.to_string())?;
    }
    snapshot(&state)
}

#[tauri::command]
fn set_lens(level: String, state: State<AppState>) -> CmdResult<Snapshot> {
    {
        let vault = state.vault.lock().map_err(|e| e.to_string())?;
        vault.set_meta("lens", &level).map_err(|e| e.to_string())?;
    }
    snapshot(&state)
}

fn run_watcher(app: &AppHandle, state: &AppState) -> Result<(), String> {
    let folders: Vec<WatchFolder> = {
        let vault = state.vault.lock().map_err(|e| e.to_string())?;
        load_settings(&vault).watch_folders
    };

    let (tx, rx) = std::sync::mpsc::channel();
    let mut watcher =
        notify::recommended_watcher(move |res| {
            let _ = tx.send(res);
        })
        .map_err(|e| e.to_string())?;

    let folder_flags: Vec<(PathBuf, bool)> = folders
        .iter()
        .filter_map(|f| {
            let p = PathBuf::from(&f.path);
            if p.exists() {
                watcher.watch(&p, RecursiveMode::NonRecursive).ok()?;
                Some((p, f.screenshots))
            } else {
                None
            }
        })
        .collect();

    // Keep the watcher alive for the life of the app.
    *state.watcher.lock().map_err(|e| e.to_string())? = Some(watcher);

    let app = app.clone();
    std::thread::spawn(move || {
        for res in rx {
            let Ok(event) = res else { continue };
            // React to brand-new files only — the calm signal, not every byte.
            if !matches!(event.kind, EventKind::Create(_)) {
                continue;
            }
            for path in event.paths {
                let in_shot = folder_flags
                    .iter()
                    .any(|(folder, shots)| *shots && path.starts_with(folder));
                let Some(draft) = cairn_core::classify_fs_path(&path, in_shot) else {
                    continue;
                };
                if let Some(st) = app.try_state::<AppState>() {
                    if let Ok(vault) = st.vault.lock() {
                        let _ = vault.log_sense(draft);
                    }
                }
                let _ = app.emit("ledger://changed", ());
            }
        }
    });
    Ok(())
}

fn preview(text: &str) -> String {
    let first = text.lines().next().unwrap_or("").trim();
    let mut s: String = first.chars().take(80).collect();
    if first.chars().count() > 80 || text.lines().count() > 1 {
        s.push('…');
    }
    if s.is_empty() {
        s.push_str("(clipboard)");
    }
    s
}

fn vault_path(app: &AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| home().join(".cairn"));
    let _ = std::fs::create_dir_all(&dir);
    dir.join("cairn.sqlite")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let path = vault_path(app.handle());
            let vault = Vault::open(&path.to_string_lossy())
                .map_err(|e| format!("failed to open vault: {e}"))?;

            let state = AppState {
                vault: Mutex::new(vault),
                watcher: Mutex::new(None),
                last_clip: Mutex::new(String::new()),
            };
            app.manage(state);

            // Dock the sidebar to the right edge of the primary monitor.
            if let Some(win) = app.get_webview_window("main") {
                if let (Ok(Some(monitor)), Ok(size)) = (win.primary_monitor(), win.outer_size()) {
                    let ms = monitor.size();
                    let x = (ms.width as i32 - size.width as i32).max(0);
                    let _ = win.set_position(tauri::PhysicalPosition::new(x, 0));
                }
            }

            // Begin watching the configured folders for new files/screenshots.
            let handle = app.handle().clone();
            if let Some(st) = app.try_state::<AppState>() {
                if let Err(e) = run_watcher(&handle, st.inner()) {
                    log::warn!("watcher did not start: {e}");
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_snapshot,
            log_manual,
            ingest_clipboard,
            curate,
            undo,
            redo,
            set_familiar,
            set_lens,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Cairn");
}
