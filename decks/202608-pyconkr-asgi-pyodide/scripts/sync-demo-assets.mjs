// The Stlite slide embeds the sample app live, so the browser has to fetch it,
// so it has to sit under `public/`. The sample itself lives in
// `samples/streamlit-demo/` next to the pyproject and lockfile that run its
// Streamlit original, and the slide quotes that same `stlite.html` with `<<<`.
// Copying at build time is what stops the code shown on the slide and the app
// running in the iframe from drifting apart. The copy is gitignored, and this
// script is the only thing that writes it.
import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(deckDir, "samples", "streamlit-demo");
const target = join(deckDir, "public", "stlite-demo");

// Only what the page loads. The pyproject and the lockfile describe how to run
// the Streamlit original and have no business being served to a visitor.
const SERVED = ["stlite.html", "app.py", "data.py"];

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await Promise.all(
  SERVED.map((name) => copyFile(join(source, name), join(target, name))),
);
