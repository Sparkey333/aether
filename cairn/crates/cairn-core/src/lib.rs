//! # cairn-core — the bones
//!
//! This crate is the part of Cairn we **always preserve**. It has no window, no
//! character, no platform code — just the invariant ideas:
//!
//! - **The Ledger**: an append-only stream of [`Moment`]s. The record-keeper.
//! - **The Vault**: local-first storage of that stream (SQLite), plus an
//!   **oplog** that is the spine future cross-device sync will ride on.
//! - **Undo/Redo**: governs your *curation* (completing, dismissing, noting),
//!   never the raw facts of what you did. Copies and screenshots are immutable
//!   truth; how you *organize* them is reversible. See [`Vault::undo`].
//! - **The Senses → classification**: [`classify_fs_path`] turns a file-system
//!   event into a [`Moment`] with the right [`Kind`]. Pure and testable.
//!
//! Everything above is exercised by the test suite at the bottom of this file,
//! which runs on any platform with a C compiler (no GUI libraries required).

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::Path;

// ---------------------------------------------------------------------------
// The vocabulary of a Moment
// ---------------------------------------------------------------------------

/// What *kind* of thing happened. Kept deliberately small — find the feel, not
/// a thousand options.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Create,
    Save,
    Edit,
    Clip,       // a copy (text or image) lifted to the clipboard
    Paste,
    Screenshot,
    Move,
    Task,       // something to do next
    Note,       // a plain human note ("I just did X")
    Link,       // a gateway to another app/folder/project
}

impl Kind {
    fn as_db(self) -> &'static str {
        match self {
            Kind::Create => "create",
            Kind::Save => "save",
            Kind::Edit => "edit",
            Kind::Clip => "clip",
            Kind::Paste => "paste",
            Kind::Screenshot => "screenshot",
            Kind::Move => "move",
            Kind::Task => "task",
            Kind::Note => "note",
            Kind::Link => "link",
        }
    }
    fn from_db(s: &str) -> Kind {
        match s {
            "create" => Kind::Create,
            "save" => Kind::Save,
            "edit" => Kind::Edit,
            "clip" => Kind::Clip,
            "paste" => Kind::Paste,
            "screenshot" => Kind::Screenshot,
            "move" => Kind::Move,
            "task" => Kind::Task,
            "link" => Kind::Link,
            _ => Kind::Note,
        }
    }
}

/// The reversible *state* of a Moment. This — not the fact of the Moment — is
/// what undo/redo moves.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Logged,    // a recorded fact, sitting in the stream
    Open,      // promoted to a thing to do
    Done,      // finished
    Dismissed, // waved away
}

impl Status {
    fn as_db(self) -> &'static str {
        match self {
            Status::Logged => "logged",
            Status::Open => "open",
            Status::Done => "done",
            Status::Dismissed => "dismissed",
        }
    }
    fn from_db(s: &str) -> Status {
        match s {
            "open" => Status::Open,
            "done" => Status::Done,
            "dismissed" => Status::Dismissed,
            _ => Status::Logged,
        }
    }
}

/// One entry in the Ledger.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Moment {
    pub id: String,
    pub ts: i64, // epoch millis
    pub kind: Kind,
    pub status: Status,
    pub summary: String,
    pub detail: Option<String>,
    pub source: String, // "clipboard" | "fs" | "manual" | "gateway" ...
    pub payload_path: Option<String>,
    pub links: Vec<String>,
    pub undoable: bool,
    pub device_id: String,
}

/// A draft Moment before it has an id / device stamp — what a Sense produces.
#[derive(Debug, Clone)]
pub struct Draft {
    pub kind: Kind,
    pub status: Status,
    pub summary: String,
    pub detail: Option<String>,
    pub source: String,
    pub payload_path: Option<String>,
    pub links: Vec<String>,
}

impl Draft {
    pub fn note(summary: impl Into<String>) -> Draft {
        Draft {
            kind: Kind::Note,
            status: Status::Logged,
            summary: summary.into(),
            detail: None,
            source: "manual".into(),
            payload_path: None,
            links: vec![],
        }
    }
}

// ---------------------------------------------------------------------------
// Undo/redo operations — small, involutive state-setters
// ---------------------------------------------------------------------------

/// The only reversible operations. Each one is its own inverse's inverse, so
/// the undo/redo stacks stay honest no matter how deep you go.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase")]
pub enum Op {
    SetStatus {
        id: String,
        value: Status,
        prev: Status,
    },
    SetRemoved {
        id: String,
        value: bool,
        prev: bool,
    },
}

