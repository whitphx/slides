// Adds the service worker that makes the decks viewable offline (scripts/service-worker.js) to the built site:
// writes dist/sw.js and its precache manifest, and registers it from every deck's and the index page's index.html.
//
// Usage: node scripts/build-service-worker.mjs [distDir]

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import process from "node:process";

const distDir = process.argv[2] ?? "dist";
const swSource = new URL("./service-worker.js", import.meta.url);

// Files the hosting platform reads rather than serves.
const IGNORED = new Set(["_headers", "_redirects", "404.html"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory())
      yield* walk(path);
    else if (entry.isFile())
      yield path;
  }
}

// The URL path a file is served at, percent-encoded the same way the browser's URL parser does.
const urlPathOf = (file) => new URL(
  "/" + relative(distDir, file).split(sep).map((segment) => segment.replace(/[%#?\\]/g, encodeURIComponent)).join("/"),
  "https://example.com",
).pathname;

const revisionOf = async (file) => createHash("sha256").update(await readFile(file)).digest("hex").slice(0, 16);

// Once the service worker controls the page, it's asked to cache the deck being viewed (see "sync" in scripts/service-worker.js).
const registration = `<script>if("serviceWorker" in navigator){const s=navigator.serviceWorker,sync=()=>s.controller?.postMessage("sync");addEventListener("load",()=>s.register("/sw.js"));s.addEventListener("controllerchange",sync);s.ready.then(sync)}</script>`;

async function injectRegistration(htmlFile) {
  const html = await readFile(htmlFile, "utf8");
  if (html.includes(registration))
    return;
  if (!html.includes("</head>"))
    throw new Error(`No </head> in ${htmlFile}`);
  await writeFile(htmlFile, html.replace("</head>", `${registration}</head>`));
}

const decks = (await readdir(distDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
  .map((entry) => entry.name);
const deckSet = new Set();
for (const deck of decks) {
  try {
    await injectRegistration(join(distDir, deck, "index.html"));
    deckSet.add(deck);
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
  }
}
await injectRegistration(join(distDir, "index.html"));

const manifest = { root: {}, decks: Object.fromEntries([...deckSet].sort().map((deck) => [deck, {}])) };
for await (const file of walk(distDir)) {
  const path = relative(distDir, file).split(sep);
  if (IGNORED.has(path.at(-1)) || (path.length === 1 && /^sw(-manifest-.*)?\.js$/.test(path[0])))
    continue;
  const files = path.length > 1 && deckSet.has(path[0]) ? manifest.decks[path[0]] : manifest.root;
  files[urlPathOf(file)] = await revisionOf(file);
}

const manifestSource = `self.__SW_MANIFEST = ${JSON.stringify(manifest)};\n`;
const manifestFile = `sw-manifest-${createHash("sha256").update(manifestSource).digest("hex").slice(0, 16)}.js`;
await writeFile(join(distDir, manifestFile), manifestSource);
const sw = (await readFile(swSource, "utf8")).replace("__SW_MANIFEST_URL__", `/${manifestFile}`);
await writeFile(join(distDir, "sw.js"), sw);

const fileCount = Object.keys(manifest.root).length + Object.values(manifest.decks).reduce((n, files) => n + Object.keys(files).length, 0);
console.log(`Wrote ${join(distDir, "sw.js")} with ${deckSet.size} decks and ${fileCount} files in ${manifestFile}`);
