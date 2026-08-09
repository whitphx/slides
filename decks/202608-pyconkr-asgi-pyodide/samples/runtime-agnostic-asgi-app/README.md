# Runtime-agnostic ASGI app example

One FastAPI app, three runtimes. The app in [`main.py`](main.py) is written once, as a plain ASGI app, and runs:

1. **On a server**, with Uvicorn
2. **In the browser**, with [Pyodide](https://pyodide.org/) in a Web Worker
3. **On the edge**, with [Cloudflare Python Workers](https://developers.cloudflare.com/workers/languages/python/)

The point: an ASGI app is just a callable taking `(scope, receive, send)`. It doesn't care where those come from. Anything that can construct that call can host the app, so the same `app` object runs anywhere Python runs.

| Step | Host | The ASGI bridge | Transport it translates |
| --- | --- | --- | --- |
| 1 | Uvicorn | Uvicorn itself | HTTP over TCP sockets |
| 2 | Web Worker (Pyodide) | [`step2-browser/bridge.py`](step2-browser/bridge.py) | `postMessage` from the page |
| 3 | Cloudflare Workers | the SDK's [`asgi` module](https://github.com/cloudflare/workers-py/blob/main/packages/runtime-sdk/src/asgi.py) | JS `Request`/`Response` |

The frontend is plain HTML + [htmx](https://htmx.org/), served by the app itself, so there is no frontend build step. htmx 4 issues its requests through `fetch()`, which is what makes step 2 possible without touching the app or its HTML.

## Step 1: run it normally

```sh
uv sync
uv run uvicorn main:app --reload
```

Open http://127.0.0.1:8000. The "Where am I running?" button reports something like `Python 3.12 on darwin/arm64`.

## Step 2: run it in the browser

```sh
python3 -m http.server 8080
```

Open http://localhost:8080/step2-browser/. After Pyodide boots (a few seconds), the same page appears, but now the button reports `emscripten/wasm32`: the app is running inside your browser tab. Stop the static server once it has loaded if you want proof that no server is involved.

How it works, in four small files:

- [`index.html`](step2-browser/index.html) fetches `/` from the in-browser app, injects the HTML, and registers one listener: `htmx:before:request` sets `ctx.fetch = appFetch`, so every request htmx would send over the network goes to the app instead.
- [`main.js`](step2-browser/main.js) defines `appFetch()`, a function with the same signature as `fetch()` whose "server" is a Web Worker: it posts the request's method, path, headers, and body to the worker and wraps the reply in a `Response`.
- [`worker.js`](step2-browser/worker.js) boots Pyodide, installs `fastapi`, loads the same `main.py` from step 1, and forwards each message to the bridge.
- [`bridge.py`](step2-browser/bridge.py) is the whole trick: a small function that turns one HTTP request into one ASGI call by building a `scope` and handing the app `receive`/`send` callables.

```text
htmx ──fetch signature──▶ appFetch ──postMessage──▶ worker ──dispatch()──▶ app(scope, receive, send)
     ◀───Response──────────────────◀──postMessage──────────◀──────────────
```

## Step 3: run it on Cloudflare Workers

```sh
cd step3-cloudflare
uv run pywrangler dev     # local
uv run pywrangler deploy  # production
```

Open http://localhost:8787, or the deployed copy at **https://runtime-agnostic-asgi-app.whitphx.workers.dev**. Same page, same button, and it reports `emscripten/wasm32` again: Cloudflare's runtime also executes Python via Pyodide.

The entrypoint ([`src/entry.py`](step3-cloudflare/src/entry.py)) is four meaningful lines: it imports `app` and hands it to `asgi.fetch(app, request, ...)`. That `asgi` module is the production-grade version of step 2's `bridge.py` (streaming, WebSockets, lifespan, error handling), maintained by Cloudflare. `src/main.py` is a symlink to `app/main.py`, so all three steps serve literally the same file.

## Notes

More detail on each of these in [NOTES.md](NOTES.md).

- Endpoints are `async def` on purpose: Starlette runs sync endpoints in a thread pool, and WebAssembly runtimes can't spawn threads.
- In-process state (the counter) behaves differently per host, which is a feature of the demo: it persists in the Uvicorn process and in the Web Worker, but on Workers each isolate has its own.
- `bridge.py` is a deliberately stripped-down reimplementation of the pattern in [stlite's `asgi-bridge.ts`](https://github.com/whitphx/stlite/blob/main/packages/kernel/src/asgi-bridge.ts) (Apache-2.0) and [workers-py's `asgi.py`](https://github.com/cloudflare/workers-py/blob/main/packages/runtime-sdk/src/asgi.py) (MIT). Read those for what production bridges additionally handle.