impl Op {
    fn invert(&self) -> Op {
        match self {
            Op::SetStatus { id, value, prev } => Op::SetStatus {
                id: id.clone(),
                value: *prev,
                prev: *value,
            },
            Op::SetRemoved { id, value, prev } => Op::SetRemoved {
                id: id.clone(),
                value: *prev,
                prev: *value,
            },
        }
    }

    fn apply(&self, conn: &Connection) -> rusqlite::Result<()> {
        match self {
            Op::SetStatus { id, value, .. } => {
                conn.execute(
                    "UPDATE moments SET status = ?1 WHERE id = ?2",
                    params![value.as_db(), id],
                )?;
            }
            Op::SetRemoved { id, value, .. } => {
                conn.execute(
                    "UPDATE moments SET removed = ?1 WHERE id = ?2",
                    params![*value as i64, id],
                )?;
            }
        }
        Ok(())
    }

    fn target_id(&self) -> &str {
        match self {
            Op::SetStatus { id, .. } => id,
            Op::SetRemoved { id, .. } => id,
        }
    }
}

// ---------------------------------------------------------------------------
// The Vault
// ---------------------------------------------------------------------------

pub struct Vault {
    conn: Connection,
    device_id: String,
    undo_stack: Vec<Op>,
    redo_stack: Vec<Op>,
}

/// What a curation/undo/redo call hands back to the shell so the sidebar can
/// repaint without a full reload.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Change {
    pub moment: Option<Moment>,
    pub can_undo: bool,
    pub can_redo: bool,
}

impl Vault {
    /// Open (or create) the Vault at `path`. Pass `":memory:"` for tests.
    pub fn open(path: &str) -> rusqlite::Result<Vault> {
        let conn = Connection::open(path)?;
        conn.execute_batch(SCHEMA)?;
        let device_id = Self::ensure_device_id(&conn)?;
        Ok(Vault {
            conn,
            device_id,
            undo_stack: vec![],
            redo_stack: vec![],
        })
    }

    pub fn device_id(&self) -> &str {
        &self.device_id
    }

    fn ensure_device_id(conn: &Connection) -> rusqlite::Result<String> {
        if let Some(v) = Self::meta_get(conn, "device_id")? {
            return Ok(v);
        }
        // Probabilistically-unique without pulling in a uuid crate; a real
        // device id arrives with the sync layer.
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        let id = format!("dev-{:x}", nanos);
        Self::meta_set(conn, "device_id", &id)?;
        Ok(id)
    }

    // --- meta (chosen familiar, lens level, watched folders, gateways) ------

