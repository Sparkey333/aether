// "What did you just do?" — the manual sense. Plus the Lens: one dial for how
// much the familiar says, from a whisper to step-by-step.

import { useState } from "react";
import type { LensLevel } from "../types";

const LENSES: { id: LensLevel; label: string; hint: string }[] = [
  { id: "whisper", label: "whisper", hint: "barely there — just the thing" },
  { id: "default", label: "default", hint: "a gentle line about each step" },
  { id: "verbose", label: "verbose", hint: "the line plus the detail" },
];

export function Composer({
  lens,
  onLens,
  onSubmit,
}: {
  lens: LensLevel;
  onLens: (l: LensLevel) => void;
  onSubmit: (summary: string, asTask: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [asTask, setAsTask] = useState(false);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t, asTask);
    setText("");
  };

  return (
    <div className="composer">
      <div className="lens" role="tablist" aria-label="Lens — reminder grain">
        {LENSES.map((l) => (
          <button
            key={l.id}
            role="tab"
            aria-selected={lens === l.id}
            className={lens === l.id ? "on" : ""}
            title={l.hint}
            onClick={() => onLens(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="compose-row">
        <input
          value={text}
          placeholder={asTask ? "what's next to do?" : "what did you just do?"}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="send" onClick={submit} aria-label="add">
          ↵
        </button>
      </div>

      <label className="astask">
        <input type="checkbox" checked={asTask} onChange={(e) => setAsTask(e.target.checked)} />
        keep as a to-do
      </label>
    </div>
  );
}
