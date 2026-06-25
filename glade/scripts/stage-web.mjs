// Stages the self-contained game into ./dist as the Tauri frontend root.
// Keeps glade/index.html as the canonical, directly-openable file while giving
// Tauri a clean folder that contains ONLY the web assets (no md, no src-tauri).
import { mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "dist"), { recursive: true });
copyFileSync(join(root, "index.html"), join(root, "dist", "index.html"));
console.log("staged → glade/dist/index.html");