    fn meta_get(conn: &Connection, key: &str) -> rusqlite::Result<Option<String>> {
        let mut stmt = conn.prepare("SELECT v FROM meta WHERE k = ?1")?;
        let mut rows = stmt.query(params![key])?;
        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    fn meta_set(conn: &Connection, key: &str, value: &str) -> rusqlite::Result<()> {
        conn.execute(
            "INSERT INTO meta (k, v) VALUES (?1, ?2)
             ON CONFLICT(k) DO UPDATE SET v = excluded.v",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_meta(&self, key: &str) -> rusqlite::Result<Option<String>> {
        Self::meta_get(&self.conn, key)
    }

    pub fn set_meta(&self, key: &str, value: &str) -> rusqlite::Result<()> {
        Self::meta_set(&self.conn, key, value)
    }

    // --- writing to the Ledger ---------------------------------------------

    /// Record a fact from a Sense (clipboard, screenshot, file save). Facts are
    /// **not** undoable — you can't un-copy something. They simply accrue.
    pub fn log_sense(&self, draft: Draft) -> rusqlite::Result<Moment> {
        self.insert(draft, false)
    }

    /// Record a deliberate human entry ("I just did X", or a new task). This is
    /// undoable: Cmd+Z hides it again.
    pub fn log_manual(&mut self, draft: Draft) -> rusqlite::Result<Moment> {
        let m = self.insert(draft, true)?;
        // The forward op that just happened, conceptually, is "made visible".
        let forward = Op::SetRemoved {
            id: m.id.clone(),
            value: false,
            prev: true,
        };
        self.record(forward)?;
        Ok(m)
    }

    fn insert(&self, draft: Draft, undoable: bool) -> rusqlite::Result<Moment> {
        let ts = now_millis();
        let links = serde_json::to_string(&draft.links).unwrap_or_else(|_| "[]".into());
        self.conn.execute(
            "INSERT INTO moments
               (ts, kind, status, summary, detail, source, payload_path, links, undoable, removed, device_id)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,0,?10)",
            params![
                ts,
                draft.kind.as_db(),
                draft.status.as_db(),
                draft.summary,
                draft.detail,
                draft.source,
                draft.payload_path,
                links,
                undoable as i64,
                self.device_id,
            ],
        )?;
        let seq = self.conn.last_insert_rowid();
        let id = format!("m{seq}");
        // Stamp the human-facing id onto the row.
        self.conn
            .execute("UPDATE moments SET id = ?1 WHERE seq = ?2", params![id, seq])?;
        self.moment_by_id(&id)
            .map(|o| o.expect("row we just inserted"))
    }

    // --- curation (the reversible part) ------------------------------------

    /// Move a Moment to a new [`Status`] — promote a clip into a task, mark a
    /// task done, dismiss a nudge. Reversible.
    pub fn curate(&mut self, id: &str, next: Status) -> rusqlite::Result<Change> {
        let current = match self.moment_by_id(id)? {
            Some(m) => m,
            None => {
                return Ok(Change {
                    moment: None,
                    can_undo: self.can_undo(),
                    can_redo: self.can_redo(),
                })
            }
        };
        let op = Op::SetStatus {
            id: id.to_string(),
            value: next,
            prev: current.status,
        };
        op.apply(&self.conn)?;
        self.record(op)?;
        Ok(Change {
            moment: self.moment_by_id(id)?,
            can_undo: self.can_undo(),
            can_redo: self.can_redo(),
        })
    }

    /// Apply a freshly-performed op: persist it to the oplog (the sync spine),
    /// push its inverse onto the undo stack, and clear the redo stack.
    fn record(&mut self, forward: Op) -> rusqlite::Result<()> {
        self.persist_op(&forward, "do")?;
        self.undo_stack.push(forward.invert());
        self.redo_stack.clear();
        Ok(())
    }

    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }
    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }

    /// Step one curation backward.
    pub fn undo(&mut self) -> rusqlite::Result<Change> {
        if let Some(inv) = self.undo_stack.pop() {
            inv.apply(&self.conn)?;
            self.persist_op(&inv, "undo")?;
            let id = inv.target_id().to_string();
            self.redo_stack.push(inv.invert());
            return Ok(Change {
                moment: self.moment_by_id(&id)?,
                can_undo: self.can_undo(),
                can_redo: self.can_redo(),
            });
        }
        Ok(Change {
            moment: None,
            can_undo: false,
            can_redo: self.can_redo(),
        })
    }

    /// Step one curation forward again.
    pub fn redo(&mut self) -> rusqlite::Result<Change> {
        if let Some(op) = self.redo_stack.pop() {
            op.apply(&self.conn)?;
            self.persist_op(&op, "redo")?;
            let id = op.target_id().to_string();
            self.undo_stack.push(op.invert());
            return Ok(Change {
                moment: self.moment_by_id(&id)?,
                can_undo: self.can_undo(),
                can_redo: self.can_redo(),
            });
        }
        Ok(Change {
            moment: None,
            can_undo: self.can_undo(),
            can_redo: false,
        })
    }

    fn persist_op(&self, op: &Op, direction: &str) -> rusqlite::Result<()> {
        let body = serde_json::to_string(op).unwrap_or_else(|_| "{}".into());
        self.conn.execute(
            "INSERT INTO oplog (ts, device_id, direction, body) VALUES (?1,?2,?3,?4)",
            params![now_millis(), self.device_id, direction, body],
        )?;
        Ok(())
    }

    // --- reading ------------------------------------------------------------

    /// The most recent `limit` visible Moments, newest first.
    pub fn recent(&self, limit: i64) -> rusqlite::Result<Vec<Moment>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, ts, kind, status, summary, detail, source, payload_path, links, undoable, device_id
               FROM moments WHERE removed = 0
               ORDER BY seq DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit], Self::row_to_moment)?;
        rows.collect()
    }

    pub fn moment_by_id(&self, id: &str) -> rusqlite::Result<Option<Moment>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, ts, kind, status, summary, detail, source, payload_path, links, undoable, device_id
               FROM moments WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id])?;
        match rows.next()? {
            Some(row) => Ok(Some(Self::row_to_moment(row)?)),
            None => Ok(None),
        }
    }

    fn row_to_moment(row: &rusqlite::Row) -> rusqlite::Result<Moment> {
        let kind: String = row.get(2)?;
        let status: String = row.get(3)?;
        let links_json: String = row.get(8)?;
        let undoable: i64 = row.get(9)?;
        Ok(Moment {
            id: row.get(0)?,
            ts: row.get(1)?,
            kind: Kind::from_db(&kind),
            status: Status::from_db(&status),
            summary: row.get(4)?,
            detail: row.get(5)?,
            source: row.get(6)?,
            payload_path: row.get(7)?,
            links: serde_json::from_str(&links_json).unwrap_or_default(),
            undoable: undoable != 0,
            device_id: row.get(10)?,
        })
    }

    /// How many facts have accrued (visible, all kinds). Handy for the
    /// familiar's gentle running tallies ("your 4th save today").
    pub fn count_today(&self, kind: Kind, since_ts: i64) -> rusqlite::Result<i64> {
        let n: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM moments WHERE removed = 0 AND kind = ?1 AND ts >= ?2",
            params![kind.as_db(), since_ts],
            |r| r.get(0),
        )?;
        Ok(n)
    }
}

