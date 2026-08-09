"""The ASGI app shared by every step: Uvicorn, Pyodide in the browser, and Cloudflare Workers.

This file knows nothing about where it runs; it only speaks ASGI.
"""

import html
import platform
import sys
from typing import Annotated

from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse

app = FastAPI()

PAGE = """\
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Runtime-agnostic ASGI app</title>
<script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0-beta6/dist/htmx.min.js" integrity="sha384-6lyVbhrs13b9z7mLOpt/N6R76rtkEBWgCjAXRs/DSWyi2AMnQSs10ijWk+PI8n7W" crossorigin="anonymous"></script>
<style>
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
  section { margin-block: 2rem; }
  output { display: block; margin-top: 0.5rem; }
</style>
</head>
<body>
<main>
  <h1>Runtime-agnostic ASGI app</h1>

  <section>
    <h2>Runtime</h2>
    <button type="button" hx-get="/api/runtime" hx-target="#runtime-result">Where am I running?</button>
    <output id="runtime-result" aria-live="polite"></output>
  </section>

  <section>
    <h2>Greeting</h2>
    <form hx-post="/api/greet" hx-target="#greet-result">
      <label for="name">Name</label>
      <input id="name" name="name" required>
      <button type="submit">Greet</button>
    </form>
    <output id="greet-result" aria-live="polite"></output>
  </section>

  <section>
    <h2>Counter</h2>
    <button type="button" hx-post="/api/count" hx-target="#count-result">Increment</button>
    <output id="count-result" aria-live="polite"></output>
  </section>
</main>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def index() -> str:
    return PAGE


# region slide-routes
@app.get("/api/runtime", response_class=HTMLResponse)
async def runtime() -> str:
    return (
        f"<p>Python {platform.python_version()} on "
        f"<strong>{sys.platform}/{platform.machine()}</strong></p>"
    )


@app.post("/api/greet", response_class=HTMLResponse)
async def greet(name: Annotated[str, Form()]) -> str:
    return f"<p>Hello, {html.escape(name)}!</p>"


# endregion slide-routes


count = 0


@app.post("/api/count", response_class=HTMLResponse)
async def increment() -> str:
    global count
    count += 1
    return f"<p>Count: {count}</p>"
