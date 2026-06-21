//! ThirdThumb — Tier-1 mash engine.
//!
//! A game only ever sees button *states*. Here we produce them in software by
//! synthesizing keystrokes on a timer, which drives any emulator (RetroArch,
//! mGBA, Citra/Lime3DS, …) through its own keybinds. A dedicated OS thread owns
//! the `Enigo` instance (it isn't `Send` on every platform), reads a shared
//! config, and loops until the `running` flag is cleared.

use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::Deserialize;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

/// One mash program, sent from the dashboard. Field names are snake_case so the
/// JS side can pass them through verbatim.
#[derive(Clone, Deserialize)]
pub struct MashConfig {
    pub a_key: String,       // emulator keybind mapped to "A" (e.g. "x")
    pub a_rate: f64,         // A presses per second
    pub b_key: String,       // emulator keybind mapped to "B" (e.g. "z")
    pub b_enabled: bool,
    pub b_every_sec: f64,    // tap B every N seconds (0 = off)
    pub move_enabled: bool,  // weave left/right (e.g. walking in grass)
    pub move_every_ms: f64,
    pub jitter: bool,        // humanize every interval with ±jitter
}

impl Default for MashConfig {
    fn default() -> Self {
        Self {
            a_key: "x".into(),
            a_rate: 4.0,
            b_key: "z".into(),
            b_enabled: true,
            b_every_sec: 2.0,
            move_enabled: true,
            move_every_ms: 450.0,
            jitter: true,
        }
    }
}

/// Shared engine state, owned by Tauri via `.manage(...)`.
#[derive(Default)]
pub struct MashState {
    running: Arc<AtomicBool>,
    config: Arc<Mutex<MashConfig>>,
    handle: Mutex<Option<JoinHandle<()>>>,
    presses: Arc<AtomicU64>,
}

/// Cheap pseudo-random in [0,1) from the system clock — enough to humanize
/// timing without pulling in an RNG crate (KISS).
fn rand01() -> f64 {
    let n = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or(0);
    (n % 100_000) as f64 / 100_000.0
}

fn jitter(ms: f64, on: bool) -> u64 {
    let v = if on { ms * (0.82 + rand01() * 0.36) } else { ms };
    v.max(1.0) as u64
}

fn key_from(s: &str) -> Key {
    match s.trim().to_lowercase().as_str() {
        "left" => Key::LeftArrow,
        "right" => Key::RightArrow,
        "up" => Key::UpArrow,
        "down" => Key::DownArrow,
        "space" => Key::Space,
        "enter" | "return" => Key::Return,
        other => Key::Unicode(other.chars().next().unwrap_or('x')),
    }
}

/// Start (or re-configure) mashing. Idempotent: a second call while running just
/// swaps in the new config.
pub fn start(state: &MashState, cfg: MashConfig) {
    *state.config.lock().unwrap() = cfg;
    // If already running, the live config update above is all we need.
    if state.running.swap(true, Ordering::SeqCst) {
        return;
    }
    state.presses.store(0, Ordering::Relaxed);

    let running = state.running.clone();
    let config = state.config.clone();
    let presses = state.presses.clone();

    let handle = thread::spawn(move || {
        let mut enigo = match Enigo::new(&Settings::default()) {
            Ok(e) => e,
            Err(_) => {
                running.store(false, Ordering::SeqCst);
                return;
            }
        };
        let start = Instant::now();
        let (mut next_a, mut next_b, mut next_move) = (start, start, start);
        let weave = [Key::LeftArrow, Key::RightArrow];
        let mut weave_i = 0usize;

        while running.load(Ordering::SeqCst) {
            let c = config.lock().unwrap().clone();
            let now = Instant::now();

            if now >= next_a {
                let _ = enigo.key(key_from(&c.a_key), Direction::Click);
                presses.fetch_add(1, Ordering::Relaxed);
                next_a = now + Duration::from_millis(jitter(1000.0 / c.a_rate.max(0.1), c.jitter));
            }
            if c.b_enabled && c.b_every_sec > 0.0 && now >= next_b {
                let _ = enigo.key(key_from(&c.b_key), Direction::Click);
                presses.fetch_add(1, Ordering::Relaxed);
                next_b = now + Duration::from_millis(jitter(c.b_every_sec * 1000.0, c.jitter));
            }
            if c.move_enabled && now >= next_move {
                let _ = enigo.key(weave[weave_i % 2], Direction::Click);
                weave_i += 1;
                presses.fetch_add(1, Ordering::Relaxed);
                next_move = now + Duration::from_millis(jitter(c.move_every_ms, c.jitter));
            }

            thread::sleep(Duration::from_millis(4));
        }
    });

    *state.handle.lock().unwrap() = Some(handle);
}

/// Stop mashing and return the number of presses this session.
pub fn stop(state: &MashState) -> u64 {
    state.running.store(false, Ordering::SeqCst);
    if let Some(h) = state.handle.lock().unwrap().take() {
        let _ = h.join();
    }
    state.presses.load(Ordering::Relaxed)
}

pub fn presses(state: &MashState) -> u64 {
    state.presses.load(Ordering::Relaxed)
}

pub fn is_running(state: &MashState) -> bool {
    state.running.load(Ordering::SeqCst)
}