// ---------------------------------------------------------------------------
// The Senses: turning a file-system path into a Moment
// ---------------------------------------------------------------------------

const IMAGE_EXTS: &[&str] = &["png", "jpg", "jpeg", "gif", "webp", "heic", "tiff", "bmp"];

/// Pure classification: given a path that was just created/changed, decide what
/// kind of Moment it is. Returns `None` for paths we deliberately ignore
/// (hidden/temp files), so the Ledger stays calm, not noisy.
pub fn classify_fs_path(path: &Path, in_screenshot_dir: bool) -> Option<Draft> {
    let name = path.file_name()?.to_string_lossy().to_string();

    // Ignore the noise: dotfiles, temp/partial writes, lockfiles.
    if name.starts_with('.')
        || name.ends_with('~')
        || name.ends_with(".tmp")
        || name.ends_with(".crdownload")
        || name.ends_with(".part")
    {
        return None;
    }

    let ext = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let is_image = IMAGE_EXTS.contains(&ext.as_str());
    let lower = name.to_lowercase();
    let looks_like_screenshot = lower.starts_with("screenshot")
        || lower.starts_with("screen shot")
        || lower.starts_with("cleanshot");

    let full = path.to_string_lossy().to_string();

    if is_image && (in_screenshot_dir || looks_like_screenshot) {
        return Some(Draft {
            kind: Kind::Screenshot,
            status: Status::Logged,
            summary: name,
            detail: Some(full.clone()),
            source: "fs".into(),
            payload_path: Some(full),
            links: vec![],
        });
    }

    Some(Draft {
        kind: Kind::Save,
        status: Status::Logged,
        summary: name,
        detail: Some(full.clone()),
        source: "fs".into(),
        payload_path: if is_image { Some(full) } else { None },
        links: vec![],
    })
}

