// Service worker that makes the decks viewable offline. scripts/build-service-worker.mjs copies it to dist/sw.js
// and writes the precache manifest that it imports: every file of the built site, grouped by deck, with a content hash.
//
// - The index page's files are cached when the service worker installs.
// - A deck's files are all cached the first time the deck is opened (and kept up to date on later visits to the site), so it can be presented offline afterwards.
// - Cached files are keyed by their content hash, so a deploy re-downloads only the files that changed,
//   and only for decks that were cached before.

importScripts("__SW_MANIFEST_URL__");

/** @type {{ root: Record<string, string>, decks: Record<string, Record<string, string>> }} */
const MANIFEST = self.__SW_MANIFEST;

const PRECACHE = "slides-precache";
const RUNTIME_CACHE = "slides-runtime";
// Cross-origin hosts the decks load fonts and scripts from; their responses are cached as they are used.
const RUNTIME_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"]);

/** path -> cache key, for every file in the manifest */
const cacheKeys = new Map();
for (const files of [MANIFEST.root, ...Object.values(MANIFEST.decks)]) {
  for (const [path, revision] of Object.entries(files))
    cacheKeys.set(path, `${path}?__sw_rev=${revision}`);
}

const deckOf = (pathname) => {
  const deck = pathname.split("/")[1] ?? "";
  return Object.hasOwn(MANIFEST.decks, deck) ? deck : null;
};

const keyOf = (request) => {
  const url = new URL(request.url);
  return url.pathname + url.search;
};

async function precache(files) {
  const cache = await caches.open(PRECACHE);
  const cached = new Set((await cache.keys()).map(keyOf));
  const queue = Object.keys(files).filter((path) => !cached.has(cacheKeys.get(path)));
  let failed = 0;
  // A few downloads at a time, so that caching a deck doesn't hold up the requests of the page being viewed.
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
      try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok)
          throw new Error(`${response.status} ${response.statusText}`);
        await cache.put(cacheKeys.get(path), response);
      } catch (error) {
        failed++;
        console.warn(`[sw] Failed to cache ${path}:`, error);
      }
    }
  }));
  if (failed)
    throw new Error(`[sw] Failed to cache ${failed} file(s)`);
}

const deckCaching = new Map();
function cacheDeck(deck) {
  if (!deckCaching.has(deck))
    deckCaching.set(deck, precache(MANIFEST.decks[deck]).finally(() => deckCaching.delete(deck)));
  return deckCaching.get(deck);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache(MANIFEST.root).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Each page posts "sync" once this service worker controls it (see the registration in scripts/build-service-worker.mjs).
self.addEventListener("message", (event) => {
  if (event.data !== "sync" || !(event.source instanceof WindowClient))
    return;
  event.waitUntil(sync(deckOf(new URL(event.source.url).pathname)));
});

// Drops the files that are no longer part of the site or have changed since they were cached,
// then caches the deck being viewed and brings the decks cached before up to date with the manifest.
async function sync(currentDeck) {
  const cache = await caches.open(PRECACHE);
  const requests = await cache.keys();
  const decks = new Set(requests.map((request) => deckOf(new URL(request.url).pathname)).filter(Boolean));
  if (currentDeck)
    decks.add(currentDeck);
  const validKeys = new Set(cacheKeys.values());
  await Promise.all(requests.filter((request) => !validKeys.has(keyOf(request))).map((request) => cache.delete(request)));
  const results = await Promise.allSettled([...decks].map(cacheDeck));
  for (const result of results) {
    if (result.status === "rejected")
      console.warn(result.reason);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET")
    return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (RUNTIME_HOSTS.has(url.hostname))
      event.respondWith(staleWhileRevalidate(event));
    return;
  }

  if (request.mode === "navigate") {
    // Each deck is a single-page app, so all of its routes (/<deck>/12, /<deck>/presenter/3, ...) render its index.html.
    const deck = deckOf(url.pathname);
    const entry = deck ? `/${deck}/index.html` : url.pathname === "/" ? "/index.html" : null;
    if (!entry)
      return;
    event.respondWith(networkFirst(request, cacheKeys.get(entry)));
    return;
  }

  const key = cacheKeys.get(url.pathname);
  if (key)
    event.respondWith(cacheFirst(request, key));
});

async function networkFirst(request, key) {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(key, { cacheName: PRECACHE });
    if (cached)
      return cached;
    throw error;
  }
}

async function cacheFirst(request, key) {
  const cached = await caches.match(key, { cacheName: PRECACHE });
  if (cached)
    return request.headers.has("range") ? rangeOf(cached, request.headers.get("range")) : cached;
  const response = await fetch(request);
  // Cache only complete responses, not the partial ones answering a Range request (e.g. for a video).
  if (response.status === 200) {
    const cache = await caches.open(PRECACHE);
    await cache.put(key, response.clone());
  }
  return response;
}

// Media elements request videos and audio in ranges, which some browsers (Safari) need answered with a 206.
async function rangeOf(response, header) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2]))
    return response;
  const blob = await response.blob();
  const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]) + 1, blob.size) : blob.size;
  if (start >= end)
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  const headers = new Headers(response.headers);
  headers.set("Content-Range", `bytes ${start}-${end - 1}/${blob.size}`);
  headers.set("Content-Length", String(end - start));
  return new Response(blob.slice(start, end), { status: 206, statusText: "Partial Content", headers });
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(event.request);
  const fetched = fetch(event.request).then(async (response) => {
    // Stylesheets linked without `crossorigin` come back opaque (status 0); they can still be cached.
    if (response.ok || response.type === "opaque")
      await cache.put(event.request, response.clone());
    return response;
  });
  if (cached) {
    event.waitUntil(fetched.catch(() => {}));
    return cached;
  }
  return fetched;
}
