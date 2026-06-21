mod mash;

use mash::{MashConfig, MashState};

/// Begin (or re-configure) a mash session. The dashboard passes the program as
/// `cfg`; the engine drives real keystrokes via the OS (Tier 1).
#[tauri::command]
fn start_mash(cfg: MashConfig, state: tauri::State<MashState>) {
    mash::start(&state, cfg);
}

/// Stop mashing; returns total presses this session.
#[tauri::command]
fn stop_mash(state: tauri::State<MashState>) -> u64 {
    mash::stop(&state)
}

/// Live press counter (the dashboard can poll this to reconcile its UI).
#[tauri::command]
fn mash_presses(state: tauri::State<MashState>) -> u64 {
    mash::presses(&state)
}

#[tauri::command]
fn mash_running(state: tauri::State<MashState>) -> bool {
    mash::is_running(&state)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(MashState::default())
        .invoke_handler(tauri::generate_handler![
            start_mash,
            stop_mash,
            mash_presses,
            mash_running
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ThirdThumb");
}
