# Implementation notes

Findings from building this sample that are worth knowing when presenting or modifying it.

## htmx 4 is load-bearing for step 2

Step 2 intercepts the app's HTTP traffic by handing htmx a custom `fetch()`-compatible function. That only works because htmx 4 issues its requests through the Fetch API: it resolves `window.fetch` at request time and exposes the per-request `ctx.fetch` slot, so one listener is the entire interception:

```js
document.body.addEventListener("htmx:before:request", (event) => {
  event.detail.ctx.fetch = asgiFetch;
});
```

htmx 2.x (the current stable line) issues requests through `XMLHttpRequest`, which a custom `fetch()` can never intercept. Doing this demo on htmx 2 would require mocking `XMLHttpRequest` or a Service Worker. See [The fetch()ening](https://htmx.org/essays/the-fetchening/) for the background. This repo pins `htmx.org@4.0.0-beta6`; when htmx 4 goes stable, only the CDN URL and SRI hash in `app/main.py` and `step2-browser/index.html` need updating.

## Endpoints must be `async def` on WASM runtimes

Starlette runs sync (`def`) endpoints in a thread pool via `anyio.to_thread.run_sync`. WebAssembly runtimes (Pyodide in the browser, Cloudflare's workerd) can't spawn threads, so a sync endpoint that works fine under Uvicorn dies in the browser with:

```text
RuntimeError: can't start new thread
```

That is why every endpoint in `main.py` is `async def`. This is the one real constraint the target platforms impose on how the app is written.

## Each runtime ships its own Python version

At the time of writing, the same app ran on three different Python versions without changes: 3.12 under Uvicorn (this repo's `.python-version`), 3.14 in the browser (Pyodide v314), and 3.13 on Cloudflare Workers (its bundled Pyodide). Good incidental evidence for the portability story, and a reminder that `requires-python` should stay permissive here.

## `compatibility_date` must be one the production runtime actually ships

`pywrangler init` sets `compatibility_date` to the day you scaffold. For Python Workers that date selects the Pyodide build, and a date newer than what production has rolled out fails at deploy-time validation, inside Cloudflare's own runtime bootstrap:

```text
✘ [ERROR] A request to the Cloudflare API (.../workers/scripts/...) failed.
  Uncaught Error: Dynamic require of "fs" is not supported
    at null.<anonymous> (pyodideRuntime-internal:emscriptenSetup:6:9)
   [code: 10021]
```

`pywrangler dev` gives no warning, because local `workerd` comes from npm and runs a different build than production. `wrangler.jsonc` therefore pins `2025-11-02`, the date [Cloudflare's own Python examples](https://github.com/cloudflare/python-workers-examples) use. Bump it only after confirming a newer date deploys.

## `python-multipart` is the one dependency Pyodide doesn't bundle

FastAPI, Starlette, Pydantic, and anyio all ship in the Pyodide distribution, so they load from the CDN with no PyPI round-trip. `python-multipart` does not, and FastAPI needs it to parse the `Form()` in `/api/greet`. Without it that endpoint 500s with `AssertionError: The python-multipart library must be installed to use form parsing`.

That is why `step2-browser/worker.js` installs it explicitly:

```js
await micropip.install(["fastapi", "python-multipart"]);
```

If you add endpoints that pull in another non-bundled package, it needs adding in three places: this repo's `pyproject.toml`, that `micropip.install` list, and `step3-cloudflare/pyproject.toml`. Check membership against the distribution's [`pyodide-lock.json`](https://cdn.jsdelivr.net/pyodide/v314.0.4/full/pyodide-lock.json) before assuming it is free.

## Step 2 must be served from the repository root

`worker.js` loads the shared app with a relative fetch of `../main.py`, which is the whole point: the browser build has no copy of its own. Running `python3 -m http.server` from inside `step2-browser/` puts that path outside the document root and the worker fails to boot. Serve the repo root and open `/step2-browser/`.

## Renaming or moving the repo invalidates the virtualenvs

There are three (`.venv`, `step3-cloudflare/.venv`, `step3-cloudflare/.venv-workers`) and all bake in absolute paths. After a move, `uv sync` reports everything fine while `uv run uvicorn` fails with `Failed to spawn: uvicorn — No such file or directory`, which reads like a missing dependency rather than a stale path. Delete all three and re-sync:

```sh
rm -rf .venv step3-cloudflare/.venv step3-cloudflare/.venv-workers && uv sync
```

## The first requests after a deploy can fail

For roughly a minute after `pywrangler deploy`, requests intermittently returned edge errors (`1042`, `1104`) and 500s while the new version propagated. It settles on its own: a later burst of 30 requests came back clean, and `wrangler tail` logged every request as `ok`. Cold start after 90s idle served in ~3.2s, warm requests in ~1.1s. Before demoing, deploy early and hit the URL once to warm it.

## Known issue: the lockfiles pin a private package index

`uv.lock`, `step3-cloudflare/uv.lock`, and `step3-cloudflare/pylock.toml` record package URLs under `https://pypi.flatt.tech/`, a mirror configured on the machine that generated them, rather than PyPI. Anyone cloning this public repo will fail to resolve dependencies. Regenerate against public PyPI before relying on it elsewhere:

```sh
UV_INDEX_URL=https://pypi.org/simple uv lock
cd step3-cloudflare && UV_INDEX_URL=https://pypi.org/simple uv lock
```

## Step 2 runs Pyodide on the main thread on purpose

`step2-browser/` calls `dispatch` straight from `asgiFetch`, so the path from a
request to an ASGI call is one function call with nothing in between. That is
the clearest version to read, and it is what the talk shows.

It is not what you would ship: Python on the main thread blocks rendering and
input while it runs. `step2b-browser-worker/` is the same demo with Pyodide in
a Web Worker, which is the shape Stlite uses. The bridge, the scope dict, and
the app are identical between the two; only the transport between `asgiFetch`
and `dispatch` differs.
