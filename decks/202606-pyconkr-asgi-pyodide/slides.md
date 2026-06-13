---
theme: ../../themes/triangle
title: "ASGI on Pyodide: building a web server inside your browser"
drawings:
  persist: false
mdc: true
themeConfig:
  primary: '#36709E'
defaults:
  transition: slide-left
transition: fade-out
addons:
  - fancy-arrow
  - window-mockup
---

<h1 text-5xl leading-16>
ASGI on Pyodide
<br>
<small text-3xl op80>Building a web server <span v-mark.underline.sky="1">inside your browser</span></small>
</h1>

<div mt-12 text-xl op80>
Yuichiro Tachibana (橘 祐一郎) · @whitphx
</div>

<div absolute bottom-8 right-10 text-sm op60>
PyCon Korea 2026
</div>

<!-- Hi everyone, thanks for coming. So today I want to talk about a combination that sounds a little weird the first time you hear it — running an ASGI web server inside a browser tab. No network, no Uvicorn, just Python running in the page. I've been building in-browser Python runtimes for a few years now, and along the way I realized ASGI is a surprisingly clean way to think about what's going on. So let me walk you through it. -->

---

<h1>Yuichiro Tachibana / 橘 祐一郎</h1>

@whitphx

<div mt-8>
Software Artisan / Indie Dev / OSS Enthusiast
</div>

<div class="portfolio" w-130 mt-6 v-click="1">

- <span class="heading">Created</span>: <span class="item"><img src="/portfolio/awesome_emacs_keymap.svg">Awesome Emacs Keymap</span>, <span class="item"><img src="/portfolio/stlite.png">Stlite: In-browser Streamlit</span>, <span class="item">🎈 Streamlit-WebRTC</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio-Lite: Serverless Gradio</span>, <span class="item">🤗 Transformers.js.py</span>
- <span class="heading">Contributed to</span>: <span class="item"><img src="/portfolio/streamlit-mark-color.svg" style="height: 0.8em;">Streamlit</span>, <span class="item"><img src="/portfolio/gradio.svg">Gradio</span>
- <span class="heading">Talks</span>: <span class="item">PyCon 🇯🇵JP, 🌏APAC, 🇪🇺Euro, 🇹🇼TW, 🇩🇪DE, 🇫🇷FR, 🇱🇹LT</span>, <span class="item">FEDAY in 🇨🇳Xiamen</span>, <span class="item">🐍SciPyData2026</span>

<div absolute top-48 right-0>
<a href="https://github.com/whitphx" target="_blank" rel="noopener noreferrer">
<img src="/github_whitphx.png" alt="GitHub @whitphx" w="400px">
</a>
</div>

</div>

<div absolute left-12 bottom-10 w-min flex="~ gap-1" items-center justify-center v-click="2">
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<style>
  .portfolio {
    font-size: 1.0rem;
  }
  .item {
    height: 1.8rem;
    line-height: 1.0rem;
    font-weight: 300;
    display: inline-flex;
    align-items: center;

    img {
      height: 1.0em;
      margin-right: 0.25em;
    }
  }
</style>

<!-- Quick intro. I'm Yuichiro Tachibana, whitphx online. I build and maintain open source projects in the Python ecosystem. The two that matter most for today are Stlite — Streamlit running entirely in the browser — and Gradio-Lite, the same idea for Gradio. Building those runtimes is exactly where this talk comes from. So this isn't a textbook tour of ASGI; it's a report from actually shipping Python web frameworks into a browser tab. -->

---

# What this talk is about

<div mt-8 text-xl>

<v-clicks>

- **ASGI** is normally the interface between a Python web app and a server like Uvicorn.
- **Pyodide** is normally a way to run Python *in the browser*.
- This talk smashes them together: what if the **"server" side of ASGI lives inside a browser tab**?

</v-clicks>

</div>

<div v-click="4" mt-10 border="~ sky/50 rounded-lg" p-5 bg-sky:10 text-xl>

**Key message:** Implementing the server side of ASGI in the browser is both a real technique for shipping serverless Python web apps — and one of the clearest ways to *understand what ASGI actually is*.

</div>

