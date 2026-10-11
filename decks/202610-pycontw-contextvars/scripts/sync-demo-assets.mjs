// The "No backend, just a tab" slide embeds the sample app live, so the browser
// has to fetch it, so it has to sit under `public/`. The sample itself lives in
// `samples/stlite-demo/`, and the slide quotes those same files with `<<<`.
// Copying at build time is what stops the code shown on the slide and the app
// running in the iframe from drifting apart. The copy is gitignored, and this
// script is the only thing that writes it.
import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(deckDir, "samples", "stlite-demo");
const target = join(deckDir, "public", "stlite-demo");

// Only what the page loads; the README is not for visitors.
const SERVED = ["stlite.html", "app.py"];

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await Promise.all(
  SERVED.map((name) => copyFile(join(source, name), join(target, name))),
);
