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
  - qrcode
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
PyCon Korea 2026 · Aug 15
</div>

<!-- Hi everyone, thanks for coming. Today I want to talk about something that sounds a little weird the first time you hear it — running a web server inside a browser tab. No network, no Uvicorn, just Python running in the page. But here's the thing: this talk isn't really about the browser. It's about what you get when you cut a clean interface — and ASGI is that interface. The browser is just the most extreme place I've taken it. Let me show you. -->

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

<!-- Quick intro. I'm Yuichiro Tachibana, whitphx online. I build and maintain open source projects in the Python ecosystem. The two that matter most for today are Stlite — Streamlit running entirely in the browser — and Gradio-Lite, the same idea for Gradio. Building those runtimes is exactly where this talk comes from. So this isn't a textbook tour of ASGI; it's a report from actually shipping Python web frameworks into unusual places. -->

---

# What this talk is about

<div mt-6 text-2xl>

<v-clicks>

- Your app ⇄ **ASGI** ⇄ Uvicorn
- Solid contract → **either side swappable**
- How far can the *server* side stretch? <span v-click="4" font-bold text-sky-600>Into a browser tab — and beyond</span>

</v-clicks>

</div>

<div v-click="5" mt-8 border="~ sky/50 rounded-lg" p-4 bg-sky:10 text-xl text-center>

**Cut a clean interface → run anywhere something can *call* you.**<br>
<span op80>One FastAPI app · three runtimes · zero changes</span>

</div>

<!-- Here's the whole talk in one slide. When you write a FastAPI app, your code never actually touches the network. Uvicorn does that part, and between your app and Uvicorn there's an interface — ASGI. Now, because that interface is a real, well-specified contract, the two sides are decoupled. Frameworks evolve on one side, servers evolve on the other, and neither needs to know the other's internals. And the question I want to push on today is: how far can you stretch the server side? The answer turns out to be: much further than you'd think. Into a browser tab. And past it. So here's the key message to hold onto: cut a clean interface, and your app runs anywhere something can call it. To prove it, one FastAPI app is going to run on three wildly different runtimes today, without changing a line. -->

---

# Agenda

<div mt-6 text-xl>

<v-clicks>

- 🧩 **The boundary you use every day** — what ASGI already does for you
- ⚡ **ASGI in 90 seconds** — `scope`, `receive`, `send`
- 🌐 **The extreme case** — the same app, running in a browser tab (demo)
- 🛠️ **Building the bridge** — impersonating Uvicorn in ~45 lines
- 🏭 **The production proof** — Stlite & friends
- ☁️ **Full circle** — the same stack on Cloudflare Workers
- 🧭 **When to reach for this** — practical uses & honest limits

</v-clicks>

</div>

<!-- The plan for the next forty minutes. We start with the boundary you already use every day without looking at it. Then a quick ASGI refresher — ninety seconds, just the three words you need. Then the fun part: the same app running in a browser tab, live. Then we build the thing that makes it possible — a bridge that impersonates Uvicorn in about forty-five lines of Python. Then the production side: Stlite and Gradio-Lite, where this actually ships. Then we go full circle and run the same stack on Cloudflare Workers. And we close with what this is actually good for, and where it honestly breaks down. -->

---
layout: section
---

# 🧩 The boundary you use every day

<div mt-4 op70>
…without ever looking at it
</div>

<!-- Let's start with the thing you already do, probably every week. -->

---
clicks: 1
---

# You deploy this pair every week

<div class="deploy-grid" mt-4 :style="{ gridTemplateColumns: $clicks >= 1 ? '1fr 1fr' : '1fr 0fr' }">

<div class="deploy-cell">

<div text-sm mb-1>Demo app — <b>ordinary FastAPI</b></div>

```py {*}
import platform, sys
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/runtime")
async def runtime() -> str:
    py = platform.python_version()
    return f"Python {py} on {sys.platform}"
```

</div>

<div class="deploy-cell" :class="$clicks >= 1 ? 'op100' : 'op0'">

<div text-sm mb-1>…and how everyone runs it</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn main:app
INFO:  Started server process
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

</WindowMockup>

<div mt-4 text-lg>