<!-- OK here's the whole talk in one slide. ASGI you usually meet as the thing sitting between your FastAPI app and a server like Uvicorn. Pyodide you usually meet as "Python in the browser." The question I want to explore is: what happens if I take the server half of ASGI and implement it inside a browser tab? And the payoff is twofold. One, it's a genuinely useful technique — it's how Stlite and Gradio-Lite work. Two, and this is the part I love, building the server side forces you to learn what ASGI really expects, so you come out understanding the protocol much more concretely. Hold onto that box. -->

---

# Agenda

<div mt-6 text-2xl>

<v-clicks>

- 🌐 **Two worlds** — ASGI servers and Pyodide, and why combining them is interesting
- 🎬 **Demo** — a Starlette / FastAPI app running with no server
- ⚡ **ASGI in 90 seconds** — `scope`, `receive`, `send`
- 🛠️ **Building the bridge** — HTTP, WebSocket, lifespan, and context vars
- 📦 **Lessons & limits** — what Stlite & Gradio-Lite taught me, and where this breaks

</v-clicks>

</div>

<!-- Here's the plan. First, the two worlds — ASGI servers on one side, Pyodide on the other, and why bolting them together is worth doing. Then a demo: a real Starlette app running with no server at all. Then ASGI in ninety seconds, just the three concepts you need. Then the main event — building the bridge layer: HTTP, WebSocket, lifespan, and the context-variable problem. And finally the lessons from shipping this in Stlite and Gradio-Lite, plus the honest limits. -->

---
layout: section
---

# 🌐 Two worlds

<div mt-4 op70>
ASGI servers, and Python in the browser
</div>

<!-- Let's start by looking at the two pieces separately, because the whole talk is about what happens when they meet. -->

---

# World 1: ASGI, the app–server contract

<div mt-2 text-lg>