fn now_millis() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS moments (
    seq         INTEGER PRIMARY KEY AUTOINCREMENT,
    id          TEXT,
    ts          INTEGER NOT NULL,
    kind        TEXT NOT NULL,
    status      TEXT NOT NULL,
    summary     TEXT NOT NULL,
    detail      TEXT,
    source      TEXT NOT NULL,
    payload_path TEXT,
    links       TEXT NOT NULL DEFAULT '[]',
    undoable    INTEGER NOT NULL DEFAULT 0,
    removed     INTEGER NOT NULL DEFAULT 0,
    device_id   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_moments_seq ON moments(seq);
CREATE UNIQUE INDEX IF NOT EXISTS idx_moments_id ON moments(id);

CREATE TABLE IF NOT EXISTS meta (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL
);

-- The sync spine. Round 1 only appends here; cross-device undo replays it later.
CREATE TABLE IF NOT EXISTS oplog (
    seq       INTEGER PRIMARY KEY AUTOINCREMENT,
    ts        INTEGER NOT NULL,
    device_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    body      TEXT NOT NULL
);
"#;

// ===========================================================================
// Tests — these run here, on Linux, no GUI required.
// ===========================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn vault() -> Vault {
        Vault::open(":memory:").expect("open in-memory vault")
    }

    #[test]
    fn logs_a_sense_fact_and_reads_it_back() {
        let v = vault();
        let m = v
            .log_sense(Draft {
                kind: Kind::Clip,
                status: Status::Logged,
                summary: "copied a URL".into(),
                detail: Some("https://example.com".into()),
                source: "clipboard".into(),
                payload_path: None,
                links: vec![],
            })
            .unwrap();
        assert_eq!(m.id, "m1");
        assert_eq!(m.kind, Kind::Clip);
        assert!(!m.undoable);

        let recent = v.recent(10).unwrap();
        assert_eq!(recent.len(), 1);
        assert_eq!(recent[0].summary, "copied a URL");
    }

    #[test]
    fn senses_are_not_undoable() {
        let mut v = vault();
        v.log_sense(Draft {
            kind: Kind::Screenshot,
            status: Status::Logged,
            summary: "Screenshot 1.png".into(),
            detail: None,
            source: "fs".into(),
            payload_path: None,
            links: vec![],
        })
        .unwrap();
        // No curation happened, so there is nothing to undo.
        assert!(!v.can_undo());
        let ch = v.undo().unwrap();
        assert!(ch.moment.is_none());
    }

    #[test]
    fn curation_round_trips_through_undo_and_redo() {
        let mut v = vault();
        let m = v.log_sense(Draft::note("draft-3.md")).unwrap();

        // Promote the note into a task, then complete it.
        v.curate(&m.id, Status::Open).unwrap();
        let ch = v.curate(&m.id, Status::Done).unwrap();
        assert_eq!(ch.moment.unwrap().status, Status::Done);
        assert!(ch.can_undo);
        assert!(!ch.can_redo);

        // Undo the completion -> back to Open.
        let ch = v.undo().unwrap();
        assert_eq!(ch.moment.unwrap().status, Status::Open);
        assert!(ch.can_redo);

        // Undo the promotion -> back to Logged.
        let ch = v.undo().unwrap();
        assert_eq!(ch.moment.unwrap().status, Status::Logged);

        // Redo both, ending Done again.
        v.redo().unwrap();
        let ch = v.redo().unwrap();
        assert_eq!(ch.moment.unwrap().status, Status::Done);
        assert!(!ch.can_redo);
    }

    #[test]
    fn manual_entry_is_undoable_and_hides_on_undo() {
        let mut v = vault();
        let m = v.log_manual(Draft::note("I just wired the Ledger")).unwrap();
        assert_eq!(v.recent(10).unwrap().len(), 1);
        assert!(v.can_undo());

        // Undo the manual add -> it disappears from the visible stream.
        v.undo().unwrap();
        assert_eq!(v.recent(10).unwrap().len(), 0);

        // Redo -> it returns.
        v.redo().unwrap();
        assert_eq!(v.recent(10).unwrap().len(), 1);
        assert_eq!(v.recent(10).unwrap()[0].id, m.id);
    }

    #[test]
    fn a_new_action_clears_the_redo_branch() {
        let mut v = vault();
        let m = v.log_sense(Draft::note("x")).unwrap();
        v.curate(&m.id, Status::Open).unwrap();
        v.undo().unwrap(); // redo now available
        assert!(v.can_redo());
        v.curate(&m.id, Status::Dismissed).unwrap(); // a fresh action
        assert!(!v.can_redo()); // the old redo branch is gone
    }

    #[test]
    fn meta_persists_choice_of_familiar_and_lens() {
        let v = vault();
        v.set_meta("familiar", "vane").unwrap();
        v.set_meta("lens", "default").unwrap();
        assert_eq!(v.get_meta("familiar").unwrap().as_deref(), Some("vane"));
        assert_eq!(v.get_meta("lens").unwrap().as_deref(), Some("default"));
        // device id is auto-created and stable
        assert!(v.device_id().starts_with("dev-"));
    }

    #[test]
    fn classifies_screenshots_files_and_ignores_noise() {
        let shot = classify_fs_path(Path::new("/Users/me/Desktop/Screenshot 2026-06-16.png"), true)
            .unwrap();
        assert_eq!(shot.kind, Kind::Screenshot);
        assert!(shot.payload_path.is_some());

        let doc = classify_fs_path(Path::new("/Users/me/Projects/notes.md"), false).unwrap();
        assert_eq!(doc.kind, Kind::Save);
        assert!(doc.payload_path.is_none());

        // image outside the screenshot dir is a saved file, but still previewable
        let img = classify_fs_path(Path::new("/Users/me/Projects/logo.png"), false).unwrap();
        assert_eq!(img.kind, Kind::Save);
        assert!(img.payload_path.is_some());

        assert!(classify_fs_path(Path::new("/Users/me/.DS_Store"), false).is_none());
        assert!(classify_fs_path(Path::new("/Users/me/file.tmp"), false).is_none());
    }

    #[test]
    fn counts_facts_since_a_cutoff() {
        let v = vault();
        for _ in 0..3 {
            v.log_sense(Draft {
                kind: Kind::Save,
                status: Status::Logged,
                summary: "f".into(),
                detail: None,
                source: "fs".into(),
                payload_path: None,
                links: vec![],
            })
            .unwrap();
        }
        assert_eq!(v.count_today(Kind::Save, 0).unwrap(), 3);
        assert_eq!(v.count_today(Kind::Clip, 0).unwrap(), 0);
    }
}