App: ***what* to answer**<br>
Uvicorn: ***how* requests arrive**

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 24px;
  --slidev-code-line-height: 1.5;
}
.deploy-grid {
  display: grid;
  gap: 1.25rem;
  transition: grid-template-columns 700ms ease;
}
.deploy-cell {
  min-width: 0;
  overflow: hidden;
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- This is an excerpt from the demo app we'll use all day. It has an endpoint that answers the question "where am I running?" — it reports the Python version and the platform. Completely ordinary FastAPI; if you've written any, this is muscle memory. And on the right, the way everyone runs it: uvicorn app dot main colon app. Done. But notice the division of labor here, because it's the whole talk. Your app defines what to answer. Uvicorn deals with how requests arrive — sockets, HTTP parsing, all of it. Your code and Uvicorn's code never actually touch. Something sits between them. -->

---

# Two ecosystems, one contract

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-center mt-8 text-center>

<div v-click="1" border="~ violet/40 rounded-lg" p-4 bg-violet:5 data-id="apps">
<div text-2xl>🐍</div>
<b>App frameworks</b><br>
<span op70 text-sm>FastAPI · Starlette · Django<br>Litestar · Quart …</span>
</div>

<div v-click="3" px-2 text-center data-id="asgi">
<div text-2xl op60>⇄</div>
<div text-2xl><b>ASGI</b></div>
<div op70 text-sm mt-1><code>scope</code> · <code>receive</code> · <code>send</code></div>
</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-4 bg-sky:5 data-id="servers">
<div text-2xl>🖥️</div>
<b>Servers</b><br>
<span op70 text-sm>Uvicorn · Hypercorn<br>Daphne · Granian …</span>
</div>

</div>

<div v-click="4" mt-16 text-2xl op90 text-center>

Each side evolves **independently** — nobody coordinates 🤝

</div>

<!-- Between them sits ASGI — the standard interface between an async Python web app and whatever runs it. On one side, the app frameworks: FastAPI, Starlette, Django, Litestar, Quart. On the other, the servers: Uvicorn, Hypercorn, Daphne, Granian. They talk through three things — scope, receive, and send — and we'll unpack those in a minute. But look at what this contract buys the ecosystem: each side evolves without asking the other's permission. Granian showed up, written in Rust, and every existing framework just ran on it. Litestar showed up, and every existing server could serve it. Nobody coordinated anything. That's what a good interface does. And by the way — this idea is much older than async Python. -->

---

# Not a new idea: WSGI walked first

<div mt-2 text-lg>

Same motivation, one standard earlier — **the synchronous era**:

</div>

<div grid="~ cols-[1fr_auto_1fr]" gap-4 items-stretch mt-5>

<div v-click="1" border="~ gray/40 rounded-lg" p-3 bg-gray:5>
<div text-lg>📜 <b>WSGI</b> <span op60 text-sm>— <a href="https://peps.python.org/pep-0333/" target="_blank">PEP 333</a>, 2003</span></div>
<div mt-2 text-sm><code>def app(environ, start_response)</code></div>
<div op80 text-sm mt-1>Flask · Django ⇄ Gunicorn · uWSGI</div>
<div op80 text-sm mt-1><b>One sync call</b> — request → response, done</div>
</div>

<div v-click="2" self-center text-2xl op60>→</div>

<div v-click="2" border="~ sky/40 rounded-lg" p-3 bg-sky:5>
<div text-lg>⚡ <b>ASGI</b> <span op60 text-sm>— 2016–, born from Django Channels</span></div>
<div mt-2 text-sm><code>async def app(scope, receive, send)</code></div>
<div op80 text-sm mt-1>Same decoupling, <b>async events</b></div>
<div op80 text-sm mt-1>WebSockets · streaming · long-lived connections</div>
</div>

</div>

<div v-click="3" mt-6 text-xl op90 text-center>

**One call → a conversation of events**

</div>

<!-- Because this isn't a new idea. Back in 2003 — PEP 333 — Python standardized WSGI, the same contract with the same motivation, for the synchronous world. One function, environ and start_response, and that's why Flask runs on Gunicorn, uWSGI, whatever — twenty years of any framework on any server. But WSGI's shape is one synchronous call per request: request in, response out, done. And that shape simply can't express a WebSocket, or a response that streams over time, or any long-lived connection — there's no place in the contract for "and then, later, another message." So when Django Channels needed exactly those things, ASGI grew out of that work as WSGI's async successor: same decoupling, but the single call became a conversation of events. That's the contract we'll use all day. I won't go deeper into WSGI — the point is just the lineage: this boundary has been earning its keep for two decades. -->

---
layout: statement
---

## We take this decoupling for granted.

<div mt-8 text-2xl op80 v-click="1">

🤔 How far can the **"server" side** be stretched?

</div>

<!-- And honestly? We take this completely for granted. You pick a server off a list, it works, you never think about it again. But if the contract really is solid — if the app truly doesn't know or care who's calling it — then a fun question appears: how far can you stretch the server side before something breaks? That question is the rest of this talk. -->

---
layout: section
---

# ⚡ ASGI in 90 seconds

<div mt-4 op70>
<code>scope</code>, <code>receive</code>, <code>send</code>
</div>

<!-- To answer it, we need to know exactly what the contract says. Ninety seconds, three words. If you know ASGI cold this is a refresher; if you don't, this is genuinely all you need for the rest of the talk. -->

---

# An ASGI app is one async callable

<div mt-2 text-lg>

The entire interface: **one coroutine, three arguments**

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
📋 <b><code>scope</code></b><br><span op80>connection type · path · headers</span>
</div>
<div border="~ violet/40 rounded-lg" p-3 bg-violet:8>
📥 <b><code>receive()</code></b><br><span op80>async <b>inbox</b></span>
</div>
<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
📤 <b><code>send()</code></b><br><span op80>async <b>outbox</b></span>
</div>

</div>

<!-- Here's the entire app-facing surface of ASGI. It's one async function taking three things. Scope is a dict that describes the connection — what kind it is, the path, the headers, that sort of metadata. receive is an async callable; you await it to pull the next event from the client — a chunk of request body, for example. And send is an async callable; you await it to push an event out — your response status, your headers, your body. That's it. Think of receive as an inbox and send as an outbox, both async. A server's whole job is to build the scope and to implement receive and send. Remember that sentence. -->

---
clicks: 6
---

# You don't even need a framework

<div class="framework-grid" mt-3 :style="{ gridTemplateColumns: $clicks >= 5 ? '1fr 1fr' : '1fr 0fr' }">

<div class="framework-cell">

<div text-sm mb-1>A complete ASGI app — <b>no framework</b></div>

<<< @/samples/raw-asgi/raw_asgi.py py {*|1|2|3-7|8-11|*}

</div>

<div class="framework-cell" :class="$clicks >= 5 ? 'op100' : 'op0'">

<div text-sm mb-1>…and Uvicorn serves it, no questions asked</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uvicorn raw_asgi:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

<div v-click="6">

```shell
$ curl -i localhost:8000
HTTP/1.1 200 OK
content-type: text/plain

Hello, PyCon KR!
```

</div>

</WindowMockup>

<div v-click="6" mt-3 text-center text-lg leading-tight>🖥️ <b>Whoever calls <code>app(...)</code> = the server</b></div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
.framework-grid {
  display: grid;
  gap: 1.25rem;
  transition: grid-template-columns 700ms ease;
}
.framework-cell {
  min-width: 0;
  overflow: hidden;
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- To really demystify it, here's a complete ASGI application with no framework at all. It checks that the connection is HTTP, then sends two events: a response-start with the status and headers, and a response-body with the bytes. That is a whole working web app — and it is worth walking through, because every line is doing something a server cares about. [click] The signature: one async callable, three arguments, exactly the contract we just learned. [click] It checks the connection type, because an ASGI app can be handed HTTP, WebSocket, or lifespan. [click] Then the first event out: response.start, carrying the status and the headers. [click] And the second: response.body, carrying the bytes. Two sends, and the response is complete. [click] So let's run it: I point Uvicorn at it exactly the way I pointed it at FastAPI a few slides ago, and it starts up without complaint. [click] Now curl it — and there's a real HTTP response, headers and all. Uvicorn cannot tell the difference; it never asks what framework this is, because there is no framework. It just calls the callable. One aside for the curious: Uvicorn also logs that the lifespan protocol appears unsupported, because our eleven lines ignore lifespan entirely — hold that thought, we come back to it when we build the bridge. So Starlette and FastAPI, for all their routing and dependency injection and validation, ultimately compile down to exactly this: a callable that reads scope and talks through receive and send. And now flip it around, because this is the sentence the whole talk stands on: whoever calls this function — whoever builds the scope and passes in receive and send — that thing IS the server. By the way, this exact file lives in the slides repo with a test suite, so what you're reading is verified working code. -->

---
clicks: 2
---

# So what does a framework give you?

<div class="fw-grid" mt-3 :style="{ gridTemplateColumns: $clicks >= 1 ? '1fr 1fr' : '1fr 0fr' }">

<div class="fw-cell">

<div text-sm mb-1>FastAPI — routing, validation, docs…</div>

<<< @/samples/fastapi-is-asgi/app.py py {*}

</div>

<div class="fw-cell" :class="$clicks >= 1 ? 'op100' : 'op0'">

<div text-sm mb-1>…and <code>app</code> is <b>still just the callable</b></div>

```py {*}
>>> callable(app)
True

>>> signature(type(app).__call__)
(self, scope, receive, send)

>>> await app(scope, receive, send)
```

<div v-click="2" mt-3 text-center text-lg leading-tight>

🎁 A framework is a **nicer way to write the same callable**

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 19px;
  --slidev-code-line-height: 1.5;
}
.fw-grid {
  display: grid;
  gap: 1.25rem;
  transition: grid-template-columns 700ms ease;
}
.fw-cell {
  min-width: 0;
  overflow: hidden;
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- So if eleven lines is a working app, what is FastAPI for? All the things you actually want: routing, request parsing, validation, dependency injection, generated docs. You write decorated functions instead of dictionaries. [click] But here's the part that matters today — the thing FastAPI hands you, this app object, is not some special framework construct that a server has to know about. It defines __call__ with exactly three parameters: scope, receive, send. It IS an ASGI application, in the same sense our eleven lines were. You can await it directly, no server anywhere, and it answers. That's checked by a test in the repo, by the way — it reads the signature off type(app).__call__ and calls the object by hand. [click] So a framework is not a different kind of thing from what we just wrote. It is a much nicer way to write the same callable. Which means anything that can call our eleven lines can call FastAPI too — hold that thought. -->

---

# Three connection types, one shape

<div mt-4 text-lg>

`scope["type"]` — three protocols, **one loop**:

</div>

<div grid="~ cols-3" gap-4 mt-6 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-4 bg-sky:5>
<div text-xl mb-1>🌐 <b><code>"http"</code></b></div>
<span op80>request → response</span>
</div>

<div v-click="2" border="~ violet/40 rounded-lg" p-4 bg-violet:5>
<div text-xl mb-1>🔌 <b><code>"websocket"</code></b></div>
<span op80>long-lived, two-way<br>
<span op60>(→ appendix)</span></span>
</div>

<div v-click="3" border="~ amber/40 rounded-lg" p-4 bg-amber:5>
<div text-xl mb-1>♻️ <b><code>"lifespan"</code></b></div>
<span op80>startup / shutdown</span>
</div>

</div>

<div v-click="4" mt-8 text-center text-xl>

Today: **`http`** + `lifespan` ✅

</div>

<!-- ASGI carries three kinds of connection, and the app figures out which one by reading scope type. The nice part is they all share the same receive-and-send loop, so once you understand one, the others are variations. HTTP is request-response. WebSocket is the long-lived two-way one — same loop, different event names. And lifespan is the odd one — it's not a client connection at all, it's the app's own startup and shutdown signal. Now, to keep this talk focused, I'm going to do everything through HTTP, with a quick look at lifespan. WebSocket works exactly the same way in spirit, and I've put the details in appendix slides at the end — happy to walk through them in Q&A. HTTP alone carries the whole idea. -->

---
clicks: 1
---

# Demo, step 1: the normal case

<div class="demo-grid" mt-3 :style="{ gridTemplateColumns: $clicks >= 1 ? '1fr 1fr' : '1fr 0fr' }">

<div class="demo-cell">

<div text-sm mb-1><code>main.py</code> <span op70>— the demo app (abridged)</span></div>

```py {*}
app = FastAPI()

@app.get("/")
async def index() -> str:
    return PAGE   # the frontend page

@app.get("/api/runtime")
async def runtime() -> str:
    return f"Python {py} on {sys.platform}"
```

</div>

<div class="demo-cell" :class="$clicks >= 1 ? 'op100' : 'op0'">

<div text-sm mb-1>…run it, open the page, click the button</div>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ uv run uvicorn main:app
INFO:  Uvicorn running on
       http://127.0.0.1:8000
```

</WindowMockup>

<div mt-3>

<WindowMockup title="http://127.0.0.1:8000" light>

<div p-3>
<div text-base font-bold mb-2>Runtime</div>
<button border="~ gray/40 rounded" px-2 py-1 text-xs bg-gray:10>Where am I running?</button>
<div mt-2 font-mono text-sm>Python 3.12 on <b>darwin/arm64</b> 🖥️</div>
</div>

</WindowMockup>

</div>

</div>

</div>

<div mt-2 text-center text-sm op70>📎 <a href="https://github.com/whitphx/runtime-agnostic-asgi-app-example" target="_blank">github.com/whitphx/runtime-agnostic-asgi-app-example</a></div>

<style>
* {
  --slidev-code-font-size: 22px;
  --slidev-code-line-height: 1.5;
}
.demo-grid {
  display: grid;
  gap: 1.25rem;
  transition: grid-template-columns 700ms ease;
}
.demo-cell {
  min-width: 0;
  overflow: hidden;
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- Here's the app itself — step one of three. It's a handful of FastAPI routes: one serves the page, one reports where Python is running, one bumps a counter so we have some in-process state to watch. Nothing you haven't written before. [click] And here it is in its natural habitat: uvicorn app.main:app, open localhost:8000, and there's a little page with a button. Click it, and the app answers: Python 3.12 on darwin arm64 — my laptop. A real HTTP request went over a real socket to a real server process. Nothing surprising. The whole repo is at that link — one FastAPI app and the three ways we're going to run it today. Keep the button in mind. Its answer is about to get weird. -->

---

# What's actually running where — step 1

<div mt-6>

<ServerStackFigure />

</div>

<div v-click="1" mt-4 text-center text-xl>

The server half = **Uvicorn**. Watch that box 👀

</div>

<!-- Before we break anything, let's map what just happened, top-down. At the top, your app — main.py. Below it, Uvicorn, doing the whole server half: it accepts TCP connections, parses the HTTP bytes, builds a scope, and calls the app with scope, receive, and send — the interface we just learned. Both live in a CPython process on some machine. And at the bottom, the browser page, talking to it over the actual network. Completely ordinary. But keep your eye on Uvicorn's box — the sky-blue one — because the entire rest of this talk is about what else can sit in it. -->

---
layout: statement
---

## The contract has no sockets in it.

<div mt-8 text-2xl op80>

<v-clicks>

A **server** is anything that can build a `scope` and call the app.

🤔 So… do we even need a server *machine*?

</v-clicks>

</div>

<!-- But wait. Look back at what the contract actually said. A dict. Two async callables. Nowhere — nowhere — does ASGI mention sockets, or ports, or processes, or Linux. Which means a "server" is anything that can build a scope and call the app. Anything. And once you say it like that, a slightly unhinged question becomes very reasonable: do we even need a server machine? -->

---
layout: section
---

# 🌐 The extreme case

<div mt-4 op70>
A server inside your browser
</div>

<!-- Let's find out, by taking the server side somewhere it very obviously does not belong: inside the browser. -->

---

# The enabler: Pyodide

<img src="/pyodide-logo.svg" alt="Pyodide" absolute top-10 right-12 h-16 />

<div mt-4 text-lg>

[Pyodide](https://pyodide.org/): **CPython compiled to WebAssembly** — real Python, in a browser tab

</div>

<div grid="~ cols-[2fr_1fr]" gap-8 mt-6 items-center>

<div>

<v-clicks>

- No backend, no install — **just a web page**
- Python ⇄ JavaScript, direct calls
- `asyncio` on the browser's event loop
- ⚠️ **Single thread** · no sockets

</v-clicks>

</div>

<div v-click="5" border="~ gray/40 rounded-lg" p-3 bg-gray:5 text-center>
<div text-xs op70 mb-2>Browser tab</div>
<div border="~ violet/40 rounded" p-2 bg-violet:5 text-sm>🐍 Pyodide<br><span text-xs op80>CPython on WASM</span></div>
<div text-xl op50 my-1>⇅</div>
<div border="~ sky/40 rounded" p-2 bg-sky:5 text-sm>🌐 JavaScript / DOM</div>
</div>

</div>

<div v-click="6" mt-4 text-xl text-center>

Runs the **app half** of ASGI. The server half? **Missing.**

</div>

<div absolute bottom-3 right-4 text-xs op40>
Pyodide logo by the Pyodide project, CC BY 4.0
</div>

<!-- One slide on the enabler, because it deserves at least that. Pyodide is CPython — the real thing — compiled to WebAssembly, so it runs inside a browser tab. asyncio works. You can install pure-Python packages with micropip. Python and JavaScript can call each other directly, and Python's event loop rides on the browser's. One constraint to remember: single interpreter, single thread, and no sockets — the browser sandbox doesn't hand those out. So here's where that leaves us. Pyodide can absolutely run the app half of ASGI — FastAPI is just Python. But the server half? There's no Uvicorn in a browser tab. That half is simply missing. We'll have to provide it ourselves. -->

---

# Python, called from JavaScript

<div mt-1 text-sm>The whole boundary in one file — Python source as a <b>string</b>, the value comes back:</div>

<<< @/samples/pyodide-hello/hello.mjs js {*|1,3|5-9|11|*}

<div v-click="4" mt-2>

<WindowMockup title="Terminal" dark codeblock>

```shell
$ node hello.mjs
Python 3.13.2 on emscripten
```

</WindowMockup>

</div>

<style>
* {
  --slidev-code-font-size: 16px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Concretely, what does calling Python from JavaScript look like? This is the whole thing. Import loadPyodide, await it — that downloads the WebAssembly build and starts an interpreter. Then runPythonAsync takes Python source as a plain JavaScript string; here I import sys and evaluate an f-string. And the last expression's value comes straight back across the boundary as a JavaScript string, which I can just console.log. [click] Run it with node, and there it is: Python 3.13.2 on emscripten — emscripten being the WebAssembly platform, which is Python telling us it is not on your operating system any more. That is the entire trick the rest of this talk builds on: JavaScript can start Python, hand it code, and get values back. -->

---


# Demo, step 2: the same app, no server

<div mt-2 flex justify-center>

<WindowMockup title="Live demo" light w-160>

<div p-5 text-lg>

<v-clicks>

- 📄 Static page + Pyodide + **the same `main.py`**
- 🖱️ "Where am I running?" → `Python 3.14 on emscripten/wasm32` 🤯
- 🕵️ Network tab: **silent**
- ✂️ Kill the file server → **still answering**

</v-clicks>

</div>

</WindowMockup>

</div>

<div v-click="5" mt-4 text-center text-xl>

Responses made **inside the tab** — nothing leaves it.

</div>

<!-- OK, live demo time — step two. [DEMO] I have a static page here, served by a dumb file server — no backend logic at all. It boots Pyodide in a Web Worker and loads the exact same main.py from step one. Same page appears. Now I click the button… and look at the answer: Python 3.14 on emscripten wasm32. That's the app telling us it's running inside the browser. Watch the Network tab while I click again — nothing. No request leaves the page. And for the finale: I kill the file server entirely… and the app keeps answering. There is no server anymore. The response is being produced by Python running right next to the JavaScript, in the same tab. OK — back to slides. Let's see what's in there.

[DEMO SETUP] Serve the repo root, not step2-browser/ — the worker loads ../main.py by relative fetch, and from inside the subdirectory that path falls outside the document root and the worker never boots. Open /step2-browser/. Also let Pyodide finish booting before killing the file server; the runtime and packages come from the CDN, but app/main.py and bridge.py come from that server. -->

---
clicks: 1
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">1</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">2</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned /></template>
  <template #browser><BrowserStackFigure /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 1 ? 'op100' : 'op0'">

One box swapped — **the bridge plays Uvicorn's role** 🛠️

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
.step-swap {
  position: relative;
  display: inline-block;
}
.step-swap > span {
  transition: opacity 700ms ease 250ms;
}
.step-swap > .step-two {
  position: absolute;
  left: 0;
}
</style>

<!-- Here's the step-one picture again — app on top, Uvicorn as the server half, the page at the bottom, over the network. Now watch. [click] The browser version fades in next to it. Compare them layer by layer, top-down: the app — same file, unchanged, byte for byte. scope, receive, send — same interface. The page at the bottom — same UI, still issuing ordinary requests. The differences: the machine became a Web Worker running Pyodide, the network became postMessage… and Uvicorn's sky-blue box now holds bridge.py, about forty-five lines of our code. That's the whole trick — one box swapped, and the bridge is playing Uvicorn's role. Keep this top-down layering in mind; we'll see it again with Streamlit later. -->

---
layout: statement
---

## Something in that tab is<br>**impersonating Uvicorn**.

<div mt-8 text-2xl op80 v-click="1">

What does the impersonation take? Let's write it. ✍️

</div>

<!-- So that's the trick, stated honestly: something in that tab is impersonating Uvicorn. And the best part of this whole topic is that the impersonation is small enough to read in a talk. So let's write it. -->

---
layout: section
---

# 🛠️ Building the bridge

<div mt-4 op70>
Impersonating Uvicorn, one piece at a time
</div>

<!-- This is the heart of the talk. Everything on the next few slides is real code from the demo repo — bridge.py, slightly trimmed for the screen. -->

---

# The route of one request

<div mt-6 flex="~ col" items-center gap-2 text-center>

<div flex="~ gap-2" items-center justify-center w-full>
<div v-click="1" border="~ teal/40 rounded-lg" p-2 bg-teal:8 text-sm flex-1>📄 <b>Frontend JS</b><br><span op70 text-xs>an ordinary HTTP request</span></div>
<div v-click="2" text-lg op50>→</div>
<div v-click="2" border="~ teal/40 rounded-lg" p-2 bg-teal:8 text-sm flex-1>🧰 <code>appFetch()</code><br><span op70 text-xs>same signature as <code>fetch()</code></span></div>
<div v-click="3" text-lg op50>→</div>
<div v-click="3" border="~ gray/40 rounded-lg" p-2 bg-gray:8 text-sm flex-1>📬 <code>postMessage</code><br><span op70 text-xs>method, path, headers, body</span></div>
<div v-click="4" text-lg op50>→</div>
<div v-click="4" border="~ sky/40 rounded-lg" p-2 bg-sky:8 text-sm flex-1>🌉 <code>dispatch(app, request)</code><br><span op70 text-xs>bridge.py, in Pyodide</span></div>
</div>

<div v-click="5" text-2xl op60 my-2>⇅</div>

<div v-click="5" border="~ emerald/40 rounded-lg" px-6 py-3 bg-emerald:8 w-max max-w-full whitespace-nowrap>
🐍 <code>await app(scope, receive, send)</code><br><span op70 text-sm>the unchanged FastAPI app</span>
</div>

<div v-click="6" mt-3 text-xl>

Response: **same road back** 🔁

</div>

</div>

<!-- Before the code, the route of one request, end to end. The frontend JavaScript issues an ordinary HTTP request. That lands in a little function called appFetch, which has the exact same signature as fetch, except its "server" is a Web Worker. It posts the method, path, headers, and body to the worker as a plain message. Inside the worker, bridge.py's dispatch function picks it up… and makes one ASGI call: await app with scope, receive, and send. The app processes it — routing, validation, all the FastAPI machinery — and the response rides the same road back: bridge, message, a Response object, the page. Two functions on the JS side, one function on the Python side. Now let's zoom into that one Python function. -->

---

# ① Turn the request into a `scope`

<div mt-1 text-lg>

From `bridge.py` — JS request → **the dict ASGI specifies**:

</div>

```py {*|3|6-8|10-12|*}
async def dispatch(app, request):
    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": request["method"],
        "scheme": "http",
        "path": request["path"],
        "raw_path": request["path"].encode(),
        "query_string": request["query"].encode(),
        "headers": [(k.lower().encode(), v.encode())
                    for k, v in request["headers"]],
    }
```

<div v-click="5" mt-3 text-lg text-center>

Filling this dict correctly **is** what "implementing the server" means

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step one: build the scope. JavaScript handed us a plain object — method, path, query, headers. Our job is to reshape it into the dict the spec describes. Most of it is mechanical: the type is the string http, the method and path come straight across. But look at the details, because this is where the spec stops being abstract. The path is a str while the query string is bytes. Headers are not a dict — they're a list of two-byte-string tuples, with the names lowercased. ASGI is picky about every one of these. And that pickiness is the point: filling this dict correctly is what implementing the server actually means. You never learn this from using FastAPI. You learn it the moment you stand on the other side of the contract. -->

---

# ② Wire up `receive` and `send`

<div mt-1 text-lg>

`receive`: **body in** · `send`: **response out**

</div>

```py {*|1-3|5-11|13-14|*}{maxHeight:'340px'}
    async def receive():                 # 📥 the app pulls the body
        return {"type": "http.request",
                "body": request_body, "more_body": False}

    status, headers, chunks = None, [], []
    async def send(event):               # 📤 the app pushes the response
        nonlocal status, headers
        if event["type"] == "http.response.start":
            status, headers = event["status"], event["headers"]
        elif event["type"] == "http.response.body":
            chunks.append(bytes(event.get("body", b"")))

    await app(scope, receive, send)      # ← run the app!
    return {"status": status, "headers": headers, "body": b"".join(chunks)}
```

<div v-click="4" mt-2 text-base text-center>

`scope` + `receive` + `send` + `await app(...)` = **a server**

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step two: the two callables. receive is how the app asks for the request body — we hand back one http.request event carrying the bytes JavaScript gave us, more_body false, and if the app asks again we tell it the client's gone. send is the reverse: the app emits its response in pieces — first http.response.start with the status and headers, then http.response.body events with the bytes. We just listen and stash. And then the punchline, one line: await app with our scope, our receive, our send. When it returns, we assemble the response and hand it back to JavaScript. That's it. That's a complete HTTP server — no sockets, no parser, no port. Just a function that fulfills a contract. -->

---

# ③ Call it from JavaScript

<div mt-1 text-sm><code>worker.js</code> — once Pyodide has booted, reach in for <code>app</code> and <code>dispatch</code>:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/worker.js#slide-call js {*}

<div mt-2 text-sm>…then every request is one call across the boundary:</div>

<<< @/samples/runtime-agnostic-asgi-app/step2-browser/worker.js#slide-dispatch js {*}

<div mt-3 text-center text-lg>

Python objects are **just JS values** — <code>await</code> a coroutine, get a <code>Promise</code>

</div>

<style>
* {
  --slidev-code-font-size: 17px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- Fair question at this point: we've written Python, but who calls it? This is the JavaScript side, inside the Web Worker. Boot Pyodide, run two import statements, and then the interesting bit: pyodide.globals.get pulls the app and our dispatch function straight out of the Python namespace and hands them back as ordinary JavaScript values. From there, calling Python is just calling a function — dispatch(app, request) — and because dispatch is a coroutine, JavaScript awaits it like any Promise. toPy converts the request object on the way in, toJs converts the response dict on the way out. That's the whole boundary. And remember appFetch from the route diagram: it has fetch's exact signature, posts the request here, and awaits what comes back — so the page issues what looks like a completely normal HTTP call and never learns that Python answered it. -->

---

# The boundary tax: JS ↔ Python

<div mt-1 text-lg>

The bridge sits *on* the [Pyodide FFI](https://pyodide.org/en/stable/usage/type-conversions.html) — **the bugs live in the conversions**:

</div>

<div grid="~ cols-2" gap-4 mt-4 text-sm>

<div v-click="1" border="~ sky/40 rounded-lg" p-3 bg-sky:8>
🟦→🐍 <b>Proxies, not values</b><br>
<span op80><code>JsProxy</code>, not <code>dict</code> → <code>.to_py()</code></span>
</div>

<div v-click="2" border="~ violet/40 rounded-lg" p-3 bg-violet:8>
📦 <b>Binary bodies</b><br>
<span op80><code>Uint8Array</code> → <code>bytes()</code> — <b>every conversion copies</b></span>
</div>

<div v-click="3" border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
🐍→🟦 <b>Going back: <code>to_js()</code></b><br>
<span op80><code>dict</code> → JS <code>Map</code> by default! (<code>dict_converter</code>)</span>
</div>

<div v-click="4" border="~ amber/40 rounded-lg" p-3 bg-amber:8>
⏳ <b>Async composes</b><br>
<span op80>coroutine ⇄ <code>Promise</code> — loops interleave</span>
</div>

</div>

<div v-click="5" mt-5 text-center text-xl>

Uvicorn's network layer: sockets. **Ours: type conversion** 🔁

</div>

<!-- Now, one layer real servers don't have: the foreign function interface between JavaScript and Python. And I can tell you from years of this — the bugs live here. Four things to know. JS objects arrive in Python as proxies, not dicts — convert explicitly. Binary bodies come as Uint8Arrays, and every conversion copies the buffer — that matters when someone uploads a fifty-megabyte file. Going the other way, to_js turns a dict into a JavaScript Map by default, not a plain object — there's a dict_converter option, and every Pyodide developer hits this exactly once. And one pleasant surprise: async composes beautifully — JS can await a Python coroutine as a Promise, and the two event loops interleave without drama. So if Uvicorn's network layer is sockets and parsers, ours is type conversion. Different plumbing, same role in the stack. -->

---

# Lifespan: the app expects a boot signal

<div mt-1 text-lg>

Not a client connection — **the app's boot/teardown protocol**. The server drives it; so must we:

</div>

```py {*|2-4|6-9|11-13|*}{maxHeight:'320px'}
async def run_lifespan(app):
    scope = {"type": "lifespan"}
    inbox = asyncio.Queue()
    inbox.put_nowait({"type": "lifespan.startup"})

    async def receive():
        return await inbox.get()
    async def send(event):
        ...  # await "lifespan.startup.complete" before serving

    # runs in the background for the whole app lifetime
    asyncio.ensure_future(app(scope, receive, send))
    # on teardown: inbox.put_nowait({"type": "lifespan.shutdown"})
```

<div v-click="4" mt-2 text-base text-center>

⚠️ Skip it → `lifespan=` hooks (DB pools, models…) **silently never run**

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- One more protocol, because skipping it is the classic bridge bug: lifespan. There's no client involved — it's how the app gets told "you're starting up" and "you're shutting down." It's where FastAPI runs its lifespan handlers: opening database pools, loading models, warming caches. Uvicorn drives this when the process starts; our bridge has to drive it when the page loads. Same tools as before: a lifespan scope, a queue, receive and send. We push a startup event, wait for the app to answer startup-complete before serving any request, and keep the whole thing running as a background task until teardown. If you forget this, everything looks fine — until someone's database pool is mysteriously never initialized, and they spend an afternoon finding out why. Don't skip lifespan. -->

---
layout: statement
---

## `bridge.py`: ~45 lines.<br>The app **never noticed**.

<div mt-8 text-2xl op80 v-click="1">

But a tidy demo is not proof. 🧐<br>Does the contract survive a **real framework**?

</div>

<!-- So step back and look at what we built. Forty-five lines of Python. No sockets, no HTTP parsing, no server process — and a full FastAPI app runs on top of it, completely unaware that anything unusual is happening. The interface held. But let's be honest with ourselves: a demo app with three endpoints is a tidy little world. Real frameworks are messy. Static files, sessions, realtime updates, state everywhere. Does the contract survive contact with one of those? -->

---
layout: section
---

# 🏭 The production proof

<div mt-4 op70>
Streamlit in the browser
</div>

<!-- It does — and I can say that with some confidence, because I've shipped it. Twice. -->

---

# First: what is Streamlit?

<div grid="~ cols-[1fr_1fr]" gap-6 mt-3 items-start>

<div>

<div text-sm mb-1>Pure Python — <b>no HTML, no JS, no frontend build</b>:</div>

<<< @/samples/streamlit-demo/app.py py {*}{maxHeight:'200px'}

<div v-click="1" mt-2>

<WindowMockup title="localhost:8501" light padding="0.4rem">

<img src="/streamlit-demo.png" alt="The demo app running: a Sales dashboard title, a Rows slider, and a line chart" style="max-height: 168px; width: auto;" />

</WindowMockup>

</div>

</div>

<div v-click="2" class="w-full text-sm">

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🖥️ Server machine — CPython</div>
<div class="border border-emerald-400/40 rounded-lg p-2 bg-emerald-400/10 text-center leading-tight">
🐍 <b>Your script</b><br><span class="text-xs op80">the code above</span>
</div>
<div class="text-center text-xs op60 my-0.5">⇅</div>
<div class="border border-violet-400/40 rounded-lg p-2 bg-violet-400/5 text-center leading-tight">
🎈 <b>Streamlit server</b><br><span class="text-xs op80">a Python HTTP server</span>
</div>
</div>

<div class="text-center text-xs op60 my-0.5">⇅ HTTP + WebSocket</div>

<div class="border border-gray-400/40 rounded-xl p-2 bg-gray-400/5">
<div class="text-center text-xs op60 mb-1">🌐 Browser</div>
<div class="border border-teal-400/40 rounded-lg p-2 bg-teal-400/10 text-center leading-tight">
📄 <b>Bundled SPA</b><br><span class="text-xs op80">shipped inside the package</span>
</div>
</div>

<div v-click="3" mt-6 text-center text-lg>

`pip install streamlit` ships<br>**the server *and* its frontend**<br>
<span text-base op80>the same shape as our demo app 👀</span>

</div>

</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.5;
}
</style>

<!-- Before I show you Stlite, thirty seconds on what Streamlit actually is, because the architecture is the part that matters today. You write a plain Python script — that's it. No HTML, no JavaScript, no frontend build step. Call st.title, st.slider, st.line_chart, and [click] you get this — an interactive dashboard, and dragging that slider re-runs the script and redraws the chart. [click] So how does a script become a web page? When you run streamlit run, it starts an HTTP server, written in Python, in your process. That server hands the browser a JavaScript single-page app — and that frontend isn't something you built or fetched from a CDN, it's shipped inside the pip package. The SPA then talks back to the Python server over HTTP and a WebSocket. [click] That's the part I want you to hold onto: one Python package contains both halves of a web application — the server and the frontend it serves. And look at the picture — your code on top, a Python HTTP server under it, a frontend page in the browser talking over the network. That's exactly the shape we spent the first half of this talk taking apart. Which raises the obvious question: if we could move our demo app's server into the browser, could we do it to this one? -->

---

# Real frameworks, really in the browser

Whole Python web **UI frameworks** have been ported to run on Pyodide:

<div mt-2 text-sm>

| Framework | In-browser version | Server stack |
| --------- | ------------------ | ------------ |
| Streamlit | <img src="/stlite.svg" alt="Stlite" inline h-5 /> [Stlite](https://github.com/whitphx/stlite) (me) | Starlette — **ASGI** <span op70>(since 1.57)</span> |
| Shiny for Python | [Shinylive](https://shiny.posit.co/py/docs/shinylive.html) (Posit) | Starlette — **ASGI** |
| marimo | [WASM notebooks](https://docs.marimo.io/guides/wasm/) | Starlette — **ASGI** |
| Panel (HoloViz) | [`panel convert`](https://panel.holoviz.org/how_to/wasm/index.html) | Bokeh / Tornado |
| Gradio | [Gradio-Lite](https://github.com/gradio-app/gradio-lite) <span op60>(me — now unmaintained)</span> | FastAPI — **ASGI** |

</div>

<div v-click="1" mt-3 text-lg>

**Heavyweight**: static assets · sessions · state · realtime

</div>

<div v-click="2" mt-2 text-xl>

Each needs a **server half** in the browser — **ASGI is the right shape** 💡

</div>

<!-- Because this pattern isn't just my demo — whole Python UI frameworks have been ported into the browser. Stlite is mine, for Streamlit. Posit built Shinylive. marimo ships WASM notebooks. Panel has a convert command that does the same thing. And I worked with the Gradio team on Gradio-Lite, though that one's unmaintained now — the WASM work moved into Gradio itself. Look at the right-hand column, because that's the interesting part: almost all of them are ASGI underneath. Shiny sits on Starlette, Gradio on FastAPI, marimo on Starlette — and Streamlit joined them in 1.57, when it swapped Tornado out for Starlette and Uvicorn. Panel is the holdout, still on Bokeh's Tornado server. And these are heavyweight frameworks: static assets, sessions, per-user state, realtime UI updates. Nothing like a three-endpoint demo. Every one of them needed exactly what we just built — a server half living in the browser — and the standard shape for that is ASGI. -->

---
clicks: 1
---

# Standard Streamlit vs. Stlite

<StackCompare mt-2 :columns="[
  { key: 'streamlit', label: 'Standard Streamlit' },
  { key: 'stlite', label: 'Stlite', hidden: $clicks < 1 },
]">
  <template #streamlit><StreamlitStackFigure aligned /></template>
  <template #stlite><StliteStackFigure /></template>
</StackCompare>

<div class="punchline" mt-2 text-center text-lg :class="$clicks >= 1 ? 'op100' : 'op0'">

Same app, same Streamlit — **only the server half and the runtime change** 🎈

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
</style>

<!-- Same picture as the demo app, with a much bigger passenger on top. On the left, standard Streamlit: your script, the Streamlit server running it, Uvicorn underneath turning HTTP into ASGI calls, all on CPython on some machine — and the React frontend in the visitor's browser over the network. [click] And here's Stlite. Read the rows across. Your script: same. The Streamlit server, with its ScriptRunner and all its state: same — that's the whole point, it's the real Streamlit, not a reimplementation. scope, receive, send: same interface. The frontend at the bottom: the same bundled React SPA. What changed is the two layers we've been swapping all talk — Uvicorn becomes Stlite's ASGI bridge, CPython becomes Pyodide in a Web Worker, and the network becomes message passing inside the page. Same swap as our forty-five-line demo, just carrying a whole framework. -->

---
layout: statement
---

## The app doesn't care **who calls it**.

<div mt-8 text-2xl op80 v-click="1">

Then the browser can't be the only unusual caller… 😏

</div>

<!-- So here's where we've landed: the app genuinely does not care who calls it. Uvicorn, forty-five lines of bridge, doesn't matter. And once you really believe that sentence, you start looking around for other unusual callers. Because the browser can't possibly be the only one. -->

---
layout: section
---

# ☁️ Full circle

<div mt-4 op70>
The same stack, back on the server — at the edge
</div>

<!-- And here's my favorite one, because it closes a loop. -->

---

# Cloudflare Workers run Python — on Pyodide

<div mt-8 text-xl leading-13>

<v-clicks>

- ☁️ **Cloudflare Workers** — serverless at the edge, on **workerd** (JS/WASM)
- 🐍 **Python Workers = Pyodide** — the same WASM CPython, now *server-side*
- 🔁 **Full circle** — what V8 did for JS, workerd does for this Python stack
- 🧰 **SDK `asgi` module** — `bridge.py`'s production-grade sibling

</v-clicks>

</div>

<!-- Cloudflare Workers are serverless functions running on Cloudflare's edge network, on a runtime called workerd — it's built on V8, it speaks JavaScript and WebAssembly. And when Cloudflare added Python support, guess how they did it. Pyodide. The exact same WebAssembly CPython from our browser story — except now it's running server-side, on the edge. I love this because it rhymes with history: V8 took browser-born JavaScript and put it on the server, and now workerd is doing the same thing to the browser-born Python stack. And here's the part that matters for us: their SDK ships an asgi module — a production-grade sibling of our bridge.py — whose job is translating JavaScript Request objects into ASGI calls. Sound familiar? -->

---

# Demo, step 3: the entire entrypoint

<div mt-2 text-lg>

The whole file — and `src/main.py` = **a symlink to step 1's app**:

</div>

<<< @/samples/runtime-agnostic-asgi-app/step3-cloudflare/src/entry.py py {*|1,6|9-13|*}{maxHeight:'320px'}

<div v-click="4" mt-3 text-center>

<a href="https://runtime-agnostic-asgi-app.whitphx.workers.dev" target="_blank">runtime-agnostic-asgi-app.whitphx.workers.dev</a> → `Python 3.13 on emscripten/wasm32` — **from the edge** 🌍

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- Step three of the demo. This is the entire Cloudflare entrypoint — I'm not hiding anything, this is the whole file. Import the SDK's asgi module. Import the app — and note, src/main.py is literally a symlink to the same app/main.py from steps one and two. And in the fetch handler, one line: hand the app to asgi.fetch. Their bridge does what ours did — builds the scope, wires receive and send — except production-grade. It's deployed, you can hit that URL right now. Click the button and it says: Python 3.13 on emscripten wasm32 — answered from a Cloudflare data center near you. Same app. Third runtime. Zero changes.

[DEMO SETUP] Deploy well before the talk and hit the URL once to warm it. For about a minute after a deploy, requests intermittently come back as edge errors while the new version propagates, and a cold isolate takes around three seconds against roughly one second warm. -->

---
clicks: 1
---

<h1>What’s actually running where — step <span class="step-swap"><span :class="$clicks >= 1 ? 'op0' : ''">2</span><span class="step-two" :class="$clicks >= 1 ? '' : 'op0'">3</span></span></h1>

<StackCompare mt-4 :columns="[
  { key: 'server', label: '① Server' },
  { key: 'browser', label: '② Browser' },
  { key: 'edge', label: '③ Edge', hidden: $clicks < 1 },
]">
  <template #server><ServerStackFigure aligned /></template>
  <template #browser><BrowserStackFigure /></template>
  <template #edge><CloudflareStackFigure /></template>
</StackCompare>

<div class="punchline" mt-4 text-center text-xl :class="$clicks >= 1 ? 'op100' : 'op0'">

Same app on top — **only the server half changes** ☁️

</div>

<style>
.punchline {
  transition: opacity 700ms ease 250ms;
}
.step-swap {
  position: relative;
  display: inline-block;
}
.step-swap > span {
  transition: opacity 700ms ease 250ms;
}
.step-swap > .step-two {
  position: absolute;
  left: 0;
}
</style>

<!-- Here are both stacks we've seen — server on the left, browser in the middle. [click] And the edge joins them. Read across the top row: the same file, three times. Read the row below it: scope, receive, send, three times. Now read the sky-blue row, and that's the only thing that moves — Uvicorn, then our forty-five-line bridge, then Cloudflare's asgi module, which I didn't write at all. Two more things worth noticing. The edge column's runtime frame says Pyodide, same as the browser: Cloudflare runs Python the same way a browser does, just in a Python Worker on their machines instead of a Web Worker on the visitor's. And the frontend went back outside over a real network, exactly like column one. Same app, three environments, and every difference lives below the interface. -->

---

# Three runtimes, one app

<div grid="~ cols-3" gap-3 mt-4 items-start>

<StackColumn
  v-click="1"
  title="① Server"
  env="your machine / cloud VM"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'Uvicorn', note: 'HTTP over TCP sockets', kind: 'caller' },
    { label: 'CPython 3.12', note: 'native process', kind: 'runtime' },
  ]"
/>

<StackColumn
  v-click="2"
  title="② Browser"
  env="each visitor's tab"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'bridge.py', note: 'postMessage from the page', kind: 'caller' },
    { label: 'Pyodide 3.14', note: 'WASM, in a Web Worker', kind: 'runtime' },
  ]"
/>

<StackColumn
  v-click="3"
  title="③ Edge"
  env="Cloudflare's network"
  :layers="[
    { label: 'app', note: 'ASGI application (FastAPI)', kind: 'app' },
    { label: 'SDK asgi module', note: 'JS Request / Response', kind: 'caller' },
    { label: 'Pyodide 3.13', note: 'WASM, on workerd', kind: 'runtime' },
  ]"
/>

</div>

<div v-click="4" mt-5 text-center text-xl op80>

**Same file** · 3 Pythons · 3 transports · **0 changes**<br>
<span v-click="5" font-bold text-sky-600>The interface holds — everything below it is swappable</span>

</div>

<!-- And here is the whole talk in one picture. Three columns, three runtimes. A server with Uvicorn on native CPython. A browser tab with our bridge on Pyodide. Cloudflare's edge with their SDK bridge, also on Pyodide. Now look at the top row: it's the same file. Literally — two of them load it and one symlinks it. It ran on Python 3.12, 3.14, and 3.13, over TCP sockets, postMessage, and JS Request objects — zero changes. Everything below the interface got swapped per environment; nothing above it moved. That's what "cut a clean interface" buys you. Not a deployment trick — a property of the architecture. -->

---

# Stlite went to the edge, too

<div mt-4 flex justify-center>

<div border="~ gray/40 rounded-xl" p-4 bg-gray:5 w-130 text-center>

<div border="~ teal/40 rounded-lg" p-3 bg-teal:8>
🌐 <b>Browser frontend</b> — the standard Streamlit React UI
</div>

<div text-lg op60 my-1>⇅ <span text-sm op70>WebSocket, over the real network this time</span></div>

<div border="~ gray/40 rounded-lg" p-3 bg-gray:8>
<div text-xs op60 mb-1>Cloudflare Python Worker</div>
<div border="~ violet/40 rounded-lg" p-2 bg-violet:8>🎈 <b>Streamlit server on Pyodide</b> — the same Stlite kernel</div>
</div>

</div>

</div>

<div mt-5 text-lg op80 text-center>

<v-clicks>

`@stlite/cloudflare` — <a href="https://github.com/whitphx/stlite/pull/2077" target="_blank">stlite#2077</a>, experimental

**Same kernel — only the caller changed** 🔁

</v-clicks>

</div>

<!-- And of course, once I saw Cloudflare running Pyodide, I had to try it with Stlite. This is stlite PR 2077 — at-stlite-slash-cloudflare, experimental. The architecture flips back to something familiar: the Streamlit React frontend runs in your browser, and it talks over a real WebSocket to… the Stlite kernel, running on Pyodide, inside a Python Worker at the edge. The same kernel that runs in a browser tab. The same ASGI bridge thinking. The only thing that changed is who's calling the app — browser events before, edge requests now. When your server half targets an interface instead of an environment, redeploying to a new environment is configuration, not a rewrite. -->

---
layout: section
---

# 🧭 When to reach for this

<div mt-4 op70>
Practical uses — and honest limits
</div>

<!-- OK. So in-browser Python web apps are possible and the architecture is sound. When would you actually want this? -->

---

# Practical applications

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📡 <b>Static-hosted demos</b><br><span op80 text-base>GitHub Pages / CDN — <b>no backend</b></span>
</div>

<div v-click="2" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
📖 <b>Runnable documentation</b><br><span op80 text-base>live, editable examples in the docs</span>
</div>

<div v-click="3" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🎓 <b>Education</b><br><span op80 text-base><b>zero setup</b> — it's just a web page</span>
</div>

<div v-click="4" border="~ emerald/40 rounded-lg" p-4 bg-emerald:5>
🔒 <b>Privacy-preserving apps</b><br><span op80 text-base>data <b>never leaves the device</b></span>
</div>

</div>

<div v-click="5" mt-5 text-center text-lg>

In production: [Streamlit Playground](https://streamlit.io/playground) · [Gradio Playground](https://www.gradio.app/playground) 🚀

</div>

<!-- Four things I keep coming back to. Static-hosted demos — ship an entire web app as files on GitHub Pages or a CDN, no backend to operate or pay for, and it scales with visitors because each visitor brings their own compute. Runnable documentation — live, editable examples sitting right in the docs. Education — teach FastAPI or Streamlit to a room of beginners with zero setup; it just runs in their tab. And privacy — everything is client-side, so the user's data never leaves their device, which is a genuine selling point for sensitive workloads. And this isn't hypothetical: the official Streamlit Playground and Gradio Playground are this exact architecture, in production, today. -->

---

# Honest limits

<div mt-4 grid="~ cols-2" gap-4 text-lg>

<div v-click="1" border="~ red/40 rounded-lg" p-4 bg-red:5>
📦 <b>Dependencies</b><br><span op80 text-base>everything downloads · <b>not every package is in the Pyodide distribution</b></span>
</div>

<div v-click="2" border="~ red/40 rounded-lg" p-4 bg-red:5>
🧵 <b>Single thread, sandboxed</b><br><span op80 text-base>no threads → <b><code>async def</code> only</b> · no raw sockets</span>
</div>

<div v-click="3" border="~ red/40 rounded-lg" p-4 bg-red:5>
🔑 <b>No safe secrets</b><br><span op80 text-base>the page is public — <b>no API keys</b></span>
</div>

<div v-click="4" border="~ red/40 rounded-lg" p-4 bg-red:5>
📥 <b>No inbound requests</b><br><span op80 text-base>no public address — <b>no webhooks</b></span>
</div>

</div>

<div v-click="5" mt-5 text-center text-xl>

**Complements** real servers — doesn't replace them 🤝

</div>

<!-- And the honest part, because this isn't magic. Dependencies: everything ships to the browser, and not everything is available. The good news is that the whole stack we've been using — FastAPI, Starlette, Pydantic, anyio — ships inside the Pyodide distribution, so it loads straight from the CDN with no PyPI round-trip. But the demo still needed one extra install: python-multipart, which FastAPI needs to parse a form. It's pure Python, no C extension in sight, and it's simply not in the distribution — so without micropip installing it, that one endpoint 500s. That's the shape of this limit: it's not "no C extensions", it's "check the distribution, then check what micropip can add." It's single-threaded and sandboxed — and here's a concrete bite: Starlette runs sync def endpoints in a thread pool, and WASM can't spawn threads, so a sync endpoint that works fine under Uvicorn dies in the browser with "can't start new thread." Every endpoint in the demo app is async def for exactly that reason. Secrets are impossible — anything in the page, the user can read. And there's no inbound networking — the tab has no public address, so no webhooks. The takeaway: this complements real servers, it doesn't replace them. Use it where the strengths line up. -->

---

# Key takeaways

<div mt-6 text-xl>

<v-clicks>

- 🧩 **ASGI = a clean interface** — your app on one side, *any caller* on the other
- ⚡ The whole contract: **`scope` · `receive` · `send`** — no sockets in it
- 🌉 **A server = anything that fulfills the contract** — Uvicorn · a tab · the edge
- 🏭 **Shipping today** — Stlite · Shinylive · marimo · the playgrounds
- 🧠 **To understand an interface, implement the other side of it**

</v-clicks>

</div>

<!-- Five things to carry out of the room. One: ASGI cuts a clean interface — your app on one side, and whoever can call it on the other. Two: the entire contract is scope, receive, and send, and it never mentions sockets, ports, or machines. Three: because of that, a server is anything that fulfills the contract — Uvicorn, forty-five lines of Python in a browser tab, or Cloudflare's edge. Four: this is shipping today — Stlite, Shinylive, marimo, and the official Streamlit and Gradio playgrounds all run on it. And five, the one to remember if you forget everything else: the best way to truly understand an interface is to implement the other side of it. -->

---

<h1>Thank you! 🙏</h1>

<div mt-6 text-2xl>
One app. Any caller. 🌐🐍
</div>

<div mt-6 grid="~ cols-[1fr_auto]" gap-8 items-center>

<div text-base flex="~ col" gap-2>

<div flex="~ gap-2" items-center>
<div i-ri-code-s-slash-line text-xl op50 />
<div><a href="https://github.com/whitphx/runtime-agnostic-asgi-app-example" target="_blank">whitphx/runtime-agnostic-asgi-app-example</a> — today's demo, all three steps</div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-github-line text-xl op50 />
<div><a href="https://github.com/whitphx/stlite" target="_blank">whitphx/stlite</a> — in-browser Streamlit · <a href="https://github.com/whitphx/stlite/pull/2043" target="_blank">#2043</a>, <a href="https://github.com/whitphx/stlite/pull/2044" target="_blank">#2044</a>, <a href="https://github.com/whitphx/stlite/pull/2077" target="_blank">#2077</a></div>
</div>

<div flex="~ gap-2" items-center>
<div i-ri-file-text-line text-xl op50 />
<div><a href="https://asgi.readthedocs.io/" target="_blank">asgi.readthedocs.io</a> · <a href="https://pyodide.org/" target="_blank">pyodide.org</a> · <a href="https://shiny.posit.co/py/docs/shinylive.html" target="_blank">Shinylive</a> · <a href="https://github.com/gradio-app/gradio/pull/4402" target="_blank">gradio#4402</a></div>
</div>

<div mt-4 w-min flex="~ gap-1" items-center>
  <div i-ri-user-3-line op50 ma text-xl />
  <div><a href="https://whitphx.info/" target="_blank" class="border-none! font-300">whitphx.info</a></div>
  <div i-ri-github-line op50 ma text-xl ml4/>
  <div><a href="https://github.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
  <div i-ri-twitter-x-line op50 ma text-xl ml4/>
  <div><a href="https://twitter.com/whitphx" target="_blank" class="border-none! font-300">whitphx</a></div>
</div>

</div>

<div flex="~ col" items-center gap-2>
<QRCode :width="140" :height="140" type="svg" data="https://slides.whitphx.info/202608-pyconkr-asgi-pyodide/"
  :dotsOptions="{ type: 'extra-rounded', color: '#36709E' }" />
<div op70 text-sm>slides.whitphx.info</div>
</div>

</div>

<!-- And that's it — one app, any caller. Thank you so much for listening. The slides are at the QR code, with all the links: the demo repo with the three steps, the Stlite PRs if you want to read a production bridge, the spec, everything. I'd love to hear what you'd build with this — please come find me, and I'm happy to take questions. And if anyone asks about WebSockets or streaming: I have appendix slides ready. Thank you! -->

---
layout: section
---

# 📎 Appendix

<div mt-4 op70>
Streaming & WebSockets over the bridge
</div>

<!-- Appendix, for Q&A: how the same bridge idea carries streaming responses and WebSocket sessions. -->

---

# Streaming responses: `more_body`

<div mt-1 text-lg>

`StreamingResponse` / SSE: the body arrives **in chunks over time** — buffering breaks them *(concept)*:

</div>

```py {*|3-6|7-8|*}{maxHeight:'240px'}
async def send(event):
    if event["type"] == "http.response.start":
        # → tell JS: status & headers are ready; open a ReadableStream
        js_stream.start(event["status"], event["headers"])
    elif event["type"] == "http.response.body":
        js_stream.enqueue(event.get("body", b""))   # → push chunk to JS now
        if not event.get("more_body", False):
            js_stream.close()                        # → end of response
```

<div v-click="4" mt-4 text-lg text-center>

Chunk → JS `ReadableStream` **as it's sent** — token streams work in-browser 📡

</div>

<!-- The dispatch from the main talk buffers the whole response and returns it at the end. That works — until the app uses StreamingResponse or server-sent events. Think progress updates, or a chatbot streaming tokens one at a time; Gradio's UI leans on this heavily. If you buffer, the user sees nothing until everything is done. The fix is to respect more_body. On response.start we immediately open a JavaScript ReadableStream. Each body event gets enqueued to JS right away, and when more_body goes false we close the stream. The JS side consumes it exactly like a real fetch — and streaming UIs just work, entirely in the page. This slide is the concept version; the production ones also deal with backpressure. -->

---

# WebSocket: an awaitable receive queue

<div mt-1 text-lg>

JS pushes *whenever* · the app `await`s — **`asyncio.Queue` bridges push → pull**:

</div>

```py {*|3|5-7|9-10|*}{maxHeight:'300px'}
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
🟦 JS: <code>on_js_message</code> — <b>fire-and-forget</b>
</div>
<div border="~ emerald/40 rounded-lg" p-3 bg-emerald:8>
🐍 App: <code>await receive()</code> — <b>suspends until a message</b>
</div>

</div>

<style>
* {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 1.45;
}
</style>

<!-- WebSockets are trickier because they're long-lived and the timing is inverted. JavaScript receives messages whenever the network feels like it — push-driven, fire-and-forget. But the ASGI app is pull-driven; it awaits receive, expecting the next message handed to it. So we connect a push world to a pull world, and the classic tool is an asyncio.Queue. JS drops events in without awaiting; the app's receive awaits queue.get and suspends until something shows up. The queue absorbs the timing mismatch — this little buffer is the heart of in-browser WebSockets. -->

---

# WebSocket: the session lifecycle

<div mt-2 text-lg>

Same `receive` / `send` — **new event names**:

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

<div v-click="4" mt-4 text-lg text-center>

Same shape as HTTP — **only events & lifetime differ** 🔁

</div>

<!-- And the rest of the dance, expressed through the same receive and send. On open we enqueue websocket.connect; the app answers websocket.accept and we tell the JS socket it's open. Each message: the app receives websocket.receive, replies websocket.send, we post it out. Either side can end it — the app sends close, or JS disconnects and we feed the app websocket.disconnect. The point: it's the exact same receive-slash-send loop as HTTP. Only the event names and the lifetime differ. One mental model covers both — which is exactly why it lives comfortably in an appendix. -->