ASGI ([asgi.readthedocs.io](https://asgi.readthedocs.io/)) is the standard interface between an async Python web **app** and the **server** that drives it.

</div>

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-center mt-8 text-center>

<div border="~ sky/40 rounded-lg" p-4 bg-sky:5 data-id="server">
<div text-2xl>🖥️</div>
<b>Server</b><br>
<span op70 text-sm>Uvicorn · Hypercorn · Daphne</span>
</div>

<div text-3xl op60>⇄</div>

<div border="~ violet/40 rounded-lg" p-4 bg-violet:5 data-id="app">
<div text-2xl>🐍</div>
<b>App</b><br>
<span op70 text-sm>Starlette · FastAPI · Django</span>
</div>

</div>

<FancyArrow from="[data-id=server] @ bottom" to="[data-id=app] @ bottom" arc="0.5" v-click="1">

`scope`, `receive`, `send`

</FancyArrow>

<div v-click="2" mt-12 text-xl op80>

The app doesn't care *who* the server is — only that it speaks ASGI. 🤔 **So… does the server have to be a server at all?**

</div>

<!-- World one: ASGI. It's the contract between your async web app and the server that runs it. On the left, servers — Uvicorn, Hypercorn, Daphne. On the right, your app — Starlette, FastAPI, Django in async mode. They talk through three things: scope, receive, and send, which we'll unpack soon. The crucial property is decoupling: your FastAPI app has no idea which server is driving it. It just needs something on the other end that speaks ASGI correctly. And that raises the question this whole talk hangs on — if the app doesn't care who the server is, does the "server" even have to be a normal server? -->

---

# World 2: Pyodide, Python in the browser

<div mt-4 text-lg>

[Pyodide](https://pyodide.org/) is **CPython compiled to WebAssembly**. Real Python — `asyncio`, `pip`-installed packages — running inside a browser tab.

</div>

<div grid="~ cols-2" gap-8 mt-6 items-center>

<div>

<v-clicks>

- No backend server, no install — just a web page
- Python ↔ JavaScript can call each other
- `asyncio` event loop runs on the browser's loop
- ⚠️ Single interpreter, **single thread**

</v-clicks>

</div>

<div v-click="5" border="~ gray/40 rounded-lg" p-4 bg-gray:5 text-center>
<div text-sm op70 mb-2>Browser tab</div>
<div border="~ sky/40 rounded" p-2 bg-sky:5 text-sm>🌐 JavaScript / DOM</div>
<div text-2xl op50 my-1>⇅</div>
<div border="~ violet/40 rounded" p-2 bg-violet:5 text-sm>🐍 Pyodide — CPython on WASM</div>
</div>

</div>

<!-- World two: Pyodide. This is CPython, the real thing, compiled to WebAssembly so it runs inside a browser tab. You get actual Python — asyncio works, you can pip-install pure-Python packages, all client-side. No backend, nothing to install, it's just a web page. Python and JavaScript can call into each other across the boundary, and Python's asyncio loop rides on top of the browser's event loop. One important constraint, and it'll come back to bite us later: it's a single interpreter on a single thread. There's no real parallelism here. -->

---
layout: statement
---

## What if the "server" in ASGI<br>was a JavaScript-driven bridge<br>**inside the browser?**

<div mt-8 text-xl op70 v-click="1">

The app stays a normal Starlette / FastAPI app.<br>
We just write the *other half* of the ASGI contract — in the browser.

</div>

<!-- So here's the idea, stated plainly. ASGI has two halves: the app and the server. Pyodide can run the app half no problem — it's just Python. What's missing is the server half: something to take browser events and drive the app through scope, receive, and send. So what if we write that server half ourselves, as a bridge living inside the browser, fed by JavaScript? The beautiful part is the app doesn't change at all. It's still an ordinary FastAPI app. We only have to build the other side of the contract. That's the entire project. -->

---
layout: section
---

# 🎬 Demo

<div mt-4 op70>
A Starlette / FastAPI app with no server
</div>

<!-- Before the internals, let me show you that this actually works — a real ASGI app running with nothing behind it. -->

---

# A normal ASGI app… running in a tab

<div grid="~ cols-2" gap-5 mt-2>

<div>

This is just a **plain Starlette app** — nothing browser-specific:

```py {*}{maxHeight:'300px'}
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

async def hello(request):
    return JSONResponse({"hello": "PyCon KR"})

app = Starlette(routes=[
    Route("/api/hello", hello),
])
```

</div>

<div v-click="1">

But there's **no Uvicorn**. A bridge in the page feeds it requests:

<WindowMockup title="https://example.com (offline!)" dark codeblock>

```js {*}{maxHeight:'200px'}
// JavaScript, in the browser
const res = await bridge.fetch(
  "/api/hello"
);
await res.json();
// → { hello: "PyCon KR" }
```

</WindowMockup>

</div>

</div>

<div v-click="2" mt-3 text-center op80>

No network request leaves the tab. The response is produced by Python **next to** the JavaScript. 🤯

</div>

<!-- On the left, a completely ordinary Starlette app. One route, returns some JSON. If you've written FastAPI or Starlette, this is muscle memory — and notice there is nothing browser-specific in it. On the right, the twist: there's no Uvicorn anywhere. Instead a bridge object in the page has a fetch method, and when JavaScript calls it, that request goes straight into the Python app and comes back as a response. And the key thing — see the title bar says offline — no network request ever leaves the tab. The JSON is computed by Python running right next to the JavaScript, in the same page. That's the magic trick; the rest of the talk is how it works. -->

---

# What's actually running where

<div mt-4 flex justify-center>

<div border="~ gray/40 rounded-xl" p-4 bg-gray:5 w-140>

<div text-center text-sm op70 mb-2>🌐 One browser tab — no backend</div>

<div border="~ sky/40 rounded-lg" p-3 bg-sky:8 text-center data-id="js">
🟦 <b>JavaScript</b> — UI, <code>fetch()</code>, WebSocket calls
</div>

<div text-center text-xl op50 my-1>⇅ <span text-sm op70>(Pyodide JS ↔ Python boundary)</span></div>

<div border="~ violet/40 rounded-lg" p-3 bg-violet:8 text-center data-id="bridge">
🌉 <b>ASGI bridge</b> — the "server" half (our code)
</div>

<div text-center text-xl op50 my-1>⇅ <span text-sm op70>(<code>scope</code>, <code>receive</code>, <code>send</code>)</span></div>

<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:8 text-center data-id="appbox">
🐍 <b>ASGI app</b> — Starlette / FastAPI (unchanged)
</div>

</div>

</div>

<div v-click="1" mt-4 text-center op80 text-lg>

The bridge is the only new part — and it's what the rest of this talk builds. 🛠️

</div>

<!-- Let me make the layers concrete because we'll keep referring to them. Everything lives in one browser tab, no backend. At the top, JavaScript — that's your UI, and it's where fetch and WebSocket calls originate. At the bottom, the ASGI app — your unchanged Starlette or FastAPI code. In the middle, the new piece: the ASGI bridge. Above it, it talks to JavaScript across the Pyodide boundary. Below it, it talks to the app using scope, receive, and send. So the only thing we have to build is that middle layer — the server half of ASGI, reimagined for the browser. Let's first nail down what scope, receive, and send even are. -->

---
layout: section
---

# ⚡ ASGI in 90 seconds

<div mt-4 op70>
<code>scope</code>, <code>receive</code>, <code>send</code>
</div>

<!-- Quick detour to make sure we share the same vocabulary. If you already know ASGI cold, this is a refresher; if you don't, this is all you need for the rest of the talk. -->

---

# An ASGI app is one async callable

<div mt-2 text-lg>

The entire ASGI app interface is **a single coroutine** with three arguments:

</div>

```py {*|1|2|3|4|*}{maxHeight:'230px'}
async def app(scope, receive, send):
    #          scope   → a dict describing this connection
    #          receive → await it to GET an event from the client
    #          send    → await it to PUSH an event to the client
    ...
```

<div v-click="5" mt-5 grid="~ cols-3" gap-3 text-sm>

<div border="~ sky/40 rounded-lg" p-3 bg-sky:8>
📋 <b><code>scope</code></b><br><span op80>Type + metadata: kind of connection, path, headers…</span>
</div>
<div border="~ violet/40 rounded-lg" p-3 bg-violet:8>
📥 <b><code>receive()</code></b><br><span op80>An async <i>inbox</i>: request body, WS messages, events</span>
</div>
<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
📤 <b><code>send()</code></b><br><span op80>An async <i>outbox</i>: response status, body, WS messages</span>
</div>

</div>

<!-- Here's the entire app-facing surface of ASGI. It's one async function taking three things. Scope is a dict that describes the connection — what kind it is, the path, the headers, that sort of metadata. receive is an async callable; you await it to pull the next event from the client — a chunk of request body, an incoming WebSocket message. And send is an async callable; you await it to push an event out — your response status, your body, an outgoing WebSocket frame. That's it. Think of receive as an inbox and send as an outbox, both async. A server's whole job is to build the scope, and to implement receive and send. Which is exactly what our bridge has to do. -->

---

# Three connection types, one shape

<div mt-4 text-lg>

`scope["type"]` tells the app which protocol it's speaking. All three use the same `receive` / `send` loop:

</div>

<div grid="~ cols-3" gap-4 mt-6 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-xl mb-1>🌐 <b><code>"http"</code></b></div>
<span op80>Request → response.<br>
<code>receive</code>: body chunks<br>
<code>send</code>: status + body</span>
</div>

<div v-click="2" border="~ violet/40 rounded-lg" p-4 bg-violet:5>
<div text-xl mb-1>🔌 <b><code>"websocket"</code></b></div>
<span op80>Long-lived, two-way.<br>
<code>receive</code>: connect / messages<br>
<code>send</code>: accept / messages</span>
</div>

<div v-click="3" border="~ amber/40 rounded-lg" p-4 bg-amber:5>
<div text-xl mb-1>♻️ <b><code>"lifespan"</code></b></div>
<span op80>App startup / shutdown.<br>
<code>receive</code>: startup / shutdown<br>
<code>send</code>: ...complete</span>
</div>

</div>

<div v-click="4" mt-8 text-center text-xl op80>

Our bridge must produce all three — that's the to-do list. ✅

</div>

<!-- ASGI carries three kinds of connection, and the app figures out which one by reading scope type. The nice part is they all share the same receive-and-send loop, so once you understand one, the others are variations. HTTP is request-response: receive gives you the body, send takes your status and body. WebSocket is the long-lived two-way one: receive gives connect events and incoming messages, send accepts the connection and pushes messages out. And lifespan is the odd one — it's not a client connection at all, it's the app's own startup and shutdown signal. So our bridge has a clear to-do list: implement all three. Let's go build them. -->

---
layout: section
---

# 🛠️ Building the bridge

<div mt-4 op70>
HTTP · WebSocket · lifespan · context vars
</div>

<!-- This is the heart of the talk. We're going to write the server half, one protocol at a time, and I'll show the actual shape of the code. -->

---

# HTTP: turn a JS request into a `scope`

<div mt-1 text-lg>

JavaScript hands us a request; we shape it into an ASGI HTTP `scope`:

</div>

```py {*|2|3-6|7|*}{maxHeight:'250px'}
def build_http_scope(request):   # `request` comes from JavaScript
    return {
        "type": "http",
        "method": request.method,                    # "GET"
        "path": request.path,                        # "/api/hello"
        "query_string": request.query.encode(),      # b"x=1"
        "headers": [(k.lower().encode(), v.encode())
                    for k, v in request.headers],     # bytes, lowercased
    }
```

<div v-click="5" mt-4 op80 text-lg>

ASGI is strict: headers are **lists of `(bytes, bytes)`**, the path is a `str`, the query is `bytes`. Getting these types right *is* "implementing the server."

</div>

<!-- Let's start with HTTP, the request-response case. JavaScript gives us a request object — a method, a path, query params, headers. Our job is to reshape that into the dict ASGI calls a scope. Most of this is mechanical, but notice the details, because this is where you actually learn ASGI. The type is the string http. Headers are not a dict — they're a list of two-byte-string tuples, and the names have to be lowercased. The path is a normal string but the query string is bytes. ASGI is picky about all of this, and honestly, getting these types exactly right is most of what "being a server" means. The spec stops being abstract the moment you have to produce these values yourself. -->

---

# HTTP: wire up `receive` and `send`

<div mt-1 text-lg>

`receive` feeds the request body in; `send` collects the response out:

</div>

```py {*|3-7|9-15|17-18|*}{maxHeight:'300px'}
async def dispatch_http(app, request):
    scope = build_http_scope(request)

    async def receive():                       # 📥 the app pulls the body
        return {"type": "http.request",
                "body": request.body,          # bytes from JS
                "more_body": False}

    status, headers, chunks = None, [], []
    async def send(event):                     # 📤 the app pushes the response
        nonlocal status, headers
        if event["type"] == "http.response.start":
            status, headers = event["status"], event["headers"]
        elif event["type"] == "http.response.body":
            chunks.append(event.get("body", b""))

    await app(scope, receive, send)            # ← run the app!
    return Response(status, headers, b"".join(chunks))  # → back to JS
```

<div v-click="4" mt-2 op70 text-sm>

The full request/response round-trip is just: build scope → define receive/send → `await app(...)`.

</div>

<!-- Now the actual round-trip. receive is how the app asks us for the request body, so we hand back an http.request event carrying the bytes JavaScript gave us, and we say more_body false because there's nothing after it. send is the reverse — the app calls it to emit the response, and it does so in pieces: first an http.response.start with the status and headers, then one or more http.response.body events with the actual bytes. So we just listen for those, stash the status, and accumulate the body chunks. Then the punchline at the bottom — we await the app with our scope, receive, and send, and when it returns we assemble everything into a Response object and hand it back across the boundary to JavaScript. That's a complete HTTP server in about fifteen lines. -->

---

# WebSocket: an awaitable receive queue

<div mt-1 text-lg>

WebSockets are **long-lived and event-driven**. The hard part: JS messages arrive *whenever*, but the app `await`s `receive()`. An `asyncio.Queue` bridges the two:

</div>

```py {*|2|4-6|8-10|*}{maxHeight:'270px'}
class WebSocketSession:
    def __init__(self):
        self._inbox = asyncio.Queue()

    def on_js_message(self, data):                 # 🟦 called FROM JavaScript
        self._inbox.put_nowait(
            {"type": "websocket.receive", "text": data})

    async def receive(self):                       # 🐍 awaited BY the app
        return await self._inbox.get()             # blocks until JS pushes
```

<div v-click="3" mt-4 grid="~ cols-2" gap-4 text-sm>

<div border="~ violet/40 rounded-lg" p-3 bg-violet:8>
🟦 JS side calls <code>on_js_message</code> — <b>synchronous, fire-and-forget</b>
</div>
<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
🐍 App side <code>await</code>s <code>receive()</code> — <b>suspends until a message exists</b>
</div>

</div>

<!-- WebSockets are trickier because they're long-lived and the timing is inverted. JavaScript receives messages whenever the network feels like it — it's push-driven, synchronous, fire-and-forget. But the ASGI app is pull-driven; it sits there awaiting receive, expecting the next message to be handed to it. So we need to connect a push world to a pull world, and the classic tool for that is an asyncio.Queue. When JavaScript gets a message, it calls on_js_message, which just drops a websocket.receive event into the queue and returns immediately — no awaiting. Meanwhile the app awaits our receive, which awaits queue.get, and that suspends the task until something actually shows up. The queue absorbs the timing mismatch. This little buffer is the heart of doing WebSockets in the browser. -->

---

# WebSocket: the session lifecycle

<div mt-2 text-lg>

The app drives the handshake through the same `receive` / `send` events:

</div>

```py {*|3|6|9|*}{maxHeight:'260px'}
# What the app expects to see, in order, over one WS connection:

# 1. App receives:  {"type": "websocket.connect"}      ← we enqueue on open
#    App sends:     {"type": "websocket.accept"}        → we tell JS "open"

# 2. App receives:  {"type": "websocket.receive", ...}  ← per JS message
#    App sends:     {"type": "websocket.send", ...}      → we post to JS

# 3. App sends:     {"type": "websocket.close"}          → we close the JS socket
#    or app receives {"type": "websocket.disconnect"}    ← JS closed it
```

<div v-click="4" mt-4 op80 text-lg>

Same `receive` / `send` shape as HTTP — only the **event types and the lifetime** differ. 🔁

</div>

<!-- And here's the rest of the WebSocket dance, all expressed through the same receive and send we already built. When the connection opens, we enqueue a websocket.connect event; the app responds by sending websocket.accept, and we translate that into telling the JavaScript socket it's open. Then for each message, the app receives a websocket.receive and replies with a websocket.send, which we post back out to JavaScript. Finally either side can end it — the app sends websocket.close and we close the JS socket, or JavaScript closes first and we feed the app a websocket.disconnect. The thing I want you to notice is that this is the exact same receive-slash-send loop as HTTP. Only the event names and the fact that it lives a long time are different. One mental model covers both. -->

---

# Lifespan: driving startup & shutdown

<div mt-1 text-lg>

`lifespan` isn't a client connection — it's the app's own boot/teardown signal (DB pools, ML models, caches). We drive it once, around the app's life:

</div>

```py {*|3-4|6-9|11-13|*}{maxHeight:'280px'}
async def run_lifespan(app):
    scope = {"type": "lifespan"}
    inbox = asyncio.Queue()
    inbox.put_nowait({"type": "lifespan.startup"})

    async def receive():
        return await inbox.get()
    async def send(event):
        ...  # await "lifespan.startup.complete" before serving requests

    # Run it in the background for the whole app lifetime
    asyncio.ensure_future(app(scope, receive, send))
    # ...later, on teardown: inbox.put_nowait({"type": "lifespan.shutdown"})
```

<div v-click="4" mt-2 op70 text-sm>

Skipping lifespan is a common bug: FastAPI's <code>lifespan=</code> / startup hooks silently never run, so DB pools and models are never initialized.

</div>

<!-- Third protocol: lifespan. This one's conceptually different because there's no client involved — it's how the app gets told "you're starting up" and "you're shutting down." It's where FastAPI runs its lifespan handlers: opening database pools, loading ML models, warming caches. We drive it once, spanning the whole app's life. We make a lifespan scope, push a lifespan.startup event into a queue, and wire up receive and send just like before. The app does its startup work and sends startup.complete, and we wait for that before we let any real request through. Then we run the whole thing as a background task for the lifetime of the app, and on teardown we push a shutdown event. The note at the bottom is from experience — if you forget lifespan entirely, everything seems to work until someone's database pool is mysteriously never initialized. Don't skip it. -->

---

# Context vars: many apps, one runtime

<div mt-1 text-lg>

A browser page can mount **multiple apps at once**, sharing **one interpreter, one thread**. "Which app am I in?" must be answered **per task**.

</div>

```py {*|1|4-6|*}{maxHeight:'190px'}
from contextvars import ContextVar

current_app: ContextVar[str] = ContextVar("current_app")

async def dispatch_http(app_id, app, request):
    current_app.set(app_id)        # per-task, survives every await
    await app(scope, receive, send)
```

<div v-click="3" mt-2 border="~ amber/50 rounded-lg" p-2 bg-amber:10 text-sm>

⚠️ [PEP 567](https://peps.python.org/pep-0567/) `contextvars` isolate logical context per task — but **process-global** state (cwd, env vars) still needs explicit wrapping. *(A whole talk on its own!)*

</div>

<div v-click="4" mt-1 op70 text-sm>

Real-world motivation: replacing Stlite's Tornado emulation with ASGI dispatch — <a href="https://github.com/whitphx/stlite/pull/2046" target="_blank">stlite#2046</a>

</div>

<!-- Last piece of the bridge, and it's the one that surprised me most. In a browser page you can mount several of these apps at the same time, but remember Pyodide is one interpreter on one single thread. So when code deep inside a framework asks "which app am I serving, which request is this," that's a per-task question on a shared thread — and the standard-library answer is contextvars, from PEP 567. You set the current app on the task, and it stays correct across every await, even while other apps' tasks interleave. The catch, in the amber box, is that contextvars only isolates logical context — things that are truly process-global, like the working directory or environment variables, still need manual wrapping. That gap is genuinely a whole talk of its own. This all came out of real work, replacing Stlite's old Tornado emulation with proper ASGI dispatch. -->

---
layout: section
---

# 📦 Lessons & limits

<!-- So I've built versions of this for real. Let me share what got clearer, and — just as important — where this approach actually breaks down. -->

---

# Lessons from Stlite & Gradio-Lite

<div mt-6 text-lg>

<v-clicks>

- 🧭 **ASGI gave the bridge a shape.** Before, each project hand-rolled an ad-hoc Tornado-like layer. ASGI turned it into a *standard target* to implement against.
- 🔁 **One mental model, three protocols.** HTTP, WebSocket, and lifespan all collapse into `scope` / `receive` / `send`.
- 🧩 **What stays framework-specific:** static file serving, session/cookie quirks, and each framework's own startup conventions.
- 🐛 **Gotchas:** strict header byte-types, lifespan you must not skip, and the single-thread context-var traps.

</v-clicks>

</div>

<!-- Here's what I took away from doing this twice, in Stlite and in Gradio-Lite. The biggest one: ASGI gave the bridge a shape. Before, each project had its own ad-hoc, Tornado-flavored emulation layer that I'd grown organically and could barely explain. Targeting ASGI turned it into a real spec I could implement against, with a clear notion of "done." Second, the unification — once you have scope, receive, and send, all three protocols are the same shape, which massively simplifies the code. Third, what didn't unify: static file serving, cookie and session quirks, and each framework's own startup conventions still need per-framework care. And the gotchas are the ones we hit live — the strict byte types on headers, never skipping lifespan, and the single-thread context-variable traps. -->

---

# Practical applications

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📡 <b>Static-hosted demos</b><br><span op80 text-base>Ship a full web app as static files — GitHub Pages, a CDN, no backend to run.</span>
</div>

<div v-click="2" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📖 <b>Runnable documentation</b><br><span op80 text-base>Live, editable API examples right inside the docs page.</span>
</div>

<div v-click="3" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🎓 <b>Education</b><br><span op80 text-base>Teach FastAPI with zero local setup — it just runs in the browser.</span>
</div>

<div v-click="4" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🔒 <b>Privacy-preserving apps</b><br><span op80 text-base>Data never leaves the device — everything runs client-side.</span>
</div>

</div>

<!-- So what's this actually good for? Four things I keep coming back to. Static-hosted demos — you can ship an entire web app as static files on GitHub Pages or a CDN, with literally no backend to operate or pay for. Runnable documentation — live, editable API examples sitting right in the docs, where the reader can poke at them. Education — you can teach FastAPI to a room of beginners with zero local setup, because it just runs in their browser tab. And privacy — since everything's client-side, the user's data never leaves their device, which is a real selling point for sensitive workloads. -->

---

# Honest limits

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ red/40 rounded-lg" p-4 bg-red:5>
📦 <b>Dependency size</b><br><span op80 text-base>Everything downloads to the browser; C-extension packages may not be available on Pyodide.</span>
</div>

<div v-click="2" border="~ red/40 rounded-lg" p-4 bg-red:5>
🧵 <b>Single thread, sandboxed</b><br><span op80 text-base>No real parallelism; only browser-permitted APIs — no raw sockets, no filesystem.</span>
</div>

<div v-click="3" border="~ red/40 rounded-lg" p-4 bg-red:5>
🔑 <b>No safe secrets</b><br><span op80 text-base>Anything in the page is visible to the user — no server-side API keys.</span>
</div>

<div v-click="4" border="~ red/40 rounded-lg" p-4 bg-red:5>
📥 <b>No inbound requests</b><br><span op80 text-base>The tab can't receive external webhooks — there's no public address to hit.</span>
</div>

</div>

<div v-click="5" mt-5 text-center op80>

This **complements** real servers — it doesn't replace them. 🤝

</div>

<!-- And the honest part, because this isn't magic. Dependency size: everything ships to the browser, and packages with C extensions may simply not be available on Pyodide. The runtime is single-threaded and sandboxed, so no real parallelism, and you only get browser-permitted APIs — no raw sockets, no real filesystem. Secrets are impossible to hide — anything in the page, the user can read, so there's no place for a server-side API key. And there's no inbound networking — the tab has no public address, so it can't receive a webhook. The takeaway is that this complements real servers; it doesn't replace them. Use it where its strengths line up, not everywhere. -->

---
layout: section
---

# 🧵 Conclusion

<!-- Let me pull it all together. -->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🌐 ASGI **decouples** the app from the server — so the "server" can be a **browser-side bridge**.
- ⚡ The whole contract is three things: **`scope`, `receive`, `send`** — and three connection types.
- 🛠️ Building the bridge teaches ASGI *concretely*: HTTP, WebSocket queues, lifespan, and context vars.
- 📦 Real uses today — static demos, runnable docs, teaching, privacy — within clear limits.
- 🧠 **Implementing the server side is the best way to truly understand it.**

</v-clicks>

</div>

<!-- Five things to carry out of the room. One: ASGI decouples the app from the server, and that decoupling is exactly what lets the server be a browser-side bridge instead of Uvicorn. Two: the entire contract is just scope, receive, and send, across three connection types — that's genuinely all of it. Three: building the bridge teaches you ASGI in a way reading the spec never will — HTTP, the WebSocket queue trick, lifespan, the context-variable traps. Four: this is useful right now — static demos, runnable docs, teaching, privacy apps — as long as you respect the limits. And the one-liner if you forget the rest: the best way to truly understand a protocol is to implement the other side of it. -->

---

# References & links

<div mt-6 text-lg>

<div flex="~ col" gap-3>

<div flex="~ gap-2" items-center>
<div i-ri-file-text-line text-2xl op50 />
<div><a href="https://asgi.readthedocs.io/" target="_blank">asgi.readthedocs.io</a> — the ASGI specification</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-global-line text-2xl op50 />
<div><a href="https://pyodide.org/" target="_blank">pyodide.org</a> — CPython on WebAssembly</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-2xl op50 />
<div><a href="https://github.com/whitphx/stlite" target="_blank">whitphx/stlite</a> — in-browser Streamlit (uses this bridge)</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-git-pull-request-line text-2xl op50 />
<div><a href="https://github.com/whitphx/stlite/pull/2046" target="_blank">stlite#2046</a> — replacing Tornado emulation with ASGI dispatch</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-2xl op50 />
<div><a href="https://github.com/gradio-app/gradio/pull/4402" target="_blank">gradio#4402</a> — the Gradio-Lite implementation</div>
</div>

</div>

</div>

<!-- Here are the links if you want to go deeper. The ASGI spec itself, which honestly reads much better once you've tried to implement it. Pyodide's site. The Stlite repo, where this bridge runs in production, and the specific PR where I moved it from Tornado emulation to ASGI dispatch — that diff is basically this talk in code. And the original Gradio-Lite PR for the Gradio side of the story. -->

---

<h1>Thank you! 🙏</h1>

<div mt-10 text-2xl>
Let's build web servers where there's no server. 🌐🐍
</div>

<div mt-8 w-min flex="~ gap-1" items-center justify-center>
  <div i-ri-user-3-line op50 ma text-2xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-2xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-linkedin-line op50 ma text-2xl ml4/>
  <div><a href="https://www.linkedin.com/in/whitphx/" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-2xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

<!-- And that's it. Thank you so much for listening. If you take one image away, let it be this — a web server where there is no server. I'd love to hear what you'd build with it, so please come find me, and I'm happy to take questions. Thank you! -->
